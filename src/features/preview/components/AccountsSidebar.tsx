import React, { useState } from 'react';
import { Search, Plus } from 'lucide-react';
import type { SocialAccount } from '../types/SocialAccount';

interface Props {
  accounts: SocialAccount[];
  onToggleAccount: (id: string) => void;
  onOpenAddModal: () => void;
}

const BADGE_MAP: Record<SocialAccount['platform'], { bg: string; text: string }> = {
  linkedin: { bg: '#0a66c2', text: 'in' },
  x: { bg: '#000000', text: '𝕏' },
  threads: { bg: '#18181b', text: '@' },
  instagram: { bg: '#e4405f', text: 'ig' },
};

export const AccountsSidebar: React.FC<Props> = ({
  accounts,
  onToggleAccount,
  onOpenAddModal,
}) => {
  const [search, setSearch] = useState('');

  const filtered = accounts.filter(
    (a) =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.handle.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="accounts-sidebar-card">
      <div className="search-box">
        <Search size={14} className="search-icon" />
        <input
          type="text"
          placeholder="Search"
          className="input-text search-input"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <button type="button" onClick={onOpenAddModal} className="btn-add-account">
        <Plus size={14} /> Add account
      </button>

      <div className="accounts-list">
        {filtered.length === 0 ? (
          <div className="empty-accounts-hint">
            No hay cuentas agregadas. Haz clic en <strong>+ Add account</strong> para vincular tu primera red social.
          </div>
        ) : (
          filtered.map((acc) => {
            const badge = BADGE_MAP[acc.platform] || { bg: '#2f3336', text: '•' };
            return (
              <div
                key={acc.id}
                onClick={() => onToggleAccount(acc.id)}
                className="account-item-row"
              >
                <div className="account-avatar-wrapper">
                  <img
                    src={acc.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${acc.name}`}
                    alt={acc.name}
                    className={`account-avatar ${acc.selected ? 'selected-border' : ''}`}
                    onError={(e) => {
                      (e.target as HTMLElement).setAttribute(
                        'src',
                        `https://api.dicebear.com/7.x/bottts/svg?seed=${acc.name}`
                      );
                    }}
                  />
                  <span className="network-badge" style={{ background: badge.bg }}>
                    {badge.text}
                  </span>
                  {acc.selected && <span className="cyan-check-badge-sm">✓</span>}
                </div>

                <span className={`account-name ${acc.selected ? 'selected-text' : ''}`}>
                  {acc.name}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
