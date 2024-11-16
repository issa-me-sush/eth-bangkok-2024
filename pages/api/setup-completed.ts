import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../utils/dbConnect';
import User from '../../models/User';

type Data = {
  is_setup_completed: boolean;
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ is_setup_completed: false, error: 'Method not allowed' });
  }

  try {
    await dbConnect();
    const { uid } = req.query;

    if (!uid) {
      return res.status(400).json({
        is_setup_completed: false,
        error: 'UID is required'
      });
    }

    const user = await User.findOne({ uid });
    
    return res.status(200).json({
      is_setup_completed: !!user?.isSetupCompleted
    });
  } catch (error) {
    console.error('Setup completed check error:', error);
    return res.status(500).json({
      is_setup_completed: false,
      error: 'Failed to check setup status'
    });
  }
} 