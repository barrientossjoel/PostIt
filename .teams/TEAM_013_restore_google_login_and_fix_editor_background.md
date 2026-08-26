# TEAM_013 — Restore Google Login & Enhance Text Editor Background

## Objectives
1. **Fondo del Editor (Text Editor Background)**:
   - Fix the dark/black background of `.publer-textarea-container` and `.publer-textarea-input` in `src/index.css`.
   - Upgrade the text area styling with an elegant dark slate surface (`#0d0f12` / `#12151a`), crisp borders, refined focus ring, and high-contrast placeholder styling to ensure maximum legibility and premium look.

2. **Google Login / Authentication ("No veo lo del login")**:
   - Restore `src/features/auth/GoogleAuthModal.tsx`.
   - Add the Google Auth / User Account button back to `Navbar.tsx` top-right header so users can easily see their login status and click to sign in or switch accounts.
   - Connect user authentication state (`user`, `setUser`, `openAuthModal`) in `App.tsx` and ensure session settings sync properly.

## Handoff Checklist
- [x] Project builds cleanly (`bun run build`).
- [x] All TypeScript types check out without errors.
- [x] Restored `GoogleAuthModal.tsx` and connected session handlers in `App.tsx`.
- [x] Added Google login / user profile button in top-right header of `Navbar.tsx` reusing existing `account-item-row`, `account-avatar`, and `btn` classes.
- [x] Cleaned up `index.css` by removing 60+ lines of redundant ad-hoc classes.
- [x] Refactored editor text area background (`.publer-textarea-container`) to `#0d0f12` for clear contrast and legibility.
- [x] Removed manual text inputs ("Nombre del Perfil o Cuenta" and "Nombre de Usuario / Handle") from `AddSocialAccountModal.tsx`.
- [x] Implemented automatic 1-click Google/GitHub login session reading for connecting social accounts.
- [x] Verified via browser agent and visual snapshot test.



