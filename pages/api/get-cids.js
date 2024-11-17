import User from '../../models/User';
import dbConnect from '../../utils/dbConnect';

export default async function handler(req, res) {
  const { walletAddress } = req.query;
  
  if (!walletAddress) {
    return res.status(400).json({ error: 'Wallet address is required' });
  }

  try {
    await dbConnect(); // Connect to MongoDB

    const user = await User.findOne({ walletAddress });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get conversation_cids from user document
    const cids = user.conversation_cids || [];
    
    console.log('Found CIDs for user:', cids); // Debug log
    return res.status(200).json({ cids });

  } catch (error) {
    console.error('Failed to fetch CIDs:', error);
    return res.status(500).json({ error: 'Failed to fetch CIDs' });
  }
} 