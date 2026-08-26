import React, { useState, useEffect, useRef } from 'react';
import type { UserProfile } from '../../core/entities/User';
import { LogIn, LogOut, CheckCircle2, Globe, Shield, Key } from 'lucide-react';

interface Props {
  user: UserProfile | null;
  isOpen: boolean;
  onClose: () => void;
  onLoginWithGoogle: (email: string, name: string, avatarUrl?: string) => void;
  onLogout: () => void;
  onUpdateConnectedAccounts: (accounts: UserProfile['connectedAccounts']) => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: { client_id: string; callback: (response: { credential: string }) => void }) => void;
          renderButton: (parent: HTMLElement, options: Record<string, unknown>) => void;
          prompt: () => void;
        };
      };
    };
  }
}

const parseJwt = (token: string): { email?: string; name?: string; picture?: string } | null => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (err) {
    console.error('Error parsing JWT Google Token:', err);
    return null;
  }
};

export const GoogleAuthModal: React.FC<Props> = ({
  user,
  isOpen,
  onClose,
  onLoginWithGoogle,
  onLogout,
  onUpdateConnectedAccounts,
  showToast,
}) => {
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');
  const [clientId, setClientId] = useState<string>(() => {
    return import.meta.env.VITE_GOOGLE_CLIENT_ID || localStorage.getItem('postit_google_client_id') || '';
  });
  const [isSavedClientId, setIsSavedClientId] = useState<boolean>(() => !!clientId);
  const [googleScriptLoaded, setGoogleScriptLoaded] = useState(false);

  const googleBtnRef = useRef<HTMLDivElement>(null);

  // Load Google Identity Services script
  useEffect(() => {
    if (window.google?.accounts?.id) {
      setGoogleScriptLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => setGoogleScriptLoaded(true);
    document.head.appendChild(script);
  }, []);

  // Initialize Google Auth when script & clientId are available
  useEffect(() => {
    if (!isOpen || !googleScriptLoaded || !clientId || !window.google?.accounts?.id) return;

    try {
      window.google.accounts.id.initialize({
        client_id: clientId.trim(),
        callback: (response) => {
          const payload = parseJwt(response.credential);
          if (payload && payload.email) {
            const name = payload.name || payload.email.split('@')[0];
            const avatar = payload.picture || `https://api.dicebear.com/7.x/bottts/svg?seed=${payload.email}`;
            onLoginWithGoogle(payload.email, name, avatar);
            showToast(`¡Sesión iniciada con éxito! (${payload.email})`, 'success');
            onClose();
          } else {
            showToast('No se pudieron leer las credenciales de Google', 'error');
          }
        },
      });

      if (googleBtnRef.current) {
        googleBtnRef.current.innerHTML = '';
        window.google.accounts.id.renderButton(googleBtnRef.current, {
          theme: 'outline',
          size: 'large',
          text: 'signin_with',
          shape: 'rectangular',
          width: 320,
        });
      }
    } catch (err) {
      console.error('Error al inicializar Google GIS:', err);
    }
  }, [isOpen, googleScriptLoaded, clientId, onLoginWithGoogle, showToast, onClose]);

  if (!isOpen) return null;

  const handleSaveClientId = (e: React.FormEvent) => {
    e.preventDefault();
    if (clientId.trim()) {
      localStorage.setItem('postit_google_client_id', clientId.trim());
      setIsSavedClientId(true);
      showToast('Client ID de Google guardado correctamente', 'success');
    }
  };

  const handleSimulatedSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const email = customEmail.trim() || 'dev.usuario@gmail.com';
    const name = customName.trim() || 'Usuario Google PostIt';
    const avatar = `https://api.dicebear.com/7.x/bottts/svg?seed=${email}`;
    onLoginWithGoogle(email, name, avatar);
    showToast(`Sesión iniciada (${email})`, 'success');
    onClose();
  };

  const toggleAccount = (platform: 'x' | 'linkedin' | 'facebook') => {
    if (!user) return;
    const newAccounts = {
      ...user.connectedAccounts,
      [platform]: !user.connectedAccounts[platform],
    };
    onUpdateConnectedAccounts(newAccounts);
    showToast(
      `${newAccounts[platform] ? 'Cuenta conectada' : 'Cuenta desconectada'}: ${platform.toUpperCase()}`,
      'success'
    );
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(4px)',
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
      onClick={onClose}
    >
      <div
        className="github-card animate-fade-in"
        style={{
          width: '100%',
          maxWidth: '520px',
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem',
          boxShadow: 'var(--shadow-md)',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <Shield size={22} color="var(--accent-x)" />
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Autenticación y Cuentas de Google</h2>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              fontSize: '1.2rem',
              cursor: 'pointer',
            }}
          >
            ✕
          </button>
        </div>

        {user && user.provider === 'google' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.85rem',
                padding: '0.85rem',
                background: 'var(--bg-primary)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
              }}
            >
              <img
                src={user.avatarUrl}
                alt={user.name}
                style={{ width: '48px', height: '48px', borderRadius: '50%', border: '2px solid var(--accent-x)', objectFit: 'cover' }}
              />
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '0.98rem', fontWeight: 700 }}>{user.name}</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{user.email}</p>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '4px' }}>
                  <span className="badge badge-public">
                    Autenticado con Google
                  </span>
                  <span className="badge badge-private" style={{ color: 'var(--accent-github-hover)' }}>
                    ✓ Tokens vinculados
                  </span>
                </div>
              </div>
            </div>



            {/* Connected Social Networks (Publer-style integration) */}
            <div>
              <h4 style={{ fontSize: '0.88rem', fontWeight: 700, marginBottom: '0.65rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Globe size={16} color="var(--accent-blue)" /> Redes Sociales Conectadas
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {/* X / Twitter */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.6rem 0.85rem',
                    background: 'var(--bg-tertiary)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-color)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontWeight: 700, color: 'var(--accent-x)' }}>𝕏 (X / Twitter)</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>@{user.email.split('@')[0]}</span>
                  </div>
                  <button
                    className={`btn btn-sm ${user.connectedAccounts.x ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => toggleAccount('x')}
                  >
                    {user.connectedAccounts.x ? <CheckCircle2 size={14} /> : null}
                    {user.connectedAccounts.x ? 'Conectada' : 'Conectar'}
                  </button>
                </div>

                {/* LinkedIn */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.6rem 0.85rem',
                    background: 'var(--bg-tertiary)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-color)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontWeight: 700, color: '#0a66c2' }}>LinkedIn</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Perfil Profesional</span>
                  </div>
                  <button
                    className={`btn btn-sm ${user.connectedAccounts.linkedin ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => toggleAccount('linkedin')}
                  >
                    {user.connectedAccounts.linkedin ? <CheckCircle2 size={14} /> : null}
                    {user.connectedAccounts.linkedin ? 'Conectada' : 'Conectar'}
                  </button>
                </div>

                {/* Facebook */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.6rem 0.85rem',
                    background: 'var(--bg-tertiary)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-color)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontWeight: 700, color: '#1877f2' }}>Facebook</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Página Dev</span>
                  </div>
                  <button
                    className={`btn btn-sm ${user.connectedAccounts.facebook ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => toggleAccount('facebook')}
                  >
                    {user.connectedAccounts.facebook ? <CheckCircle2 size={14} /> : null}
                    {user.connectedAccounts.facebook ? 'Conectada' : 'Conectar'}
                  </button>
                </div>
              </div>
            </div>

            <button className="btn btn-danger" style={{ width: '100%', justifyContent: 'center' }} onClick={onLogout}>
              <LogOut size={16} /> Cerrar Sesión de Google
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
              Conecta tu cuenta de Google para sincronizar tus tokens de GitHub, Gemini API y redes conectadas entre navegadores.
            </p>

            {/* Google OAuth Client ID Configuration Box */}
            <form onSubmit={handleSaveClientId} style={{ background: 'var(--bg-tertiary)', padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                <Key size={15} color="var(--accent-x)" /> Google OAuth Client ID (Google Cloud Console)
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  className="input-text"
                  placeholder="ej. 123456789-abc.apps.googleusercontent.com"
                  value={clientId}
                  onChange={(e) => {
                    setClientId(e.target.value);
                    setIsSavedClientId(false);
                  }}
                  style={{ fontSize: '0.8rem', flex: 1 }}
                />
                <button type="submit" className="btn btn-sm btn-secondary" style={{ whiteSpace: 'nowrap' }}>
                  {isSavedClientId ? 'Guardado ✓' : 'Guardar'}
                </button>
              </div>
            </form>

            {/* Official Google OAuth Popup Button (rendered when Client ID is configured) */}
            {clientId.trim() ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.65rem', padding: '0.5rem 0' }}>
                <div ref={googleBtnRef} style={{ width: '100%', display: 'flex', justifyContent: 'center' }} />
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Al hacer clic se abrirá el Selector de Cuentas oficial de Google.
                </p>
              </div>
            ) : null}

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }} />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>o elige una cuenta de prueba rápida</span>
              <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }} />
            </div>

            {/* Quick Demo Google Accounts Chooser */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <button
                type="button"
                className="btn btn-secondary"
                style={{
                  justifyContent: 'flex-start',
                  padding: '0.65rem 0.85rem',
                  fontSize: '0.88rem',
                  gap: '0.75rem',
                }}
                onClick={() => {
                  onLoginWithGoogle('joel.barrientos@gmail.com', 'Joel Barrientos', 'https://github.com/barrientossjoel.png');
                  showToast('Sesión iniciada con joel.barrientos@gmail.com', 'success');
                  onClose();
                }}
              >
                <img src="https://github.com/barrientossjoel.png" style={{ width: '28px', height: '28px', borderRadius: '50%' }} alt="Joel" />
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: 700 }}>Joel Barrientos</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>joel.barrientos@gmail.com</div>
                </div>
              </button>

              <button
                type="button"
                className="btn btn-secondary"
                style={{
                  justifyContent: 'flex-start',
                  padding: '0.65rem 0.85rem',
                  fontSize: '0.88rem',
                  gap: '0.75rem',
                }}
                onClick={() => {
                  onLoginWithGoogle('barrientossjoel@gmail.com', 'Joel Barrientos Dev', 'https://api.dicebear.com/7.x/bottts/svg?seed=barrientossjoel');
                  showToast('Sesión iniciada con barrientossjoel@gmail.com', 'success');
                  onClose();
                }}
              >
                <img src="https://api.dicebear.com/7.x/bottts/svg?seed=barrientossjoel" style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#1e293b' }} alt="Dev" />
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: 700 }}>Joel Barrientos (Dev)</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>barrientossjoel@gmail.com</div>
                </div>
              </button>
            </div>

            {/* Custom Email / Name Form */}
            <form onSubmit={handleSimulatedSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.25rem' }}>
              <div className="input-group">
                <label className="input-label">O ingresa un Correo Personalizado de Google</label>
                <input
                  type="email"
                  className="input-text"
                  placeholder="tu.email@gmail.com"
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                />
              </div>

              <div className="input-group">
                <label className="input-label">Nombre del Desarrollador</label>
                <input
                  type="text"
                  className="input-text"
                  placeholder="Tu Nombre"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ justifyContent: 'center' }}>
                <LogIn size={16} /> Entrar con este correo
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

