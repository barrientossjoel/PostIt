export interface CommitAuthor {
  name: string;
  email: string;
  date: string;
  username?: string;
  avatarUrl?: string;
}

export interface Commit {
  sha: string;
  message: string;
  author: CommitAuthor;
  htmlUrl: string;
  repoFullName: string;
}
