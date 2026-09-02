import type { VercelRequest, VercelResponse } from '@vercel/node';

export interface OAuthProvider {
  name: string;
  clientId: string | undefined;
  clientSecret: string | undefined;
  exchangeToken: (code: string, redirectUri: string, clientId: string, clientSecret: string) => Promise<any>;
  fetchProfile: (tokenData: any) => Promise<{ name: string; handle: string; avatar: string }>;
}

export async function handleOAuthCallback(req: VercelRequest, res: VercelResponse, provider: OAuthProvider) {
  const { code, error } = req.query;

  const appUrl = process.env.VITE_APP_URL || `https://${req.headers.host}`;

  if (error || !code) {
    const msg = encodeURIComponent(String(error || 'Autorización cancelada'));
    return res.redirect(`${appUrl}/oauth-callback?error=${msg}`);
  }

  const redirectUri = `${appUrl}/api/${provider.name}-callback`;

  if (!provider.clientId || !provider.clientSecret) {
    return res.redirect(`${appUrl}/oauth-callback?error=missing_credentials`);
  }

  try {
    const tokenData = await provider.exchangeToken(String(code), redirectUri, provider.clientId, provider.clientSecret);
    const profile = await provider.fetchProfile(tokenData);

    return res.redirect(
      `${appUrl}/oauth-callback?platform=${provider.name}&name=${encodeURIComponent(profile.name)}&handle=${encodeURIComponent(profile.handle)}&avatar=${encodeURIComponent(profile.avatar)}`
    );
  } catch (err: any) {
    console.error(`[${provider.name}-callback] Error:`, err);
    const msg = err.message ? encodeURIComponent(err.message) : 'server_error';
    return res.redirect(`${appUrl}/oauth-callback?error=${msg}`);
  }
}
