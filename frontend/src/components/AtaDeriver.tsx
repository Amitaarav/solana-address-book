import React, { useState } from 'react';
import { Contact, AtaResult } from '../types';
import { API_BASE } from '../lib/api';

interface AtaDeriverProps {
  contacts: Contact[];
  initialOwner?: string;
  onCopy: (text: string) => void;
}

const PRESET_MINTS = [
  { symbol: 'USDC', mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v' },
  { symbol: 'USDT', mint: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB' },
  { symbol: 'WSOL', mint: 'So11111111111111111111111111111111111111112' },
  { symbol: 'BONK', mint: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263' },
];

export const AtaDeriver: React.FC<AtaDeriverProps> = ({
  contacts,
  initialOwner = '',
  onCopy,
}) => {
  const [owner, setOwner] = useState(initialOwner);
  const [mint, setMint] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AtaResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);

  const handleDerive = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!owner.trim() || !mint.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Find if owner is in contacts to use `/contacts/:id/derive-ata` or client-side calculation
      const matchedContact = contacts.find((c) => c.address === owner.trim());
      
      let res;
      if (matchedContact) {
        res = await fetch(`${API_BASE}/contacts/${matchedContact.id}/derive-ata`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mintAddress: mint.trim() }),
        });
      } else {
        // Fall back to deriving PDA via the standard ATA seeds
        // Seeds for ATA: [owner, TOKEN_PROGRAM, mint]
        res = await fetch(`${API_BASE}/derive-pda`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            programId: 'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL',
            seeds: [owner.trim(), 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA', mint.trim()],
          }),
        });
      }

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to derive ATA');
      }

      setResult({
        ata: data.ata || data.pda,
        owner: owner.trim(),
        mint: mint.trim(),
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tab-view">
      <div className="tool-card">
        <div className="tool-header">
          <h2>Derive Associated Token Account (ATA)</h2>
          <p>Calculate the deterministic token account address for any wallet or PDA across standard SPL token mints.</p>
        </div>

        <form onSubmit={handleDerive} className="tool-form">
          <div className="form-group">
            <label htmlFor="ata-owner-input">Owner Public Key</label>
            <div className="input-with-action">
              <input
                id="ata-owner-input"
                type="text"
                placeholder="Base58 Solana address..."
                className="font-mono"
                value={owner}
                onChange={(e) => setOwner(e.target.value)}
                required
                spellCheck="false"
              />
              {contacts.length > 0 && (
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setPickerOpen(true)}
                >
                  Pick Contact
                </button>
              )}
            </div>
            <span className="field-hint">The wallet or off-curve PDA that will own the token account.</span>
          </div>

          <div className="form-group">
            <label htmlFor="ata-mint-input">Token Mint Address</label>
            <input
              id="ata-mint-input"
              type="text"
              placeholder="e.g. EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"
              className="font-mono"
              value={mint}
              onChange={(e) => setMint(e.target.value)}
              required
              spellCheck="false"
            />
            <div className="quick-presets">
              <span className="preset-label">Quick select:</span>
              {PRESET_MINTS.map((p) => (
                <button
                  key={p.symbol}
                  type="button"
                  className="chip"
                  onClick={() => setMint(p.mint)}
                >
                  {p.symbol}
                </button>
              ))}
            </div>
          </div>

          {error && <div className="badge badge-invalid">{error}</div>}

          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              <span>{loading ? 'Calculating...' : 'Derive ATA Address'}</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </button>
          </div>
        </form>

        {result && (
          <div className="tool-result-box">
            <div className="result-header">
              <span className="result-title">Derived Associated Token Account</span>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => onCopy(result.ata)}
              >
                Copy Address
              </button>
            </div>
            <div className="result-value font-mono">{result.ata}</div>
            <div className="result-details">
              <div className="detail-row">
                <span className="detail-label">Derivation Seeds:</span>
                <span className="detail-code font-mono">[ownerAddress, TOKEN_PROGRAM_ID, mintAddress]</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Program ID:</span>
                <span className="detail-code font-mono">ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Contact Picker Modal */}
      {pickerOpen && (
        <div className="modal-backdrop" onClick={() => setPickerOpen(false)}>
          <div className="modal-panel modal-panel-md" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Select Contact from Directory</h3>
              <button className="btn btn-ghost btn-icon" onClick={() => setPickerOpen(false)}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="modal-body picker-body">
              <div className="picker-list">
                {contacts.map((c) => (
                  <div
                    key={c.id}
                    className="picker-item"
                    onClick={() => {
                      setOwner(c.address);
                      setPickerOpen(false);
                    }}
                  >
                    <div>
                      <div className="font-bold">{c.name}</div>
                      <div className="font-mono text-tertiary" style={{ fontSize: '11px' }}>
                        {c.address}
                      </div>
                    </div>
                    <span className={`badge ${c.type === 'wallet' ? 'badge-wallet' : 'badge-pda'}`}>
                      {c.type}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

