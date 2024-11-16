import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/utils/dbConnect';
import User from '@/models/User';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await dbConnect();
    const { uid, tags } = req.body;

    console.log('🏷️ Updating tags for user:', uid, tags);

    const updatedUser = await User.findOneAndUpdate(
      { uid },
      { $addToSet: { tags: { $each: tags } } },
      { upsert: true, new: true }
    );

    console.log('✅ Tags updated successfully');
    return res.status(200).json({ success: true, user: updatedUser });
  } catch (error) {
    console.error('❌ Tag update error:', error);
    return res.status(500).json({ error: 'Failed to update tags' });
  }
} 