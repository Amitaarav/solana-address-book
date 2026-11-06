import React, { useState } from 'react';
import { PdaResult } from '../types';
import { API_BASE } from '../lib/api';

interface PdaCalculatorProps {
  onCopy: (text: string) => void;
}

const STANDARD_PROGRAMS = [
  { name: 'System Program', id: '11111111111111111111111111111111' },
  { name: 'Token Program', id: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA' },
  { name: 'Associated Token', id: 'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL' },
];

export const PdaCalculator: React.FC<PdaCalculatorProps> = ({ onCopy }) => {
  const [programId, setProgramId] = useState('');
  const [seeds, setSeeds] = useState<string[]>(['']);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PdaResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const addSeed = () => {
    if (seeds.length < 16) {
      setSeeds([...seeds, '']);
    }
  };

  const removeSeed = (idx: number) => {
    if (seeds.length > 1) {
      setSeeds(seeds.filter((_, i) => i !== idx));
    }
  };

  const updateSeed = (idx: number, val: string) => {
    const updated = [...seeds];
    updated[idx] = val;
    setSeeds(updated);
  };

  const handleDerive = async (e: React.FormEvent) => {
    e.preventDefault();
    const activeSeeds = seeds.map((s) => s.trim()).filter(Boolean);
    if (!programId.trim() || activeSeeds.length === 0) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch(`${API_BASE}/derive-pda`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          programId: programId.trim(),
          seeds: activeSeeds,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to derive PDA');
      }

      setResult(data);
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
          <h2>Program Derived Address (PDA) Explorer</h2>
          <p>Deterministically derive off-curve addresses using arbitrary UTF-8 strings or 32-byte public key seeds.</p>
        </div>

        <form onSubmit={handleDerive} className="tool-form">
          <div className="form-group">
            <label htmlFor="pda-program-input">Program Public Key (Program ID)</label>
            <input
              id="pda-program-input"
              type="text"
              placeholder="e.g. 11111111111111111111111111111111..."
              className="font-mono"
              value={programId}
              onChange={(e) => setProgramId(e.target.value)}
              required
              spellCheck="false"
            />
            <div className="quick-presets">
              <span className="preset-label">Standard Programs:</span>
              {STANDARD_PROGRAMS.map((p) => (
                <button
                  key={p.name}
                  type="button"
                  className="chip"
                  onClick={() => setProgramId(p.id)}
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Seeds Configuration</label>
            <div className="seeds-list">
              {seeds.map((seed, idx) => (
                <div key={idx} className="seed-item">
                  <span className="seed-idx font-mono">{idx}</span>
                  <input
                    type="text"
                    className="seed-input font-mono"
                    placeholder="Seed string or 32-byte pubkey..."
                    value={seed}
                    onChange={(e) => updateSeed(idx, e.target.value)}
                    required
                    spellCheck="false"
                  />
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => removeSeed(idx)}
                    disabled={seeds.length === 1}
                    title="Remove seed"
                    aria-label="Remove seed"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>

            <button
              type="button"
              className="btn btn-secondary btn-sm mt-2"
              onClick={addSeed}
              disabled={seeds.length >= 16}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              <span>Add Additional Seed</span>
            </button>
          </div>

          {error && <div className="badge badge-invalid">{error}</div>}

          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              <span>{loading ? 'Deriving...' : 'Derive PDA & Canonical Bump'}</span>
            </button>
          </div>
        </form>

        {result && (
          <div className="tool-result-box">
            <div className="result-header">
              <span className="result-title">Derived PDA Result</span>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => onCopy(result.pda)}
              >
                Copy Address
              </button>
            </div>
            <div className="result-value font-mono">{result.pda}</div>
            <div className="result-details">
              <div className="detail-row">
                <span className="detail-label">Canonical Bump:</span>
                <span className="detail-code font-mono font-bold">{result.bump}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Curve State:</span>
                <span className="badge badge-pda">Off-curve (Valid PDA)</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

