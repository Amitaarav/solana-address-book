import React, { useState, useEffect } from 'react';
import { Contact } from '../types';

interface EditContactModalProps {
  contact: Contact | null;
  onClose: () => void;
  onSubmit: (id: number, name: string) => Promise<boolean>;
}

export const EditContactModal: React.FC<EditContactModalProps> = ({
  contact,
  onClose,
  onSubmit,
}) => {
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (contact) {
      setName(contact.name);
    }
  }, [contact]);

  if (!contact) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);
    const success = await onSubmit(contact.id, name.trim());
    setSubmitting(false);

    if (success) {
      onClose();
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Update Contact Label</h3>
          <button className="btn btn-ghost btn-icon" onClick={onClose} aria-label="Close dialog">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-group">
            <label>Address</label>
            <input type="text" className="font-mono" value={contact.address} disabled />
          </div>

          <div className="form-group">
            <label htmlFor="edit-name-input">New Label</label>
            <input
              id="edit-name-input"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
              autoComplete="off"
            />
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Updating...' : 'Update Name'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

