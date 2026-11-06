import { Contact, ContactType, CreateContactRequest, UpdateContactRequest } from '../types/index.js';
import { isPDA, isValidSolanaAddress } from '../utils/solana.js';

class ContactService {
  private static readonly MAX_CAPACITY = 500;
  private contacts: Contact[] = [
    {
      id: 1,
      name: 'Treasury Cold Wallet',
      address: '7YttH9vL49i5W64eW4K9d3wA9z88v4UqH9mJ8p5kK3d2',
      type: 'wallet',
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    },
    {
      id: 2,
      name: 'USDC Vault PDA',
      address: 'Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr',
      type: 'pda',
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
    {
      id: 3,
      name: 'Operations Multisig Signer',
      address: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
      type: 'wallet',
      createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    }
  ];
  private nextId = 4;

  async createContact(data: CreateContactRequest): Promise<Contact> {
    if (this.contacts.length >= ContactService.MAX_CAPACITY) {
      throw new Error(`Directory capacity limit reached (max ${ContactService.MAX_CAPACITY} contacts)`);
    }

    if (this.contacts.some(c => c.address === data.address)) {
      throw new Error('Conflict: Address already exists');
    }

    if (!isValidSolanaAddress(data.address)) {
      throw new Error('Invalid: Solana address is not valid');
    }

    const type: ContactType = isPDA(data.address) ? 'pda' : 'wallet';
    
    const contact: Contact = {
      id: this.nextId++,
      name: data.name.trim(),
      address: data.address.trim(),
      type,
      createdAt: new Date().toISOString(),
    };

    this.contacts.push(contact);
    return contact;
  }

  async getAllContacts(type?: string): Promise<Contact[]> {
    let filtered = [...this.contacts];
    if (type && (type === 'wallet' || type === 'pda')) {
      filtered = filtered.filter(c => c.type === type);
    }
    return filtered.sort((a, b) => b.id - a.id);
  }

  async getContactById(id: number): Promise<Contact | null> {
    return this.contacts.find(c => c.id === id) || null;
  }

  async updateContact(id: number, data: UpdateContactRequest): Promise<Contact | null> {
    const index = this.contacts.findIndex(c => c.id === id);
    if (index === -1) return null;

    this.contacts[index] = {
      ...this.contacts[index],
      name: data.name.trim(),
    };

    return this.contacts[index];
  }

  async deleteContact(id: number): Promise<boolean> {
    const index = this.contacts.findIndex(c => c.id === id);
    if (index === -1) return false;

    this.contacts.splice(index, 1);
    return true;
  }
}

export const contactService = new ContactService();

