import type { NextApiRequest, NextApiResponse } from 'next';
import * as Client from '@web3-storage/w3up-client';
import { StoreMemory } from '@web3-storage/w3up-client/stores/memory';
import * as Proof from '@web3-storage/w3up-client/proof';
import { Signer } from '@web3-storage/w3up-client/principal/ed25519';
import User from '@/models/User';
import dbConnect from '@/utils/dbConnect';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await dbConnect();
    const { uid, conversations } = req.body;

    if (!uid || !conversations) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    console.log('🔄 Processing upload for user:', uid);

    // Initialize client with specific private key
    const principal = Signer.parse(process.env.W3_ADMIN_KEY!);
    const store = new StoreMemory();
    const client = await Client.create({ principal, store });
    console.log('👤 Created client');

    // Add proof for space access
    const proof = await Proof.parse(process.env.W3_ADMIN_PROOF!);
    const space = await client.addSpace(proof);
    await client.setCurrentSpace(space.did());
    console.log('🎫 Added space proof');

    // Create and upload conversations file
    const blob = new Blob([JSON.stringify(conversations)], { 
      type: 'application/json' 
    });
    const file = new File([blob], `${uid}-conversations.json`);
    const cid = await client.uploadFile(file);
    console.log('📦 Uploaded with CID:', cid.toString());

    // Update user record with new CID
    await User.findOneAndUpdate(
      { uid },
      { $push: { conversation_cids: cid.toString() } },
      { upsert: true }
    );
    console.log('💾 Updated user record');

    return res.status(200).json({
      success: true,
      cid: cid.toString(),
      url: `https://${cid}.ipfs.w3s.link`
    });

  } catch (error: any) {
    console.error('❌ Upload error:', error);
    return res.status(500).json({ 
      error: 'Failed to upload',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
