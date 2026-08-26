import React, { useState } from 'react';
import { AtSign, UserCheck, ShieldCheck, LogIn } from 'lucide-react';
import type { SocialAccount } from '../types/SocialAccount';
import type { UserProfile } from '../../../core/entities/User';

export type SocialPlatform = 'linkedin' | 'x' | 'threads' | 'instagram';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onAddAccount: (account: Omit<SocialAccount, 'id' | 'selected'>) => void;
  user?: UserProfile | null;
  onOpenAuth?: () => void;
}

const PLATFORMS: { id: SocialPlatform; label: string; bg: string; badge: string; isIcon?: boolean }[] = [
  { id: 'linkedin', label: 'LinkedIn', bg: '#0a66c2', badge: 'in' },
  { id: 'x', label: 'Twitter / X', bg: '#000000', badge: '𝕏' },
  { id: 'threads', label: 'Threads', bg: '#18181b', badge: '@', isIcon: true },
  { id: 'instagram', label: 'Instagram', bg: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)', badge: 'ig' },
];

export const AddSocialAccountModal: React.FC<Props> = ({ isOpen, onClose, onAddAccount, user, onOpenAuth }) => {
  const [selectedPlatform, setSelectedPlatform] = useState<SocialPlatform>('linkedin');

  if (!isOpen) return null;

  // Read active user from prop or localStorage without hardcoded defaults
  const activeUser: UserProfile | null = user || (() => {
    try {
      const saved = localStorage.getItem('postit_user_session');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  })();

  const selectedPlatformObj = PLATFORMS.find((p) => p.id === selectedPlatform) || PLATFORMS[0];

  const handleConnect = () => {
    if (!activeUser) return;
    const userName = activeUser.name || 'Cuenta Social';
    const userHandle = activeUser.handle || `@${activeUser.email.split('@')[0]}`;
    const userAvatar = activeUser.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${activeUser.email}`;

    onAddAccount({
      name: userName,
      handle: userHandle,
      platform: selectedPlatform,
      avatarUrl: userAvatar,
    });
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card publer-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header-centered">
          <h2>Add your social accounts</h2>
          <p>Connect your LinkedIn, Twitter / X, Threads, and Instagram accounts</p>
        </div>

        {/* Platform Selection Cards */}
        <div className="social-grid-4">
          {PLATFORMS.map(({ id, label, bg, badge, isIcon }) => {
            const isSelected = selectedPlatform === id;
            return (
              <div
                key={id}
                onClick={() => setSelectedPlatform(id)}
                className={`grid-platform-card ${isSelected ? 'selected' : ''}`}
              >
                {isSelected && <span className="cyan-check-badge">✓</span>}
                <div className="platform-icon-circle" style={{ background: bg }}>
                  {isIcon ? <AtSign size={20} /> : badge}
                </div>
                <span>{label}</span>
              </div>
            );
          })}
        </div>

        {/* Dynamic User Session Info OR Login Prompt */}
        {activeUser ? (
          <>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.85rem',
                padding: '0.85rem 1rem',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-input)',
                borderRadius: 'var(--radius-md)',
                marginTop: '0.5rem',
              }}
            >
              <img
                src={activeUser.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${activeUser.email}`}
                alt={activeUser.name}
                style={{ width: '42px', height: '42px', borderRadius: '50%', border: '2px solid var(--accent-cyan)', objectFit: 'cover' }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', fontWeight: 700, color: '#ffffff' }}>
                  <UserCheck size={16} color="var(--accent-cyan)" />
                  <span>{activeUser.name}</span>
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <ShieldCheck size={13} color="var(--accent-github-hover)" />
                  <span>Autenticado con Google ({activeUser.email})</span>
                </div>
              </div>
            </div>

            <div className="center-actions" style={{ marginTop: '1rem' }}>
              <button
                type="button"
                className="btn-publer-continue"
                onClick={handleConnect}
                style={{ width: '100%', justifyContent: 'center' }}
              >
                Conectar {selectedPlatformObj.label} como @{(activeUser.handle || activeUser.email.split('@')[0]).replace(/^@/, '')}
              </button>
            </div>
          </>
        ) : (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.85rem',
              padding: '1.25rem',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-input)',
              borderRadius: 'var(--radius-md)',
              marginTop: '0.5rem',
              textAlign: 'center',
            }}
          >
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              No hay una sesión de usuario activa. Inicia sesión con Google para vincular tus redes automáticamente.
            </p>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => {
                onClose();
                onOpenAuth?.();
              }}
              style={{ color: 'var(--accent-cyan)', borderColor: 'var(--accent-cyan)', gap: '6px' }}
            >
              <LogIn size={15} /> Iniciar Sesión con Google
            </button>
          </div>
        )}
      </div>
    </div>
  );
};


