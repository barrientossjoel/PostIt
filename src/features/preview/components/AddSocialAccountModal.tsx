import React, { useState } from 'react';
import { AtSign, ExternalLink, CheckCircle2, RefreshCw } from 'lucide-react';
import type { SocialAccount } from '../types/SocialAccount';
import type { UserProfile } from '../../../core/entities/User';

export type SocialPlatform = 'linkedin' | 'x' | 'threads' | 'instagram';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onAddAccount: (account: Omit<SocialAccount, 'id' | 'selected'>) => void;
  user?: UserProfile | null;
  publerApiKey?: string;
  onOpenAuth?: () => void;
}

const PLATFORMS: {
  id: SocialPlatform;
  label: string;
  bg: string;
  badge: string;
  oauthUrl: string;
  isIcon?: boolean;
}[] = [
  {
    id: 'linkedin',
    label: 'LinkedIn',
    bg: '#0a66c2',
    badge: 'in',
    oauthUrl: 'https://www.linkedin.com/oauth/v2/authorization',
  },
  {
    id: 'x',
    label: 'Twitter / X',
    bg: '#000000',
    badge: '𝕏',
    oauthUrl: 'https://twitter.com/i/oauth2/authorize',
  },
  {
    id: 'threads',
    label: 'Threads',
    bg: '#18181b',
    badge: '@',
    oauthUrl: 'https://www.threads.net/login',
    isIcon: true,
  },
  {
    id: 'instagram',
    label: 'Instagram',
    bg: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
    badge: 'ig',
    oauthUrl: 'https://api.instagram.com/oauth/authorize',
  },
];

export const AddSocialAccountModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onAddAccount,
  publerApiKey,
}) => {
  const [selectedPlatform, setSelectedPlatform] = useState<SocialPlatform>('linkedin');
  const [awaitingOAuth, setAwaitingOAuth] = useState(false);
  const [confirmedHandle, setConfirmedHandle] = useState('');
  const [isSyncingPubler, setIsSyncingPubler] = useState(false);

  if (!isOpen) return null;

  const selectedPlatformObj = PLATFORMS.find((p) => p.id === selectedPlatform) || PLATFORMS[0];

  const handleLaunchOAuth = () => {
    const width = 600;
    const height = 750;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    const popupUrl = selectedPlatformObj.oauthUrl;
    window.open(
      popupUrl,
      `OAuthLogin_${selectedPlatform}`,
      `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,status=yes`
    );

    setAwaitingOAuth(true);
  };

  const handleConfirmAccount = (e: React.FormEvent) => {
    e.preventDefault();
    const handle = confirmedHandle.trim();
    if (!handle) return;

    const cleanHandle = handle.startsWith('@') ? handle : `@${handle}`;
    const username = cleanHandle.replace(/^@/, '');
    const avatarUrl = `https://unavatar.io/${selectedPlatform === 'x' ? 'twitter' : selectedPlatform}/${username}`;

    onAddAccount({
      name: username,
      handle: cleanHandle,
      platform: selectedPlatform,
      avatarUrl,
    });

    setAwaitingOAuth(false);
    setConfirmedHandle('');
    onClose();
  };

  const handleSyncFromPubler = async () => {
    if (!publerApiKey) return;
    setIsSyncingPubler(true);
    try {
      const res = await fetch('https://api.publer.io/v1/accounts', {
        headers: {
          Authorization: `Bearer ${publerApiKey}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          data.forEach((acc: any) => {
            onAddAccount({
              name: acc.name || acc.username || 'Cuenta Publer',
              handle: `@${acc.username || acc.name || 'publer_acc'}`,
              platform: (acc.type || selectedPlatform) as SocialPlatform,
              avatarUrl: acc.picture || acc.avatar,
            });
          });
          onClose();
        }
      }
    } catch {
      // Ignore network failures gracefully
    } finally {
      setIsSyncingPubler(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card publer-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header-centered">
          <h2>Conectar Cuenta Social Real</h2>
          <p>Inicia sesión en la ventana oficial de OAuth de la red social seleccionada</p>
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
                  setAwaitingOAuth(false);
                  setConfirmedHandle('');
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

        {!awaitingOAuth ? (
          <div className="center-actions" style={{ marginTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <button
              type="button"
              className="btn-publer-continue"
              onClick={handleLaunchOAuth}
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
              <ExternalLink size={18} />
              Iniciar Sesión en {selectedPlatformObj.label} (Abrir OAuth)
            </button>

            {publerApiKey && (
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={handleSyncFromPubler}
                disabled={isSyncingPubler}
                style={{ width: '100%', justifyContent: 'center', color: 'var(--accent-cyan)', borderColor: 'var(--accent-cyan)' }}
              >
                <RefreshCw size={14} className={isSyncingPubler ? 'animate-spin' : ''} />
                {isSyncingPubler ? 'Sincronizando de Publer...' : 'Sincronizar Cuentas Reales desde Publer API'}
              </button>
            )}
          </div>
        ) : (
          <form onSubmit={handleConfirmAccount} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
            <div
              style={{
                padding: '0.85rem 1rem',
                background: 'rgba(0, 229, 255, 0.08)',
                border: '1px solid var(--accent-cyan)',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.84rem',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <CheckCircle2 size={18} color="var(--accent-cyan)" />
              <span>Se ha abierto la ventana de autenticación de <strong>{selectedPlatformObj.label}</strong>.</span>
            </div>

            <div className="input-group">
              <label className="input-label">Confirma el Usuario / Handle autenticado *</label>
              <input
                type="text"
                className="input-text"
                placeholder="Ej. @mi_cuenta_real"
                value={confirmedHandle}
                onChange={(e) => setConfirmedHandle(e.target.value)}
                autoFocus
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={!confirmedHandle.trim()}
              style={{ width: '100%', justifyContent: 'center' }}
            >
              Vincular Cuenta Autenticada
            </button>
          </form>
        )}
      </div>
    </div>
  );
};


