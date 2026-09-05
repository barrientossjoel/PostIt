import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleOAuthCallback, type OAuthProvider } from './_lib/OAuthCallbackHandler.js';

const xProvider: OAuthProvider = {
  name: 'x',
  clientId: process.env.VITE_X_CLIENT_ID,
  clientSecret: process.env.X_CLIENT_SECRET,
  exchangeToken: async (code, redirectUri, clientId, clientSecret) => {
    const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    const res = await fetch('https://api.twitter.com/2/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${basicAuth}`,
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
        code_verifier: 'challenge', // matches code_challenge sent in the auth URL
      }),
    });
    const data = await res.json() as Record<string, string>;
    if (!data.access_token) {
      throw new Error(data.error_description || data.error || 'Error al obtener el token de X');
    }
    return data;
  },
  fetchProfile: async (tokenData) => {
    const res = await fetch('https://api.twitter.com/2/users/me?user.fields=name,username,profile_image_url', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const envelope = await res.json() as { data?: Record<string, string> };
    const profile = envelope.data || {};

    return {
      name: profile.name || profile.username || 'Usuario X',
      handle: profile.username || 'x_user',
      avatar: profile.profile_image_url?.replace('_normal', '') || '',
    };
  },
};

export default function handler(req: VercelRequest, res: VercelResponse) {
  return handleOAuthCallback(req, res, xProvider);
}
