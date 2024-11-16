import type { NextApiRequest, NextApiResponse } from 'next';
import * as Client from '@web3-storage/w3up-client';
import { StoreMemory } from '@web3-storage/w3up-client/stores/memory';
import * as Proof from '@web3-storage/w3up-client/proof';
import { Signer } from '@web3-storage/w3up-client/principal/ed25519';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Log env variables (redacted)
    console.log('ENV Check:', {
      key: process.env.W3_ADMIN_KEY?.slice(0, 10) + '...',
      proof: process.env.W3_ADMIN_PROOF?.slice(0, 10) + '...'
    });

    // Initialize client
    const principal = Signer.parse(process.env.W3_ADMIN_KEY!);
    const store = new StoreMemory();
    const client = await Client.create({ principal, store });
    console.log('👤 Client DID:', principal.did());

    // Parse and add proof
    const proof = await Proof.parse(process.env.W3_ADMIN_PROOF!);
    const space = await client.addSpace(proof);
    console.log('🎫 Space DID:', space.did());
    
    // Set current space
    await client.setCurrentSpace(space.did());

    // Create simplest possible test file
    const blob = new Blob(['hello'], { 
      type: 'text/plain' 
    });
    const file = new File([blob], 'hello.txt');

    // Try upload
    console.log('📤 Attempting upload...');
    const cid = await client.uploadFile(file);
    console.log('✅ Success! CID:', cid.toString());

    return res.status(200).json({
      success: true,
      cid: cid.toString(),
      url: `https://${cid}.ipfs.w3s.link`
    });

  } catch (error: any) {
    console.error('❌ Error:', {
      message: error.message,
      cause: error.cause?.message
    });
    return res.status(500).json({ error: error.message, cause: error.cause });
  }
}