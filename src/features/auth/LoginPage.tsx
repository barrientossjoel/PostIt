import React, { useState, useEffect, useRef } from 'react';

interface Props {
  onLoginWithGoogle: (email: string, name: string, avatarUrl?: string) => void;
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

export const LoginPage: React.FC<Props> = ({ onLoginWithGoogle, showToast }) => {
  const [clientId] = useState<string>(() => {
    return import.meta.env.VITE_GOOGLE_CLIENT_ID || localStorage.getItem('postit_google_client_id') || '';
  });
  const [googleScriptLoaded, setGoogleScriptLoaded] = useState(false);
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
    if (!googleScriptLoaded || !clientId || !window.google?.accounts?.id || !googleBtnRef.current) return;

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
  }, [googleScriptLoaded, clientId, onLoginWithGoogle, showToast]);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-primary)',
      padding: '1rem',
    }}>
      <div className="github-card animate-fade-in" style={{ width: '100%', maxWidth: '420px', padding: '2.5rem 2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem' }}>Bienvenido a Post It</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2.5rem' }}>
          Inicia sesión para gestionar tus publicaciones.
        </p>
        
        {clientId ? (
          <div ref={googleBtnRef} style={{ width: '100%', display: 'flex', justifyContent: 'center', minHeight: '40px' }} />
        ) : (
          <div style={{ color: 'var(--accent-red)', fontSize: '0.85rem', padding: '1rem', border: '1px solid var(--accent-red)', borderRadius: '8px' }}>
            Falta configurar VITE_GOOGLE_CLIENT_ID en el archivo .env
          </div>
        )}
      </div>
    </div>
  );
};
