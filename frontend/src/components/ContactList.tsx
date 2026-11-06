import React from 'react';
import { Contact } from '../types';
import { ContactCard } from './ContactCard';

interface ContactListProps {
  contacts: Contact[];
  loading: boolean;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filterType: 'all' | 'wallet' | 'pda';
  onFilterChange: (type: 'all' | 'wallet' | 'pda') => void;
  onRefresh: () => void;
  onEdit: (contact: Contact) => void;
  onDelete: (id: number) => void;
  onSelectForAta: (address: string) => void;
  onCopy: (text: string) => void;
  onOpenAddModal: () => void;
}

export const ContactList: React.FC<ContactListProps> = ({
  contacts,
  loading,
  searchQuery,
  onSearchChange,
  filterType,
  onFilterChange,
  onRefresh,
  onEdit,
  onDelete,
  onSelectForAta,
  onCopy,
  onOpenAddModal,
}) => {
  const filteredContacts = contacts.filter((c) => {
    const matchesFilter = filterType === 'all' || c.type === filterType;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      q === '' ||
      c.name.toLowerCase().includes(q) ||
      c.address.toLowerCase().includes(q) ||
      c.type.toLowerCase().includes(q);
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="tab-view">
      <div className="directory-toolbar">
        <div className="search-input-wrapper">
          <svg className="search-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search by name, address, or type..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            spellCheck="false"
          />
          {searchQuery && (
            <button
              className="search-clear-btn"
              onClick={() => onSearchChange('')}
              aria-label="Clear search query"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>

        <div className="filter-group">
          <div className="segmented-control" role="radiogroup">
            <button
              className={`segment ${filterType === 'all' ? 'active' : ''}`}
              onClick={() => onFilterChange('all')}
              role="radio"
              aria-checked={filterType === 'all'}
            >
              All
            </button>
            <button
              className={`segment ${filterType === 'wallet' ? 'active' : ''}`}
              onClick={() => onFilterChange('wallet')}
              role="radio"
              aria-checked={filterType === 'wallet'}
            >
              Wallets
            </button>
            <button
              className={`segment ${filterType === 'pda' ? 'active' : ''}`}
              onClick={() => onFilterChange('pda')}
              role="radio"
              aria-checked={filterType === 'pda'}
            >
              PDAs
            </button>
          </div>

          <button className="btn btn-ghost btn-icon" onClick={onRefresh} title="Refresh directory">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
            </svg>
          </button>
        </div>
      </div>

      <div className="contacts-container">
        <div className="contacts-table-header">
          <span>Name & Type</span>
          <span>Solana Public Key (Base58)</span>
          <span>Added</span>
          <span style={{ textAlign: 'right' }}>Actions</span>
        </div>

        <div className="contacts-list">
          {loading ? (
            <div className="loading-state">
              <div className="spinner" />
              <span>Fetching Solana addresses...</span>
            </div>
          ) : filteredContacts.length === 0 ? (
            <div className="empty-state">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
              </svg>
              <h4>No registered addresses found</h4>
              <p>
                {searchQuery
                  ? 'No addresses match your current search query. Try clearing the filter.'
                  : 'Get started by adding your first Solana wallet or Program Derived Address.'}
              </p>
              {!searchQuery && (
                <button className="btn btn-secondary btn-sm mt-2" onClick={onOpenAddModal}>
                  Register Address
                </button>
              )}
            </div>
          ) : (
            filteredContacts.map((contact) => (
              <ContactCard
                key={contact.id}
                contact={contact}
                onEdit={onEdit}
                onDelete={onDelete}
                onSelectForAta={onSelectForAta}
                onCopy={onCopy}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

