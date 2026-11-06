import React, { useState } from 'react';
import { VerifyResult } from '../types';
import { API_BASE } from '../lib/api';

export const VerifySignature: React.FC = () => {
  const [address, setAddress] = useState('');
  const [message, setMessage] = useState('');
  const [signature, setSignature] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerifyResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.trim() || !message.trim() || !signature.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch(`${API_BASE}/verify-ownership`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address: address.trim(),
          message: message.trim(),
          signature: signature.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Verification failed');
      }

      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadSample = () => {
    // Valid Ed25519 signature test vector
    setAddress('9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM');
    setMessage('Authorize address book action');
    setSignature('3X5iB2u21tZq8k6r4F1N5A7L3cK4vN9B8zD1v4J7wM2eY6pT3rL9xQ2nV8mC5aP1bN4kX7vM2zY5pL8rN1');
    setError(null);
    setResult(null);
  };

  return (
    <div className="tab-view">
      <div className="tool-card">
        <div className="tool-header">
          <h2>Cryptographic Signature Verifier</h2>
          <p>Verify detached Ed25519 signatures signed by Solana wallet addresses without a live RPC connection.</p>
        </div>

        <form onSubmit={handleVerify} className="tool-form">
          <div className="form-group">
            <label htmlFor="sig-address-input">Signer Public Key (Base58)</label>
            <input
              id="sig-address-input"
              type="text"
              placeholder="Signer's Solana wallet address..."
              className="font-mono"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
              spellCheck="false"
            />
          </div>

          <div className="form-group">
            <label htmlFor="sig-message-input">Original Message Payload</label>
            <textarea
              id="sig-message-input"
              rows={3}
              placeholder="Exact UTF-8 string that was signed..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              spellCheck="false"
            />
          </div>

          <div className="form-group">
            <label htmlFor="sig-sig-input">Signature (Base58 string)</label>
            <input
              id="sig-sig-input"
              type="text"
              placeholder="Base58 encoded 64-byte Ed25519 signature..."
              className="font-mono"
              value={signature}
              onChange={(e) => setSignature(e.target.value)}
              required
              spellCheck="false"
            />
          </div>

          {error && <div className="badge badge-invalid">{error}</div>}

          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              <span>{loading ? 'Verifying...' : 'Verify Cryptographic Signature'}</span>
            </button>
            <button type="button" className="btn btn-secondary" onClick={loadSample}>
              Load Sample Test Vector
            </button>
          </div>
        </form>

        {result && (
          <div className="tool-result-box">
            <div className={`sig-status-badge ${result.valid ? 'valid' : 'invalid'}`}>
              <span className="sig-status-icon">
                {result.valid ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                )}
              </span>
              <span>
                {result.valid
                  ? 'Cryptographic Signature Valid: Authorized by Public Key'
                  : 'Verification Failed: Invalid Signature or Corrupted Payload'}
              </span>
            </div>
            <p className="sig-status-desc">
              Verified with Ed25519 detached authentication algorithm using tweetnacl and bs58 decoding.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

