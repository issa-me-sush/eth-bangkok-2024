import { NextApiRequest, NextApiResponse } from 'next';
import User from '@/models/User';
import dbConnect from '@/utils/dbConnect';

interface Segment {
  text: string;
  speaker: string;
  speaker_id: number;
  is_user: boolean;
  person_id: null | string;
  start: number;
  end: number;
}

interface SessionBuffer {
  segments: Segment[];
  lastProcessed: number;
}

// Store sessions and their segments
const sessionBuffers: Map<string, SessionBuffer> = new Map();
const BATCH_SIZE = 30;

async function analyzeContentForTags(segments: Segment[]): Promise<string[]> {
  if (!Array.isArray(segments) || segments.length === 0) return [];
  
  try {
    const fullConversation = segments
      .filter(s => s && s.text?.trim())
      .map(s => s.text)
      .join(' ');

    console.log('📝 Full conversation to analyze:', fullConversation);
    
    const response = await fetch("https://api.red-pill.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.REDPILL_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "model": "gpt-4o",
        "messages": [
          {
            "role": "system",
            "content": `You are a precise tag analyzer. Return ONLY a JSON array of relevant tags from this list: ["anime", "football", "cricket", "art", "therapy", "music", "travel", "food", "gardening", "dance", "tech", "web3", "shows-movies", "night-life", "gaming", "student"]. Only include tags that are strongly discussed, ignore casual mentions. If none match, return empty array []`
          },
          {
            "role": "user",
            "content": fullConversation
          }
        ]
      })
    });

    const data = await response.json();
    console.log('🤖 Red Pill API raw response:', JSON.stringify(data, null, 2));

    // Extract content from the correct path in response
    const aiContent = data.choices[0].message.content;
    console.log('🎯 AI content:', aiContent);

    let tags: string[] = [];
    try {
      // If the AI returned a proper array string, parse it
      if (aiContent.trim().startsWith('[') && aiContent.trim().endsWith(']')) {
        tags = JSON.parse(aiContent);
      } else {
        console.warn('⚠️ AI response not in expected array format:', aiContent);
        return [];
      }
    } catch (parseError) {
      console.error('⚠️ Failed to parse tags:', parseError);
      return [];
    }

    // Validate tags against allowed list
    const validTags = tags.filter(tag => 
      User.schema.paths.tags.options.enum.includes(tag)
    );

    console.log('✅ Final validated tags:', validTags);
    return validTags;
  } catch (error) {
    console.error('❌ AI Tag analysis error:', error);
    return [];
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log('📥 Webhook received:', req.method, 'request');
  
  if (req.method === 'POST') {
    try {
      const { uid } = req.query;
      const { segments, session_id } = req.body;
      
      console.log('🎯 Processing message:', {
        uid,
        session_id,
        segmentCount: segments?.length,
        text: segments?.[0]?.text
      });

      // Skip empty segments
      if (!segments?.[0]?.text?.trim()) {
        return res.status(200).json({ status: 'success', message: 'Empty segment skipped' });
      }

      // Get or create session buffer
      let sessionBuffer = sessionBuffers.get(session_id);
      if (!sessionBuffer) {
        sessionBuffer = {
          segments: [],
          lastProcessed: Date.now()
        };
        sessionBuffers.set(session_id, sessionBuffer);
      }

      // Add new segments
      sessionBuffer.segments.push(...segments);
      console.log('📦 Session buffer size:', sessionBuffer.segments.length);

      // Process if we have enough segments
      if (sessionBuffer.segments.length >= BATCH_SIZE) {
        console.log('🔄 Processing batch of messages');
        const batchToProcess = sessionBuffer.segments.slice(0, BATCH_SIZE);
        
        const newTags = await analyzeContentForTags(batchToProcess);
        console.log('🏷️ Generated tags:', newTags);

        if (newTags.length > 0) {
          try {
            // Get the host from the environment or use localhost for development
            const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
            
            // Call the separate tag update API with full URL
            const updateResponse = await fetch(`${baseUrl}/api/update-tags`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                uid,
                tags: newTags
              })
            });

            if (!updateResponse.ok) {
              console.warn('⚠️ Tag update API call failed');
            }
          } catch (error) {
            console.error('❌ Tag update error:', error);
            // Continue processing even if update fails
          }
        }

        // Update IPNS with the complete conversation
        try {
          const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
          const ipnsResponse = await fetch(`${baseUrl}/api/update-ipns`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              uid,
              conversations: batchToProcess
            })
          });

          if (!ipnsResponse.ok) {
            throw new Error('IPNS update failed');
          }

          const ipnsResult = await ipnsResponse.json();
          console.log('💾 Updated IPNS:', ipnsResult);
        } catch (error) {
          console.error('❌ IPNS update error:', error);
          // Continue processing even if IPNS update fails
        }

        // Remove processed segments
        sessionBuffer.segments = sessionBuffer.segments.slice(BATCH_SIZE);
        sessionBuffer.lastProcessed = Date.now();
      }

      // Cleanup old sessions (keep last 10)
      if (sessionBuffers.size > 10) {
        const oldestKey = sessionBuffers.keys().next().value;
        if (oldestKey) {
          sessionBuffers.delete(oldestKey);
          console.log('🧹 Cleaned up old session:', oldestKey);
        }
      }

      return res.status(200).json({ 
        status: 'success',
        bufferedCount: sessionBuffer.segments.length,
        remainingUntilProcess: BATCH_SIZE - sessionBuffer.segments.length
      });

    } catch (error) {
      console.error('❌ Error:', error);
      return res.status(500).json({ error: 'Internal error' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
