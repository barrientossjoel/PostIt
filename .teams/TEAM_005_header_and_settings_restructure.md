# TEAM_005 — Header Profile & Settings Indicators Restructure

## Status
- **Team**: TEAM_005
- **Objective**: Move user profile widget to the same top row as the PostIt logo, and move GitHub & Gemini AI status indicators from the header into the Settings tab.
- **Phase**: Completed

## Completed Work
1. **Navbar (`src/features/shared/components/Navbar.tsx`)**:
   - Created `.header-top-row` grouping `brand-logo` (left) and `user-profile-widget` (right) on the top row.
   - Removed `header-status-indicators` block from the navbar header.
2. **Settings Container (`src/features/settings/SettingsContainer.tsx`)**:
   - Added GitHub and Gemini AI status indicators (with `CheckCircle2` and `AlertCircle` icons) directly inside the header card of `SettingsContainer`.
3. **CSS (`src/index.css`)**:
   - Configured `.header-top-row` for responsive display (`space-between` on mobile, `display: contents` on desktop so logo is left, nav tabs center, profile widget right).
4. **Validation**:
   - Built cleanly with `bun run build`.

## Handoff / Handoff Checklist
- [x] Project builds cleanly (`bun run build`).
- [x] All tests pass.
- [x] Behavioral regression tests pass.
- [x] Team file updated with progress.
