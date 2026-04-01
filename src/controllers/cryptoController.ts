import { Request, Response } from 'express';
import { verifySignature, derivePDA, isValidSolanaAddress } from '../utils/solana';

export async function verifyOwnership(req: Request, res: Response) {
  const { address, message, signature } = req.body;

  if (!isValidSolanaAddress(address)) {
    return res.status(400).json({ error: 'Invalid address' });
  }

  const valid = verifySignature(address, message, signature);
  return res.status(200).json({ valid });
}

export async function getPDA(req: Request, res: Response) {
  const { programId, seeds } = req.body;

  if (!isValidSolanaAddress(programId)) {
    return res.status(400).json({ error: 'Invalid programId' });
  }

  try {
    const { pda, bump } = derivePDA(programId, seeds);
    return res.status(200).json({ pda, bump });
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
}
