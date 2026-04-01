import { Request, Response, NextFunction } from 'express';
import { z, ZodObject } from 'zod';

export const validate = (schema: ZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      return next();
    } catch (error) {
      return res.status(400).json(error);
    }
  };
};

export const contactSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required'),
    address: z.string().min(1, 'Address is required'),
  }),
});

export const updateContactSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required'),
  }),
});

export const ataSchema = z.object({
  body: z.object({
    mintAddress: z.string().min(1, 'Mint address is required'),
  }),
});

export const verifyOwnershipSchema = z.object({
  body: z.object({
    address: z.string().min(1, 'Address is required'),
    message: z.string().min(1, 'Message is required'),
    signature: z.string().min(1, 'Signature is required'),
  }),
});

export const derivePDASchema = z.object({
  body: z.object({
    programId: z.string().min(1, 'Program ID is required'),
    seeds: z.array(z.string()).min(1, 'At least one seed is required'),
  }),
});
