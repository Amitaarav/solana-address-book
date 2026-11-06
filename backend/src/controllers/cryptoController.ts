import { Request, Response } from 'express';
import {
  verifySignature,
  derivePDA,
  isValidSolanaAddress,
  isPDA,
  SOLANA_NETWORK,
  SOLANA_RPC_URL,
} from '../utils/solana.js';

export async function verifyOwnership(req: Request, res: Response) {
  const { address, message, signature } = req.body;

  if (!isValidSolanaAddress(address)) {
    return res.status(400).json({ error: 'Invalid Solana signer address' });
  }

  const valid = verifySignature(address, message, signature);
  return res.status(200).json({
    valid,
    address,
    message,
    verifiedAt: new Date().toISOString(),
  });
}

export async function getPDA(req: Request, res: Response) {
  const { programId, seeds } = req.body;

  if (!isValidSolanaAddress(programId)) {
    return res.status(400).json({ error: 'Invalid Program ID public key' });
  }

  try {
    const { pda, bump } = derivePDA(programId, seeds);
    return res.status(200).json({
      pda,
      bump,
      programId,
      seeds,
      isOffCurve: isPDA(pda),
    });
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
}

export async function checkAddress(req: Request, res: Response) {
  const address = req.query.address as string;
  if (!address || !isValidSolanaAddress(address)) {
    return res.status(400).json({ valid: false, error: 'Invalid Solana address' });
  }

  const offCurve = isPDA(address);
  return res.status(200).json({
    valid: true,
    address,
    type: offCurve ? 'pda' : 'wallet',
    isOnCurve: !offCurve,
  });
}

