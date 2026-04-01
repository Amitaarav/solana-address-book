import { Request, Response } from 'express';
import { contactService } from '../services/contactService';
import { deriveATA, isValidSolanaAddress } from '../utils/solana';

export async function createContact(req: Request, res: Response) {
  try {
    const contact = await contactService.createContact(req.body);
    return res.status(201).json(contact);
  } catch (error: any) {
    if (error.message.includes('Conflict')) {
      return res.status(409).json({ error: 'Address already exists' });
    }
    return res.status(400).json({ error: error.message });
  }
}

export async function getAllContacts(req: Request, res: Response) {
  const type = req.query.type as string | undefined;
  const contacts = await contactService.getAllContacts(type);
  return res.status(200).json(contacts);
}

export async function getContactById(req: Request, res: Response) {
  const id = parseInt(req.params.id as string);
  const contact = await contactService.getContactById(id);
  if (!contact) {
    return res.status(404).json({ error: 'Contact not found' });
  }
  return res.status(200).json(contact);
}

export async function updateContact(req: Request, res: Response) {
  const id = parseInt(req.params.id as string);
  const contact = await contactService.updateContact(id, req.body);
  if (!contact) {
    return res.status(404).json({ error: 'Contact not found' });
  }
  return res.status(200).json(contact);
}

export async function deleteContact(req: Request, res: Response) {
  const id = parseInt(req.params.id as string);
  const deleted = await contactService.deleteContact(id);
  if (!deleted) {
    return res.status(404).json({ error: 'Contact not found' });
  }
  return res.status(200).json({ message: 'Contact deleted' });
}

export async function deriveATAForContact(req: Request, res: Response) {
  const id = parseInt(req.params.id as string);
  const { mintAddress } = req.body;

  if (!isValidSolanaAddress(mintAddress)) {
    return res.status(400).json({ error: 'Invalid mint address' });
  }

  const contact = await contactService.getContactById(id);
  if (!contact) {
    return res.status(404).json({ error: 'Contact not found' });
  }

  try {
    const ata = deriveATA(contact.address, mintAddress);
    return res.status(200).json({
      ata,
      owner: contact.address,
      mint: mintAddress,
    });
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
}
