import React, { useState, useEffect } from 'react';

interface AddContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; address: string }) => Promise<boolean>;
}

export const AddContactModal: React.FC<AddContactModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [addressStatus, setAddressStatus] = useState<{
    valid: boolean;
    type?: 'wallet' | 'pda';
    loading?: boolean;
  } | null>(null);

  // Live address validator on debounce
  useEffect(() => {
    const trimmed = address.trim();
    if (!trimmed) {
      setAddressStatus(null);
      return;
    }

    if (trimmed.length < 32 || trimmed.length > 44) {
      setAddressStatus({ valid: false });
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/check-address?address=${encodeURIComponent(trimmed)}`);
        if (res.ok) {
          const data = await res.json();
          setAddressStatus({ valid: true, type: data.type });
        } else {
          setAddressStatus({ valid: false });
        }
      } catch {
        setAddressStatus({ valid: false });
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [address]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !address.trim()) return;

    setSubmitting(true);
    const success = await onSubmit({ name: name.trim(), address: address.trim() });
    setSubmitting(false);

    if (success) {
      setName('');
      setAddress('');
      setAddressStatus(null);
      onClose();
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Register New Address</h3>
          <button className="btn btn-ghost btn-icon" onClick={onClose} aria-label="Close dialog">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-group">
            <label htmlFor="contact-name-input">Contact Identifier / Label</label>
            <input
              id="contact-name-input"
              type="text"
              placeholder="e.g. Treasury Cold Storage, Raydium LP, Alice"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
              autoComplete="off"
            />
          </div>

          <div className="form-group">
            <div className="label-with-badge">
              <label htmlFor="contact-address-input">Solana Public Key (Base58)</label>
              {addressStatus && (
                <span
                  className={`badge ${
                    addressStatus.valid
                      ? addressStatus.type === 'wallet'
                        ? 'badge-wallet'
                        : 'badge-pda'
                      : 'badge-invalid'
                  }`}
                >
                  {addressStatus.valid
                    ? addressStatus.type === 'wallet'
                      ? '● On-curve Wallet'
                      : '● Off-curve PDA'
                    : 'Invalid Base58'}
                </span>
              )}
            </div>
            <input
              id="contact-address-input"
              type="text"
              placeholder="Paste 32-44 char Base58 address..."
              className="font-mono"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
              spellCheck="false"
              autoComplete="off"
            />
            <span className="field-hint">
              Automatically identifies whether the public key is a normal wallet keypair or an off-curve Program Derived Address.
            </span>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting || (addressStatus !== null && !addressStatus.valid)}>
              {submitting ? 'Saving...' : 'Save Address'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

