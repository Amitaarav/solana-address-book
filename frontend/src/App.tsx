import React, { useState } from 'react';
import { useContacts } from './hooks/useContacts';
import { Header } from './components/Header';
import { ContactList } from './components/ContactList';
import { AtaDeriver } from './components/AtaDeriver';
import { VerifySignature } from './components/VerifySignature';
import { PdaCalculator } from './components/PdaCalculator';
import { AddContactModal } from './components/AddContactModal';
import { EditContactModal } from './components/EditContactModal';
import { Toast } from './components/Toast';
import { ActiveTab, Contact } from './types';

export const App: React.FC = () => {
  const {
    contacts,
    loading,
    toasts,
    fetchContacts,
    createContact,
    updateContact,
    deleteContact,
    copyToClipboard,
  } = useContacts();

  const [activeTab, setActiveTab] = useState<ActiveTab>('contacts');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'wallet' | 'pda'>('all');

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [selectedOwnerForAta, setSelectedOwnerForAta] = useState<string>('');

  const handleSelectForAta = (address: string) => {
    setSelectedOwnerForAta(address);
    setActiveTab('ata');
  };

  return (
    <div className="app-layout">
      {/* Ambient background glow */}
      <div className="ambient-glow" aria-hidden="true" />

      {/* Header */}
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        contactsCount={contacts.length}
        onOpenAddModal={() => setAddModalOpen(true)}
      />

      {/* Main Content */}
      <main className="app-main">
        {activeTab === 'contacts' && (
          <ContactList
            contacts={contacts}
            loading={loading}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            filterType={filterType}
            onFilterChange={setFilterType}
            onRefresh={fetchContacts}
            onEdit={setEditingContact}
            onDelete={deleteContact}
            onSelectForAta={handleSelectForAta}
            onCopy={copyToClipboard}
            onOpenAddModal={() => setAddModalOpen(true)}
          />
        )}

        {activeTab === 'ata' && (
          <AtaDeriver
            contacts={contacts}
            initialOwner={selectedOwnerForAta}
            onCopy={copyToClipboard}
          />
        )}

        {activeTab === 'verify' && <VerifySignature />}

        {activeTab === 'pda' && <PdaCalculator onCopy={copyToClipboard} />}
      </main>

      {/* Modals */}
      <AddContactModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSubmit={createContact}
      />

      <EditContactModal
        contact={editingContact}
        onClose={() => setEditingContact(null)}
        onSubmit={updateContact}
      />

      {/* Toast Notifications */}
      <Toast toasts={toasts} />

      {/* Footer */}
      <footer className="app-footer">
        <span>Solana Address Book & Cryptographic Tooling · Linear Craft Design</span>
        <div className="status-indicator-live">
          <span className="live-dot" />
          <span>Local REST Server Online</span>
        </div>
      </footer>
    </div>
  );
};

