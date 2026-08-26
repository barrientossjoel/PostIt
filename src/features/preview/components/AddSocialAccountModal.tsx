import React, { useState } from 'react';
import { AtSign, LogIn } from 'lucide-react';
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

export const AddSocialAccountModal: React.FC<Props> = ({ isOpen, onClose, onAddAccount }) => {
  const [selectedPlatform, setSelectedPlatform] = useState<SocialPlatform>('linkedin');
  const [handle, setHandle] = useState('');
  const [profileName, setProfileName] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  if (!isOpen) return null;

  const selectedPlatformObj = PLATFORMS.find((p) => p.id === selectedPlatform) || PLATFORMS[0];

  const handleConnectPlatform = (e: React.FormEvent) => {
    e.preventDefault();
    if (!handle.trim()) return;

    setIsAuthenticating(true);
    setTimeout(() => {
      const cleanHandle = handle.trim().startsWith('@') ? handle.trim() : `@${handle.trim()}`;
      const name = profileName.trim() || cleanHandle.replace(/^@/, '');
      const avatarUrl = `https://unavatar.io/${selectedPlatform === 'x' ? 'twitter' : selectedPlatform}/${cleanHandle.replace(/^@/, '')}`;

      onAddAccount({
        name,
        handle: cleanHandle,
        platform: selectedPlatform,
        avatarUrl,
      });

      setIsAuthenticating(false);
      setHandle('');
      setProfileName('');
      onClose();
    }, 600);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card publer-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header-centered">
          <h2>Conectar Cuenta de Red Social</h2>
          <p>Selecciona una red social e inicia sesión para vincularla de manera independiente</p>
        </div>

        {/* Platform Selection Grid */}
        <div className="social-grid-4">
          {PLATFORMS.map(({ id, label, bg, badge, isIcon }) => {
            const isSelected = selectedPlatform === id;
            return (
              <div
                key={id}
                onClick={() => {
                  setSelectedPlatform(id);
                  setHandle('');
                  setProfileName('');
                }}
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

        {/* Platform Specific Login / Connection Form */}
        <form onSubmit={handleConnectPlatform} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.75rem' }}>
          <div className="input-group">
            <label className="input-label">Usuario / Handle en {selectedPlatformObj.label} *</label>
            <input
              type="text"
              className="input-text"
              placeholder={`Ej. @usuario_${selectedPlatformObj.id}`}
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label className="input-label">Nombre de Perfil (Opcional)</label>
            <input
              type="text"
              className="input-text"
              placeholder="Ej. Mi Nombre / Marca"
              value={profileName}
              onChange={(e) => setProfileName(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="btn-publer-continue"
            disabled={isAuthenticating || !handle.trim()}
            style={{
              width: '100%',
              justifyContent: 'center',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginTop: '0.5rem',
            }}
          >
            <LogIn size={16} />
            {isAuthenticating
              ? `Autenticando con ${selectedPlatformObj.label}...`
              : `Iniciar Sesión y Vincular ${selectedPlatformObj.label}`}
          </button>
        </form>
      </div>
    </div>
  );
};


