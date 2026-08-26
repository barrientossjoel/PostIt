export interface UserProfile {
  id: string;
  email: string;
  name: string;
  handle?: string;
  avatarUrl: string;
  provider: 'google' | 'guest';
  githubToken?: string;
  geminiApiKey?: string;
  connectedAccounts: {
    x: boolean;
    linkedin: boolean;
    facebook: boolean;
  };
}

