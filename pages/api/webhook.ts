import type { NextApiRequest, NextApiResponse } from 'next'

// Store last 100 messages in memory
const messageBuffer: any[] = []

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Set CORS and cache control headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST')
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate')
  res.setHeader('Pragma', 'no-cache')
  res.setHeader('Expires', '0')

  if (req.method === 'POST') {
    try {
      const memory = req.body
      console.log('💾 New message received:', JSON.stringify(memory, null, 2))

      messageBuffer.push({
        ...memory,
        timestamp: Date.now()
      })

      // Keep only last 100 messages
      if (messageBuffer.length > 100) {
        messageBuffer.shift()
      }

      return res.status(200).json({ status: 'success' })
    } catch (error) {
      console.error('❌ Error:', error)
      return res.status(500).json({ error: 'Internal error' })
    }
  }

  if (req.method === 'GET') {
    // Return all messages in buffer
    return res.status(200).json(messageBuffer)
  }
} 