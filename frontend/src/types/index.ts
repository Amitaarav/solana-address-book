export type ContactType = 'wallet' | 'pda';

export interface Contact {
  id: number;
  name: string;
  address: string;
  type: ContactType;
  createdAt: string;
}

export type ActiveTab = 'contacts' | 'ata' | 'verify' | 'pda';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  text: string;
}

export interface AtaResult {
  ata: string;
  owner: string;
  mint: string;
}

export interface VerifyResult {
  valid: boolean;
  address: string;
  message: string;
  verifiedAt: string;
}

export interface PdaResult {
  pda: string;
  bump: number;
  programId: string;
  seeds: string[];
  isOffCurve: boolean;
}

