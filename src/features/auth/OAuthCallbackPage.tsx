import { useEffect } from 'react';

/**
 * This page is rendered inside the OAuth popup window after the platform
 * redirects back to /oauth-callback.
 *
 * It reads the query params set by the Vercel API function, posts a message
 * to the opener (parent window), and closes itself.
 */
export function OAuthCallbackPage() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const error = params.get('error');

    if (error) {
      window.opener?.postMessage({ type: 'oauth_error', error }, window.location.origin);
    } else {
      const platform = params.get('platform');
      const name = params.get('name');
      const handle = params.get('handle');
      const avatar = params.get('avatar');
      window.opener?.postMessage(
        { type: 'oauth_success', platform, name, handle, avatar },
        window.location.origin
      );
    }

    // Give the parent a moment to receive the message, then close the popup.
    setTimeout(() => window.close(), 300);
  }, []);

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-primary, #0d1117)',
        color: '#ffffff',
        fontFamily: 'Inter, sans-serif',
        gap: '1rem',
      }}
    >
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: '50%',
          border: '3px solid var(--accent-cyan, #00e5ff)',
          borderTopColor: 'transparent',
          animation: 'spin 0.7s linear infinite',
        }}
      />
      <p style={{ color: 'var(--text-secondary, #8b949e)', fontSize: '0.9rem' }}>
        Vinculando cuenta… esta ventana se cerrará automáticamente.
      </p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
