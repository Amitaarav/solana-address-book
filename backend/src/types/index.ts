export type ContactType = 'wallet' | 'pda';

export interface Contact {
  id: number;
  name: string;
  address: string;
  type: ContactType;
  createdAt: string;
}

export interface CreateContactRequest {
  name: string;
  address: string;
}

export interface UpdateContactRequest {
  name: string;
}

export interface DeriveATARequest {
  mintAddress: string;
}

export interface VerifyOwnershipRequest {
  address: string;
  message: string;
  signature: string;
}

export interface DerivePDARequest {
  programId: string;
  seeds: string[];
}

