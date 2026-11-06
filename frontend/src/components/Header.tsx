import React from 'react';
import { ActiveTab } from '../types';

interface HeaderProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  contactsCount: number;
  onOpenAddModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  contactsCount,
  onOpenAddModal,
}) => {
  return (
    <header className="app-header">
      <div className="header-container">
        <div className="brand-group">
          <div className="brand-symbol" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M4 17.5L8.5 13H20L15.5 17.5H4Z" fill="url(#sol-grad-1)" />
              <path d="M4 6.5L8.5 11H20L15.5 6.5H4Z" fill="url(#sol-grad-2)" />
              <path d="M8.5 12H20L15.5 16.5H4L8.5 12Z" fill="url(#sol-grad-3)" opacity="0.3" />
              <defs>
                <linearGradient id="sol-grad-1" x1="4" y1="17.5" x2="20" y2="13" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#9945FF" />
                  <stop offset="1" stopColor="#14F195" />
                </linearGradient>
                <linearGradient id="sol-grad-2" x1="4" y1="6.5" x2="20" y2="11" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#14F195" />
                  <stop offset="1" stopColor="#9945FF" />
                </linearGradient>
                <linearGradient id="sol-grad-3" x1="4" y1="12" x2="20" y2="16.5" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#9945FF" />
                  <stop offset="1" stopColor="#14F195" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div className="brand-title">
            <span className="title-main">Solana Address Book</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="nav-tabs" role="tablist">
          <button
            className={`nav-tab ${activeTab === 'contacts' ? 'active' : ''}`}
            onClick={() => onTabChange('contacts')}
            role="tab"
            aria-selected={activeTab === 'contacts'}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            <span>Directory</span>
            <span className="tab-badge">{contactsCount}</span>
          </button>

          <button
            className={`nav-tab ${activeTab === 'ata' ? 'active' : ''}`}
            onClick={() => onTabChange('ata')}
            role="tab"
            aria-selected={activeTab === 'ata'}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="m4.93 4.93 4.24 4.24" />
              <path d="m14.83 9.17 4.24-4.24" />
              <path d="m14.83 14.83 4.24 4.24" />
              <path d="m9.17 14.83-4.24 4.24" />
            </svg>
            <span>ATA Deriver</span>
          </button>

          <button
            className={`nav-tab ${activeTab === 'verify' ? 'active' : ''}`}
            onClick={() => onTabChange('verify')}
            role="tab"
            aria-selected={activeTab === 'verify'}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="m9 12 2 2 4-4" />
            </svg>
            <span>Verify Signature</span>
          </button>

          <button
            className={`nav-tab ${activeTab === 'pda' ? 'active' : ''}`}
            onClick={() => onTabChange('pda')}
            role="tab"
            aria-selected={activeTab === 'pda'}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
              <line x1="12" y1="22.08" x2="12" y2="12" />
            </svg>
            <span>PDA Calculator</span>
          </button>
        </nav>

        <div className="header-actions">
          <button className="btn btn-primary btn-sm" onClick={onOpenAddModal}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span>New Address</span>
          </button>
        </div>
      </div>
    </header>
  );
};

