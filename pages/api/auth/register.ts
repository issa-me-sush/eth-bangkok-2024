import type { NextApiRequest, NextApiResponse } from 'next'

type Data = {
  success: boolean
  message?: string
  error?: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' })
  }

  try {
    const { walletAddress, uid } = req.body

    if (!walletAddress || !uid) {
      return res.status(400).json({ 
        success: false, 
        error: 'Wallet address and UID are required' 
      })
    }


    // 1. Store the wallet address and UID mapping in your database
    // 2. Return success response to setup_completed_url

   
    return res.status(200).json({ 
      success: true, 
      message: 'User registered successfully' 
    })
  } catch (error) {
    console.error('Registration error:', error)
    return res.status(500).json({ 
      success: false, 
      error: 'Failed to register user' 
    })
  }
} 