import React, { useState, useEffect, useRef } from 'react';
import { LogIn, X } from 'lucide-react';

interface Props {
  onLoginWithGoogle: (email: string, name: string, avatarUrl?: string) => void;
  onLoginWithEmail: (email: string) => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
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

export const LandingPage: React.FC<Props> = ({ onLoginWithGoogle, onLoginWithEmail, showToast }) => {
  const [clientId] = useState<string>(() => {
    return import.meta.env.VITE_GOOGLE_CLIENT_ID || localStorage.getItem('postit_google_client_id') || '';
  });
  const [googleScriptLoaded, setGoogleScriptLoaded] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const googleBtnRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    if (!googleScriptLoaded || !clientId || !window.google?.accounts?.id || !googleBtnRef.current || !isLoginModalOpen) return;

    try {
      window.google.accounts.id.initialize({
        client_id: clientId.trim(),
        callback: (response: any) => {
          const payload = parseJwt(response.credential);
          if (payload && payload.email) {
            const name = payload.name || payload.email.split('@')[0];
            const avatar = payload.picture || `https://api.dicebear.com/7.x/bottts/svg?seed=${payload.email}`;
            onLoginWithGoogle(payload.email, name, avatar);
            showToast(`¡Sesión iniciada con éxito! (${payload.email})`, 'success');
          } else {
            showToast('No se pudieron leer las credenciales de Google', 'error');
          }
        },
      });

      googleBtnRef.current.innerHTML = '';
      window.google.accounts.id.renderButton(googleBtnRef.current, {
        theme: 'outline',
        size: 'large',
        text: 'signin_with',
        shape: 'rectangular',
        width: 320,
      });
    } catch (err) {
      console.error('Error al inicializar Google GIS:', err);
    }
  }, [googleScriptLoaded, clientId, onLoginWithGoogle, showToast, isLoginModalOpen]);

  const handleEmailLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('Por favor ingresa tu email y contraseña', 'error');
      return;
    }
    // Implement email login
    onLoginWithEmail(email);
    showToast(`¡Sesión iniciada con éxito! (${email})`, 'success');
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--bg-primary)',
    }}>
      {/* Navbar */}
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1.5rem 3rem',
        borderBottom: '1px solid var(--border-color)',
        background: 'var(--bg-secondary)',
      }}>
        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
          Post It
        </div>
        <button 
          onClick={() => setIsLoginModalOpen(true)}
          className="btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <LogIn size={18} />
          Iniciar Sesión
        </button>
      </header>

      {/* Hero Section */}
      <main style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        textAlign: 'center',
      }}>
        <h1 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--text-primary)' }}>
          Bienvenido a Post It
        </h1>
        <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', maxWidth: '600px', marginBottom: '2rem', lineHeight: 1.6 }}>
          Gestiona, automatiza y publica tu contenido en redes sociales de manera fácil e inteligente.
        </p>
        <button 
          onClick={() => setIsLoginModalOpen(true)}
          className="btn-primary"
          style={{ padding: '0.75rem 2rem', fontSize: '1.1rem' }}
        >
          Comenzar ahora
        </button>
      </main>

      {/* Login Modal */}
      {isLoginModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div className="github-card animate-fade-in" style={{ 
            width: '100%', 
            maxWidth: '400px', 
            padding: '2.5rem 2rem', 
            position: 'relative',
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center' 
          }}>
            <button 
              onClick={() => setIsLoginModalOpen(false)}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-secondary)',
                cursor: 'pointer'
              }}
            >
              <X size={24} />
            </button>
            
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>Iniciar Sesión</h2>
            
            <form onSubmit={handleEmailLogin} style={{ width: '100%', marginBottom: '1.5rem' }}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  Usuario o Email
                </label>
                <input 
                  type="text" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ejemplo@correo.com"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '6px',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-primary)',
                    color: 'var(--text-primary)'
                  }}
                />
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  Contraseña
                </label>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '6px',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-primary)',
                    color: 'var(--text-primary)'
                  }}
                />
              </div>
              <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                Iniciar Sesión
              </button>
            </form>

            <div style={{ width: '100%', display: 'flex', alignItems: 'center', margin: '1rem 0' }}>
              <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }}></div>
              <span style={{ padding: '0 1rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>O</span>
              <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }}></div>
            </div>
            
            {clientId ? (
              <div ref={googleBtnRef} style={{ width: '100%', display: 'flex', justifyContent: 'center', minHeight: '40px' }} />
            ) : (
              <div style={{ color: 'var(--accent-red)', fontSize: '0.85rem', padding: '1rem', border: '1px solid var(--accent-red)', borderRadius: '8px' }}>
                Falta configurar VITE_GOOGLE_CLIENT_ID en el archivo .env
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
