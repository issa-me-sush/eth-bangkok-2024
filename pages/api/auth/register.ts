import type { NextApiRequest, NextApiResponse } from 'next'
import dbConnect from '../../../utils/dbConnect';
import User from '../../../models/User';

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
    await dbConnect();
    const { walletAddress, uid } = req.body

    if (!walletAddress || !uid) {
      return res.status(400).json({ 
        success: false, 
        error: 'Wallet address and UID are required' 
      })
    }

    // Create new user
    const user = await User.create({
      uid,
      walletAddress,
      isSetupCompleted: true
    });
    console.log("user registeration successful" , user)
    return res.status(200).json({ 
      success: true, 
      message: 'User registered successfully' 
    })
  } catch (error: any) {
    console.error('Registration error:', error)
    // Handle duplicate key errors
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'User already exists'
      })
    }
    return res.status(500).json({ 
      success: false, 
      error: 'Failed to register user' 
    })
  }
} 