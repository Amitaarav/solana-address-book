import { Contact, ContactType, CreateContactRequest, UpdateContactRequest } from '../types';
import { isPDA, isValidSolanaAddress } from '../utils/solana';

class ContactService {
  private contacts: Contact[] = [];
  private nextId = 1;

  async createContact(data: CreateContactRequest): Promise<Contact> {
    if (this.contacts.some(c => c.address === data.address)) {
      throw new Error('Conflict: Address already exists');
    }

    if (!isValidSolanaAddress(data.address)) {
      throw new Error('Invalid: Solana address is not valid');
    }

    const type: ContactType = isPDA(data.address) ? 'pda' : 'wallet';
    const contact: Contact = {
      id: this.nextId++,
      name: data.name,
      address: data.address,
      type,
      createdAt: new Date().toISOString(),
    };

    this.contacts.push(contact);
    return contact;
  }

  async getAllContacts(type?: string): Promise<Contact[]> {
    let filtered = [...this.contacts];
    if (type) {
      filtered = filtered.filter(c => c.type === type);
    }
    return filtered.sort((a, b) => a.id - b.id);
  }

  async getContactById(id: number): Promise<Contact | null> {
    return this.contacts.find(c => c.id === id) || null;
  }

  async updateContact(id: number, data: UpdateContactRequest): Promise<Contact | null> {
    const index = this.contacts.findIndex(c => c.id === id);
    if (index === -1) return null;

    this.contacts[index] = {
      ...this.contacts[index],
      name: data.name,
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
