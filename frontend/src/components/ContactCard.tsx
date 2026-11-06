import React, { useState } from 'react';
import { Contact } from '../types';

interface ContactCardProps {
  contact: Contact;
  onEdit: (contact: Contact) => void;
  onDelete: (id: number) => void;
  onSelectForAta: (address: string) => void;
  onCopy: (text: string) => void;
}

export const ContactCard: React.FC<ContactCardProps> = ({
  contact,
  onEdit,
  onDelete,
  onSelectForAta,
  onCopy,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    onCopy(contact.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const formattedDate = new Date(contact.createdAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="contact-row">
      <div className="contact-name-cell">
        <span className="contact-name-text" title={contact.name}>
          {contact.name}
        </span>
        <span className={`badge ${contact.type === 'wallet' ? 'badge-wallet' : 'badge-pda'}`}>
          {contact.type === 'wallet' ? 'Wallet' : 'PDA'}
        </span>
      </div>

      <div className="contact-address-cell">
        <span className="address-string font-mono" title={contact.address}>
          {contact.address}
        </span>
        <button
          className="btn btn-ghost btn-icon"
          onClick={handleCopy}
          title="Copy address"
          aria-label="Copy public key"
        >
          {copied ? (
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#14F195" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ) : (
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
          )}
        </button>
      </div>

      <div className="contact-date-cell">
        <span>{formattedDate}</span>
      </div>

      <div className="contact-actions-cell">
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => onSelectForAta(contact.address)}
          title="Derive ATA for this address"
        >
          ATA
        </button>
        <button
          className="btn btn-ghost btn-icon"
          onClick={() => onEdit(contact)}
          title="Edit contact name"
          aria-label="Edit contact"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
          </svg>
        </button>
        <button
          className="btn btn-ghost btn-icon"
          onClick={() => onDelete(contact.id)}
          title="Delete contact"
          aria-label="Delete contact"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    </div>
  );
};

