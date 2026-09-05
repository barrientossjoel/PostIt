import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleOAuthCallback, type OAuthProvider } from './_lib/OAuthCallbackHandler.js';

const linkedinProvider: OAuthProvider = {
  name: 'linkedin',
  clientId: process.env.VITE_LINKEDIN_CLIENT_ID,
  clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
  exchangeToken: async (code, redirectUri, clientId, clientSecret) => {
    const res = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
        client_id: clientId,
        client_secret: clientSecret,
      }),
    });
    const data = await res.json() as Record<string, string>;
    if (!data.access_token) {
      throw new Error(data.error_description || 'Error al obtener el token de LinkedIn');
    }
    return data;
  },
  fetchProfile: async (tokenData) => {
    const res = await fetch('https://api.linkedin.com/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const profile = await res.json() as Record<string, string>;

    return {
      name: profile.name || profile.given_name || 'Usuario LinkedIn',
      handle: profile.email?.split('@')[0] || profile.sub || 'linkedin_user',
      avatar: profile.picture || '',
    };
  },
};

export default function handler(req: VercelRequest, res: VercelResponse) {
  return handleOAuthCallback(req, res, linkedinProvider);
}
