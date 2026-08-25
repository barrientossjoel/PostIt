export interface Repository {
  id: number;
  name: string;
  fullName: string;
  isPrivate: boolean;
  htmlUrl: string;
  description: string | null;
  language: string | null;
  stargazersCount: number;
  updatedAt: string;
  defaultBranch: string;
}
