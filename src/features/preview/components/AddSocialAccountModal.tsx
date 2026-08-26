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
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  if (!isOpen) return null;

  const selectedPlatformObj = PLATFORMS.find((p) => p.id === selectedPlatform) || PLATFORMS[0];

  const handleConnectOAuth = () => {
    setIsAuthenticating(true);
    setTimeout(() => {
      onAddAccount({
        name: `${selectedPlatformObj.label} Account`,
        handle: `@${selectedPlatformObj.id}_user`,
        platform: selectedPlatform,
        avatarUrl: `https://unavatar.io/${selectedPlatform === 'x' ? 'twitter' : selectedPlatform}/${selectedPlatformObj.id}_user`,
      });

      setIsAuthenticating(false);
      onClose();
    }, 700);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card publer-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header-centered">
          <h2>Conectar Cuenta Social</h2>
          <p>Selecciona una red social para iniciar sesión y vincular tu cuenta</p>
        </div>

        {/* Platform Selection Grid */}
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

        {/* Direct OAuth Connection Button - NO INPUT FIELDS */}
        <div className="center-actions" style={{ marginTop: '1.25rem' }}>
          <button
            type="button"
            className="btn-publer-continue"
            disabled={isAuthenticating}
            onClick={handleConnectOAuth}
            style={{
              width: '100%',
              justifyContent: 'center',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '0.75rem 1.5rem',
              fontSize: '0.92rem',
              background: selectedPlatformObj.bg.includes('gradient') ? '#bc1888' : selectedPlatformObj.bg,
              color: '#ffffff',
            }}
          >
            <LogIn size={18} />
            {isAuthenticating
              ? `Conectando con ${selectedPlatformObj.label}...`
              : `Iniciar Sesión con ${selectedPlatformObj.label}`}
          </button>
        </div>
      </div>
    </div>
  );
};


