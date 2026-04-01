import { PublicKey } from '@solana/web3.js';
import nacl from 'tweetnacl';
import bs58 from 'bs58';

export const TOKEN_PROGRAM = new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA');
export const ASSOCIATED_TOKEN_PROGRAM = new PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL');

export function isValidSolanaAddress(address: string): boolean {
  try {
    new PublicKey(address);
    return true;
  } catch {
    return false;
  }
}

export function isPDA(address: string): boolean {
  try {
    const pubkey = new PublicKey(address);
    return !PublicKey.isOnCurve(pubkey.toBytes());
  } catch {
    return false;
  }
}

export function deriveATA(ownerAddress: string, mintAddress: string) {
  const ownerPubkey = new PublicKey(ownerAddress);
  const mintPubkey = new PublicKey(mintAddress);
  
  const [ata] = PublicKey.findProgramAddressSync(
    [
      ownerPubkey.toBuffer(),
      TOKEN_PROGRAM.toBuffer(),
      mintPubkey.toBuffer(),
    ],
    ASSOCIATED_TOKEN_PROGRAM
  );
  
  return ata.toBase58();
}

export function verifySignature(address: string, message: string, signature: string): boolean {
  try {
    const pubkey = new PublicKey(address).toBytes();
    const messageBytes = Buffer.from(message, 'utf8');
    const signatureBytes = bs58.decode(signature);
    
    return nacl.sign.detached.verify(messageBytes, signatureBytes, pubkey);
  } catch {
    return false;
  }
}

export function derivePDA(programId: string, seeds: string[]) {
  const programPubkey = new PublicKey(programId);
  const seedBuffers = seeds.map(seed => {
    const buffer = Buffer.from(seed, 'utf8');
    if (buffer.length > 32) {
      throw new Error(`Seed "${seed}" exceeds 32 bytes`);
    }
    return buffer;
  });
  
  const [pda, bump] = PublicKey.findProgramAddressSync(seedBuffers, programPubkey);
  return { pda: pda.toBase58(), bump };
}
