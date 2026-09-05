import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleOAuthCallback, type OAuthProvider } from './_lib/OAuthCallbackHandler.js';

const threadsProvider: OAuthProvider = {
  name: 'threads',
  clientId: process.env.VITE_THREADS_CLIENT_ID,
  clientSecret: process.env.THREADS_CLIENT_SECRET,
  exchangeToken: async (code, redirectUri, clientId, clientSecret) => {
    const res = await fetch('https://graph.threads.net/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
        code,
      }),
    });
    const data = await res.json() as Record<string, string>;
    if (!data.access_token) {
      throw new Error(data.error_message || data.error || 'Error al obtener el token de Threads');
    }
    return data;
  },
  fetchProfile: async (tokenData) => {
    const res = await fetch(
      `https://graph.threads.net/v1.0/${tokenData.user_id}?fields=id,username,name,threads_profile_picture_url&access_token=${tokenData.access_token}`
    );
    const profile = await res.json() as Record<string, string>;

    return {
      name: profile.name || profile.username || 'Usuario Threads',
      handle: profile.username || tokenData.user_id,
      avatar: profile.threads_profile_picture_url || '',
    };
  },
};

export default function handler(req: VercelRequest, res: VercelResponse) {
  return handleOAuthCallback(req, res, threadsProvider);
}
