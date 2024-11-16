import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/utils/dbConnect';
import User from '@/models/User';
import { getAddress } from 'viem';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await dbConnect();
    const { walletAddress } = req.query;

    if (!walletAddress) {
      return res.status(400).json({ error: 'Wallet address is required' });
    }

    console.log('🔍 Fetching tags for wallet:', walletAddress);

    const user = await User.findOne(
      { walletAddress: walletAddress.toString() },
      'tags -_id' // Only return tags field, exclude _id
    );

    if (!user) {
      console.log('⚠️ No user found for wallet:', walletAddress);
      return res.status(200).json({ tags: [] });
    }

    console.log('✅ Found tags:', user.tags);
    return res.status(200).json({ tags: user.tags });

  } catch (error) {
    console.error('❌ Error fetching tags:', error);
    return res.status(500).json({ error: 'Failed to fetch tags' });
  }
}
