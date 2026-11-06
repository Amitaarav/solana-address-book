import { useState, useEffect, useCallback } from 'react';
import { Contact, ToastMessage } from '../types';
import { API_BASE } from '../lib/api';

export function useContacts() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((text: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Math.random().toString(36).slice(2, 9);
    setToasts((prev) => [...prev, { id, text, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  const copyToClipboard = useCallback((text: string) => {
    navigator.clipboard.writeText(text);
    addToast('Address copied to clipboard', 'success');
  }, [addToast]);

  const fetchContacts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/contacts`);
      if (!res.ok) throw new Error('Failed to fetch contacts');
      const data = await res.json();
      setContacts(data);
    } catch (err: any) {
      addToast(err.message || 'Error fetching contacts', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  const createContact = async (payload: { name: string; address: string }): Promise<boolean> => {
    try {
      const res = await fetch(`${API_BASE}/contacts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create contact');
      }

      setContacts((prev) => [data, ...prev]);
      addToast(`Added "${data.name}" to directory`, 'success');
      return true;
    } catch (err: any) {
      addToast(err.message, 'error');
      return false;
    }
  };

  const updateContact = async (id: number, name: string): Promise<boolean> => {
    try {
      const res = await fetch(`${API_BASE}/contacts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update contact');
      }

      setContacts((prev) => prev.map((c) => (c.id === id ? data : c)));
      addToast(`Updated label to "${data.name}"`, 'success');
      return true;
    } catch (err: any) {
      addToast(err.message, 'error');
      return false;
    }
  };

  const deleteContact = async (id: number): Promise<boolean> => {
    try {
      const res = await fetch(`${API_BASE}/contacts/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete contact');
      }

      setContacts((prev) => prev.filter((c) => c.id !== id));
      addToast('Contact removed from directory', 'success');
      return true;
    } catch (err: any) {
      addToast(err.message, 'error');
      return false;
    }
  };

  return {
    contacts,
    loading,
    toasts,
    fetchContacts,
    createContact,
    updateContact,
    deleteContact,
    copyToClipboard,
  };
}

