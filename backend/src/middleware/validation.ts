import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

export const validate = (schema: z.ZodTypeAny) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      return next();
    } catch (error: any) {
      const issue = error?.issues?.[0];
      const message = issue ? issue.message : 'Invalid request payload';
      return res.status(400).json({ error: message, issues: error?.issues });
    }
  };
};

export const contactSchema = z.object({
  body: z.object({
    name: z.string().trim().min(1, 'Name is required').max(64, 'Name must not exceed 64 characters'),
    address: z.string().trim().min(32, 'Solana address must be at least 32 characters').max(44, 'Solana address must not exceed 44 characters'),
  }),
});

export const updateContactSchema = z.object({
  body: z.object({
    name: z.string().trim().min(1, 'Name is required').max(64, 'Name must not exceed 64 characters'),
  }),
});

export const ataSchema = z.object({
  body: z.object({
    mintAddress: z.string().trim().min(32, 'Mint address must be at least 32 characters').max(44, 'Mint address must not exceed 44 characters'),
  }),
});

export const verifyOwnershipSchema = z.object({
  body: z.object({
    address: z.string().trim().min(32, 'Address must be at least 32 characters').max(44, 'Address must not exceed 44 characters'),
    message: z.string().min(1, 'Message payload is required').max(2048, 'Message payload exceeds 2KB limit'),
    signature: z.string().trim().min(64, 'Signature is too short').max(128, 'Signature is too long'),
  }),
});

export const derivePDASchema = z.object({
  body: z.object({
    programId: z.string().trim().min(32, 'Program ID is too short').max(44, 'Program ID is too long'),
    seeds: z
      .array(z.string().min(1, 'Seed cannot be empty').max(32, 'Individual seed exceeds Solana 32-byte limit'))
      .min(1, 'At least one seed is required')
      .max(16, 'Solana runtime permits a maximum of 16 seeds'),
  }),
});

