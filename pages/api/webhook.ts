import type { NextApiRequest, NextApiResponse } from 'next'
import dbConnect from '../../utils/dbConnect'
import User from '../../models/User'

// Store last 100 messages in memory
const messageBuffer: any[] = []

async function analyzeContentForTags(content: string): Promise<string[]> {
  console.log('🏷️ Starting tag analysis for content:', content.substring(0, 100) + '...');
  try {
    const response = await fetch("https://api.red-pill.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.NEXT_PUBLIC_REDPILL_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "model": "gpt-4o",
        "messages": [{
          "role": "user",
          "content": `Analyze this conversation and return ONLY an array of relevant tags from this list: anime, football, cricket, art, therapy, music, travel, food, gardening, dance, tech, web3, shows-movies, night-life, gaming, student. 
          Content: ${content}`
        }]
      })
    });

    const data = await response.json();
    const tags = JSON.parse(data.choices[0].message.content);
    console.log('✅ Tags analyzed successfully:', tags);
    return tags;
  } catch (error) {
    console.error('❌ Tag analysis error:', error);
    return [];
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log('📥 Webhook received:', req.method, 'request');
  
  // Set CORS and cache control headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST')
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate')
  res.setHeader('Pragma', 'no-cache')
  res.setHeader('Expires', '0')

  if (req.method === 'POST') {
    try {
      const { uid } = req.query;
      console.log('👤 Processing request for UID:', uid);
      
      const memory = req.body;
      
      if (!uid) {
        return res.status(400).json({ error: 'UID is required' });
      }

      await dbConnect();

      // Analyze content for tags
      const contentToAnalyze = `${memory.transcript} ${memory.structured.overview}`;
      const newTags = await analyzeContentForTags(contentToAnalyze);

      console.log('💾 Updating user tags:', newTags);
      await User.findOneAndUpdate(
        { uid },
        { $addToSet: { tags: { $each: newTags } } },
        { upsert: false }
      );

      // Store in message buffer with uid
      messageBuffer.push({
        ...memory,
        uid,
        timestamp: Date.now()
      });

      console.log('📦 Message added to buffer. Current size:', messageBuffer.length);
      
      // Keep only last 100 messages
      if (messageBuffer.length > 100) {
        messageBuffer.shift();
      }

      return res.status(200).json({ status: 'success', tags: newTags });
    } catch (error) {
      console.error('❌ Error:', error);
      return res.status(500).json({ error: 'Internal error' });
    }
  }

  if (req.method === 'GET') {
    const { uid } = req.query;
    console.log('🔍 Retrieving messages for UID:', uid || 'all');
    // Return messages filtered by uid if provided
    const messages = uid 
      ? messageBuffer.filter(msg => msg.uid === uid)
      : messageBuffer;
    return res.status(200).json(messages);
  }
} 