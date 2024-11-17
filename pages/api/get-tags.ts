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
      return res.status(200).json({ tags: [] });
    }

    console.log('🔍 Fetching tags for wallet:', walletAddress);

    const user = await User.findOne(
      { walletAddress: walletAddress.toString() },
      'tags -_id'
    );

    return res.status(200).json({ 
      tags: user?.tags || []
    });

  } catch (error) {
    console.error('❌ Error:', error);
    return res.status(200).json({ 
      tags: []
    });
  }
}
