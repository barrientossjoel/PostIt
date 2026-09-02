import React, { useState, useEffect, useRef } from 'react';
import { AtSign, ExternalLink, RefreshCw, CheckCircle2, XCircle } from 'lucide-react';
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
  callbackPath: string;
  authUrlBuilder: (clientId: string, redirectUri: string) => string;
  isIcon?: boolean;
}[] = [
  {
    id: 'linkedin',
    label: 'LinkedIn',
    bg: '#0a66c2',
    badge: 'in',
    callbackPath: '/api/linkedin-callback',
    authUrlBuilder: (clientId, redirectUri) =>
      `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=openid%20profile%20email`,
  },
  {
    id: 'x',
    label: 'Twitter / X',
    bg: '#000000',
    badge: '𝕏',
    callbackPath: '/api/x-callback',
    // X uses PKCE with plain method; code_verifier = code_challenge = 'challenge'
    authUrlBuilder: (clientId, redirectUri) =>
      `https://twitter.com/i/oauth2/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=tweet.read%20users.read&state=state&code_challenge=challenge&code_challenge_method=plain`,
  },
  {
    id: 'threads',
    label: 'Threads',
    bg: '#18181b',
    badge: '@',
    callbackPath: '/api/threads-callback',
    authUrlBuilder: (clientId, redirectUri) =>
      `https://threads.net/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=threads_basic&response_type=code`,
    isIcon: true,
  },
  {
    id: 'instagram',
    label: 'Instagram',
    bg: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
    badge: 'ig',
    callbackPath: '/api/instagram-callback',
    authUrlBuilder: (clientId, redirectUri) =>
      `https://api.instagram.com/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=user_profile,user_media&response_type=code`,
  },
];

const CLIENT_IDS: Record<SocialPlatform, string | undefined> = {
  linkedin: import.meta.env.VITE_LINKEDIN_CLIENT_ID,
  x: import.meta.env.VITE_X_CLIENT_ID,
  threads: import.meta.env.VITE_THREADS_CLIENT_ID,
  instagram: import.meta.env.VITE_INSTAGRAM_CLIENT_ID,
};

type OAuthStatus = 'idle' | 'awaiting' | 'success' | 'error' | 'no_credentials';

export const AddSocialAccountModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onAddAccount,
  publerApiKey,
}) => {
  const [selectedPlatform, setSelectedPlatform] = useState<SocialPlatform>('linkedin');
  const [oauthStatus, setOauthStatus] = useState<OAuthStatus>('idle');
  const [oauthError, setOauthError] = useState('');
  const [isSyncingPubler, setIsSyncingPubler] = useState(false);
  const popupRef = useRef<Window | null>(null);

  // Listen for the postMessage from the popup OAuthCallbackPage
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;

      if (event.data?.type === 'oauth_success') {
        const { platform, name, handle, avatar } = event.data;
        const cleanHandle = handle.startsWith('@') ? handle : `@${handle}`;
        onAddAccount({
          name: name || cleanHandle,
          handle: cleanHandle,
          platform: platform as SocialPlatform,
          avatarUrl: avatar || `https://unavatar.io/${platform}/${handle}`,
        });
        setOauthStatus('success');
        setTimeout(() => {
          setOauthStatus('idle');
          onClose();
        }, 1500);
      }

      if (event.data?.type === 'oauth_error') {
        setOauthError(event.data.error || 'Error desconocido');
        setOauthStatus('error');
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onAddAccount, onClose]);

  if (!isOpen) return null;

  const selectedPlatformObj = PLATFORMS.find((p) => p.id === selectedPlatform) || PLATFORMS[0];
  const clientId = CLIENT_IDS[selectedPlatform];
  const hasCredentials = Boolean(clientId);

  const handleLaunchOAuth = () => {
    if (!hasCredentials) {
      setOauthStatus('no_credentials');
      return;
    }

    const width = 600;
    const height = 750;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    const redirectUri = encodeURIComponent(
      `${window.location.origin}${selectedPlatformObj.callbackPath}`
    );
    const authUrl = selectedPlatformObj.authUrlBuilder(clientId!, redirectUri);

    popupRef.current = window.open(
      authUrl,
      `OAuthLogin_${selectedPlatform}`,
      `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,status=yes`
    );

    setOauthStatus('awaiting');
    setOauthError('');
  };

  const handleSyncFromPubler = async () => {
    if (!publerApiKey) return;
    setIsSyncingPubler(true);
    try {
      const res = await fetch('https://api.publer.io/v1/accounts', {
        headers: { Authorization: `Bearer ${publerApiKey}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          data.forEach((acc: Record<string, string>) => {
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

  const platformBg = selectedPlatformObj.bg.includes('gradient')
    ? '#bc1888'
    : selectedPlatformObj.bg;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card publer-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header-centered">
          <h2>Conectar Cuenta Social</h2>
          <p>Inicia sesión en la ventana oficial de OAuth de la red social seleccionada</p>
        </div>

        {/* Platform Selection Grid */}
        <div className="social-grid-4">
          {PLATFORMS.map(({ id, label, bg, badge, isIcon }) => {
            const isSelected = selectedPlatform === id;
            const hasKey = Boolean(CLIENT_IDS[id]);
            return (
              <div
                key={id}
                onClick={() => {
                  setSelectedPlatform(id);
                  setOauthStatus('idle');
                  setOauthError('');
                }}
                className={`grid-platform-card ${isSelected ? 'selected' : ''}`}
                style={{ position: 'relative' }}
              >
                {isSelected && <span className="cyan-check-badge">✓</span>}
                <div className="platform-icon-circle" style={{ background: bg }}>
                  {isIcon ? <AtSign size={20} /> : badge}
                </div>
                <span>{label}</span>
                {!hasKey && (
                  <span
                    style={{
                      fontSize: '0.6rem',
                      color: 'var(--accent-amber, #fbbf24)',
                      marginTop: '2px',
                    }}
                  >
                    Sin configurar
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Status feedback area */}
        <div style={{ marginTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {oauthStatus === 'no_credentials' && (
            <div
              style={{
                padding: '0.85rem 1rem',
                background: 'rgba(251,191,36,0.08)',
                border: '1px solid var(--accent-amber, #fbbf24)',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.84rem',
                color: '#fbbf24',
              }}
            >
              ⚠️ No hay <code>client_id</code> configurado para <strong>{selectedPlatformObj.label}</strong>.
              Agregá la variable <code>VITE_{selectedPlatform.toUpperCase()}_CLIENT_ID</code> y
              <code>{selectedPlatform.toUpperCase()}_CLIENT_SECRET</code> en tu archivo <code>.env</code> y en Vercel.
            </div>
          )}

          {oauthStatus === 'awaiting' && (
            <div
              style={{
                padding: '0.85rem 1rem',
                background: 'rgba(0,229,255,0.08)',
                border: '1px solid var(--accent-cyan)',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.84rem',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <RefreshCw size={16} className="animate-spin" color="var(--accent-cyan)" />
              Esperando que completes el login en {selectedPlatformObj.label}…
            </div>
          )}

          {oauthStatus === 'success' && (
            <div
              style={{
                padding: '0.85rem 1rem',
                background: 'rgba(34,197,94,0.08)',
                border: '1px solid #22c55e',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.84rem',
                color: '#22c55e',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <CheckCircle2 size={16} />
              ¡Cuenta vinculada exitosamente!
            </div>
          )}

          {oauthStatus === 'error' && (
            <div
              style={{
                padding: '0.85rem 1rem',
                background: 'rgba(239,68,68,0.08)',
                border: '1px solid #ef4444',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.84rem',
                color: '#ef4444',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <XCircle size={16} />
              Error: {oauthError}
            </div>
          )}

          {oauthStatus !== 'success' && (
            <button
              type="button"
              className="btn-publer-continue"
              onClick={handleLaunchOAuth}
              disabled={oauthStatus === 'awaiting'}
              style={{
                width: '100%',
                justifyContent: 'center',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '0.75rem 1.5rem',
                fontSize: '0.92rem',
                background: oauthStatus === 'awaiting' ? '#555' : platformBg,
                color: '#ffffff',
                cursor: oauthStatus === 'awaiting' ? 'not-allowed' : 'pointer',
              }}
            >
              {oauthStatus === 'awaiting' ? (
                <RefreshCw size={18} className="animate-spin" />
              ) : (
                <ExternalLink size={18} />
              )}
              {oauthStatus === 'awaiting'
                ? 'Esperando autorización…'
                : `Iniciar Sesión con ${selectedPlatformObj.label}`}
            </button>
          )}

          {publerApiKey && (
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleSyncFromPubler}
              disabled={isSyncingPubler}
              style={{ width: '100%', justifyContent: 'center', color: 'var(--accent-cyan)', borderColor: 'var(--accent-cyan)' }}
            >
              <RefreshCw size={14} className={isSyncingPubler ? 'animate-spin' : ''} />
              {isSyncingPubler ? 'Sincronizando de Publer...' : 'Sincronizar Cuentas desde Publer API'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
