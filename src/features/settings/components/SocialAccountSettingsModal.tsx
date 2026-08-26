import React, { useState } from 'react';
import { ArrowLeft, Edit2, RotateCcw, RefreshCw, Copy, Trash2, UserX } from 'lucide-react';
import type { SocialAccount } from '../../preview/types/SocialAccount';

interface Props {
  account: SocialAccount | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateAccount: (updated: SocialAccount) => void;
  onRemoveAccount: (id: string) => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

type TabType =
  | 'settings'
  | 'post_presets'
  | 'posting_schedule'
  | 'link_in_bio'
  | 'watermarks'
  | 'signatures'
  | 'url_settings'
  | 'shortcodes';

export const SocialAccountSettingsModal: React.FC<Props> = ({
  account,
  isOpen,
  onClose,
  onUpdateAccount,
  onRemoveAccount,
  showToast,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('settings');
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(account?.name || '');

  if (!isOpen || !account) return null;

  const handleSaveName = () => {
    if (nameInput.trim()) {
      onUpdateAccount({ ...account, name: nameInput.trim() });
      showToast('Nombre de la cuenta actualizado', 'success');
    }
    setIsEditingName(false);
  };

  const handleReauthorize = () => {
    showToast(`Cuenta ${account.name} reautorizada con éxito`, 'success');
  };

  const handleSyncInfo = () => {
    showToast(`Información sincronizada para ${account.name}`, 'info');
  };

  const handleDuplicateSettings = () => {
    showToast('Ajustes duplicados a las demás cuentas', 'info');
  };

  const handleDeleteScheduled = () => {
    if (window.confirm(`¿Estás seguro de eliminar las publicaciones programadas de ${account.name}?`)) {
      showToast('Publicaciones programadas eliminadas', 'success');
    }
  };

  const handleRemoveAccount = () => {
    if (window.confirm(`¿Estás seguro de eliminar la cuenta ${account.name} (${account.platform.toUpperCase()}) de PostIt?`)) {
      onRemoveAccount(account.id);
      showToast(`Cuenta ${account.name} eliminada de Publer/PostIt`, 'info');
      onClose();
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="publer-modal"
        style={{ maxWidth: '820px', width: '100%', padding: '0', overflow: 'hidden' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Back Button and Account Title */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--border-color)',
            background: 'var(--bg-secondary)',
          }}
        >
          <button
            type="button"
            className="btn-close-icon"
            onClick={onClose}
            title="Volver"
            style={{ padding: '4px', display: 'flex', alignItems: 'center' }}
          >
            <ArrowLeft size={18} color="var(--text-primary)" />
          </button>

          <img
            src={account.avatarUrl}
            alt={account.name}
            style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }}
          />

          {isEditingName ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <input
                type="text"
                className="input-text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                style={{ padding: '2px 8px', fontSize: '0.9rem' }}
                autoFocus
              />
              <button type="button" className="btn btn-secondary btn-sm" onClick={handleSaveName}>
                Guardar
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff' }}>
                {account.name}
              </h3>
              <button
                type="button"
                className="btn-close-icon"
                onClick={() => {
                  setNameInput(account.name);
                  setIsEditingName(true);
                }}
                title="Editar nombre"
              >
                <Edit2 size={14} color="var(--text-muted)" />
              </button>
            </div>
          )}
        </div>

        {/* Navigation Sub-Tabs */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0 1.5rem',
            borderBottom: '1px solid var(--border-color)',
            background: 'var(--bg-secondary)',
            overflowX: 'auto',
          }}
        >
          {[
            { id: 'settings', label: 'Settings' },
            { id: 'post_presets', label: 'Post Presets' },
            { id: 'posting_schedule', label: 'Posting Schedule' },
            { id: 'link_in_bio', label: 'Link in Bio' },
            { id: 'watermarks', label: 'Watermarks' },
            { id: 'signatures', label: 'Signatures' },
            { id: 'url_settings', label: 'URL Settings' },
            { id: 'shortcodes', label: 'Shortcodes' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id as TabType)}
              style={{
                borderRadius: '0',
                borderBottom: activeTab === tab.id ? '2px solid var(--accent-cyan)' : '2px solid transparent',
                padding: '0.75rem 0.5rem',
                fontSize: '0.84rem',
                whiteSpace: 'nowrap',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content Body */}
        <div style={{ padding: '1.5rem', maxHeight: '70vh', overflowY: 'auto' }}>
          {activeTab === 'settings' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.4rem' }}>
              {/* Option 1: Profile picture */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
                <div>
                  <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#ffffff' }}>Profile picture</h4>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Changing the name & profile picture <strong>WILL NOT</strong> have any effect outside Publer.
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <img src={account.avatarUrl} alt={account.name} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => showToast('Haz clic en editar nombre en la cabecera', 'info')}>
                    Change
                  </button>
                </div>
              </div>

              {/* Option 2: Reauthorize */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
                <div>
                  <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#ffffff' }}>Reauthorize</h4>
                  <p style={{ fontSize: '0.78rem', color: 'var(--accent-blue)', marginTop: '2px', cursor: 'pointer' }} onClick={handleReauthorize}>
                    Did Publer lose connection to this social account? Click here if you need to reauthorize all accounts!
                  </p>
                </div>
                <button type="button" className="btn btn-secondary btn-sm" onClick={handleReauthorize} style={{ color: 'var(--accent-blue)', borderColor: 'rgba(29, 155, 240, 0.4)' }}>
                  <RotateCcw size={14} /> Reauthorize
                </button>
              </div>

              {/* Option 3: Sync info */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
                <div>
                  <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#ffffff' }}>Sync info</h4>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Sync this account's profile picture, and name.
                  </p>
                </div>
                <button type="button" className="btn btn-secondary btn-sm" onClick={handleSyncInfo}>
                  <RefreshCw size={14} /> Sync info
                </button>
              </div>

              {/* Option 4: Duplicate settings */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
                <div>
                  <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#ffffff' }}>Duplicate settings</h4>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Copy this account's posting schedule, watermarks, etc. to other accounts.
                  </p>
                </div>
                <button type="button" className="btn btn-secondary btn-sm" onClick={handleDuplicateSettings}>
                  <Copy size={14} /> Duplicate settings
                </button>
              </div>

              {/* Option 5: Delete scheduled posts */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
                <div>
                  <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#ffffff' }}>Delete scheduled posts</h4>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    This will delete all scheduled posts from all users for this social account. Are you sure you want to continue?
                  </p>
                </div>
                <button type="button" className="btn btn-secondary btn-sm" onClick={handleDeleteScheduled} style={{ color: 'var(--accent-red)', borderColor: 'rgba(248, 81, 73, 0.4)' }}>
                  <Trash2 size={14} /> Delete all scheduled posts
                </button>
              </div>

              {/* Option 6: Remove social account */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#ffffff' }}>Remove social account</h4>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    This will delete from Publer all the data related to it, such as scheduled posts, analytics, and other settings.
                  </p>
                </div>
                <button type="button" className="btn btn-secondary btn-sm" onClick={handleRemoveAccount} style={{ color: 'var(--accent-red)', borderColor: 'rgba(248, 81, 73, 0.4)' }}>
                  <UserX size={14} /> Remove social account
                </button>
              </div>
            </div>
          )}

          {activeTab !== 'settings' && (
            <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-muted)' }}>
              <p style={{ fontSize: '0.9rem' }}>Configuración de <strong>{activeTab.replace(/_/g, ' ').toUpperCase()}</strong> para {account.name}</p>
              <span style={{ fontSize: '0.78rem', display: 'block', marginTop: '0.4rem' }}>Todos los valores están sincronizados con la API de Publer.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
