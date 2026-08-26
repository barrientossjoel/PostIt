# TEAM 009 — Require Auth & Isolate Sample Data in Production

## Overview & Goal
Ensure that the production deployment does not load default user sessions (`DEFAULT_GOOGLE_USER`), sample posts, or sample GitHub repositories when a user is not logged in. Anyone visiting the remote app without an active Google session must start with an unauthenticated (`user === null`) clean state, requiring login to access their account data and settings.

## Root Cause Analysis
1. **`App.tsx`**: `user` state initializes to `DEFAULT_GOOGLE_USER` whenever `postit_user_session` is absent from `localStorage`.
2. **`LocalStorageRepository.ts`**: `seedInitialDataIfEmpty()` seeds sample posts (`Nout`, `PostIt`) unconditionally upon initialization.
3. **`GithubApiAdapter.ts`**: Falls back to `SAMPLE_REPOS` and `SAMPLE_COMMITS_MAP` unconditionally whenever `!token`.

## Planned Approach
1. **Authentication Requirement in `App.tsx`**:
   - Default `user` state to `null` when no saved session exists in `localStorage`.
   - Update main application tabs (`RepoExplorer`, `PendingQueue`, `PostPreview`, `Settings`) to display a clean, friendly unauthenticated screen with a "Iniciar Sesión con Google" button when `user === null`.

2. **Sample Data Isolation**:
   - In `GithubApiAdapter.ts`: Limit `SAMPLE_REPOS` fallback strictly to local dev mode (`import.meta.env.DEV`). Return `[]` when `!token` in production.
   - In `LocalStorageRepository.ts`: Only seed `INITIAL_SAMPLE_POSTS` if in local dev mode (`import.meta.env.DEV`) or for explicit demo testing, ensuring production users start with a clean database tied to their logged-in account.

3. **Verification**:
   - Test application startup without `localStorage` session to confirm `user === null`.
   - Verify unauthenticated UI prompts for login.
   - Verify logging in via Google hydrates settings and posts cleanly.
   - Run production build (`bun run build`) to ensure zero lint or type errors.

## Handoff Checklist
- [x] Project builds cleanly (`bun run build`).
- [x] All tests / type checks pass.
- [x] Unauthenticated state verified (no default Joe session or sample posts in production mode).
- [x] Team log updated.
