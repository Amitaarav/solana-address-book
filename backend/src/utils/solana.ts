import { PublicKey } from '@solana/web3.js';
import nacl from 'tweetnacl';
import bs58 from 'bs58';

export const TOKEN_PROGRAM = new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA');
export const ASSOCIATED_TOKEN_PROGRAM = new PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL');

// Configurable RPC & Network from environment variables
export const SOLANA_NETWORK = process.env.SOLANA_NETWORK || 'devnet';
export const SOLANA_RPC_URL = process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com';

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

export function deriveATA(ownerAddress: string, mintAddress: string): string {
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
    const signatureBytes = bs58.decode(signature);

    if (signatureBytes.length !== 64 || pubkey.length !== 32) {
      return false;
    }

    const messageBytes = Buffer.from(message, 'utf8');

    // 1. First attempt: standard raw message verification
    const isDirectMatch = nacl.sign.detached.verify(messageBytes, signatureBytes, pubkey);
    if (isDirectMatch) return true;

    // 2. Second attempt: Solana Off-Chain Message format (SIP-0004 / Phantom / Solflare standard)
    // Prefix: \xffsolana offchain\n\x00\x00 + 2-byte little-endian length + message
    const prefix = Buffer.from('\xffsolana offchain\n\x00\x00', 'utf8');
    const lengthBuffer = Buffer.alloc(2);
    lengthBuffer.writeUInt16LE(messageBytes.length, 0);
    const framedMessage = Buffer.concat([prefix, lengthBuffer, messageBytes]);

    return nacl.sign.detached.verify(framedMessage, signatureBytes, pubkey);
  } catch {
    return false;
  }
}

export function derivePDA(programId: string, seeds: string[]): { pda: string; bump: number } {
  const programPubkey = new PublicKey(programId);

  const seedBuffers = seeds.map(seed => {
    // If the seed is a valid base58 public key, use its decoded 32 bytes
    if (isValidSolanaAddress(seed)) {
      try {
        return new PublicKey(seed).toBuffer();
      } catch {
        // Fall back to utf-8
      }
    }

    const buffer = Buffer.from(seed, 'utf8');
    if (buffer.length > 32) {
      throw new Error(`Seed "${seed}" exceeds 32 bytes limit`);
    }
    return buffer;
  });
  
  const [pda, bump] = PublicKey.findProgramAddressSync(seedBuffers, programPubkey);

  return { pda: pda.toBase58(), bump };
}

