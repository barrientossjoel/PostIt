export interface SocialAccount {
  id: string;
  name: string;
  handle: string;
  platform: 'linkedin' | 'x' | 'threads' | 'instagram';
  avatarUrl?: string;
  selected: boolean;
}
