import React, { useState } from 'react';
import type { UserProfile } from '../../core/entities/User';
import { LogIn, LogOut, CheckCircle2, Globe, Shield } from 'lucide-react';

interface Props {
  user: UserProfile | null;
  isOpen: boolean;
  onClose: () => void;
  onLoginWithGoogle: (email?: string, name?: string) => void;
  onLogout: () => void;
  onUpdateConnectedAccounts: (accounts: UserProfile['connectedAccounts']) => void;
  showToast: (msg: string, type?: 'success' | 'error') => void;
}

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

  if (!isOpen) return null;

  const handleSimulatedGoogleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const email = customEmail || 'dev.usuario@gmail.com';
    const name = customName || 'Usuario Google PostIt';
    onLoginWithGoogle(email, name);
    showToast(`Sesión iniciada con Google (${email})`, 'success');
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
          maxWidth: '480px',
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem',
          boxShadow: 'var(--shadow-md)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <Shield size={22} color="var(--accent-x)" />
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Cuenta & Autenticación Google</h2>
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
                style={{ width: '46px', height: '46px', borderRadius: '50%', border: '2px solid var(--accent-x)' }}
              />
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '0.98rem', fontWeight: 700 }}>{user.name}</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{user.email}</p>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '4px' }}>
                  <span className="badge badge-public">
                    Autenticado con Google
                  </span>
                  <span className="badge badge-private" style={{ color: 'var(--accent-github-hover)' }}>
                    ✓ Tokens vinculados a la cuenta
                  </span>
                </div>
              </div>
            </div>

            {/* Connected Social Networks (Publer-style integration) */}
            <div>
              <h4 style={{ fontSize: '0.88rem', fontWeight: 700, marginBottom: '0.65rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Globe size={16} color="var(--accent-blue)" /> Redes Sociales Conectadas (Estilo Publer)
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
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Página de Dev</span>
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
          <form onSubmit={handleSimulatedGoogleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Inicia sesión con tu cuenta de Google para guardar tus tokens de GitHub, Gemini API y redes conectadas de forma privada y personal.
            </p>

            <button
              type="button"
              className="btn btn-secondary"
              style={{
                width: '100%',
                justifyContent: 'center',
                padding: '0.75rem',
                fontSize: '0.92rem',
                fontWeight: 700,
                background: '#ffffff',
                color: '#000000',
                borderColor: '#dddddd',
              }}
              onClick={() => {
                onLoginWithGoogle('joel.barrientos@gmail.com', 'Joel Barrientos');
                showToast('Autenticado con Google (joel.barrientos@gmail.com)', 'success');
                onClose();
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              Iniciar Sesión con Google 1-Click
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0.25rem 0' }}>
              <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }} />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>o ingresa datos manuales</span>
              <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }} />
            </div>

            <div className="input-group">
              <label className="input-label">Correo de Google</label>
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
              <LogIn size={16} /> Continuar con Google
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
