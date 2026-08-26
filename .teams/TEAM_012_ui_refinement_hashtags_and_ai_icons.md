# TEAM_012 — UI Refinement: Redundant Alerts, Hashtags Cleanup & Delayed Hover AI Tooltips

## Status
- **Phase:** Implementation Planning
- **Status:** Pending User Confirmation

## Goals & Requirements
1. **Remove Redundant Character Warning Box:**
   - Delete the large red alert card ("Excede el límite de X") under the text area.
   - Keep only the character counter (with auto-trim action) in the top-right corner of the Simulator / Editor header (`626 / 280`).
2. **Remove Hashtags Field & Logic completely:**
   - Remove the "Hashtags (separados por espacio)" input field from `PostPreviewContainer.tsx`.
   - Remove separate hashtag appending / state so posts only contain pure content.
3. **Icon-Only AI Optimization Bar with 1-Second Delayed Hover Tooltip:**
   - Replace text buttons in the AI bar ("Optimizar con IA", "Redactar/Estructurar", "Más corto", "Emojis Dev", "Inglés") with sleek icon-only buttons (`Wand2`, `Zap`, `Sparkles`, `Globe2`).
   - Implement custom CSS tooltips (or delayed title hover) that reveal the description text only after 1 second of hovering over the icon.

## Proposed Approach
1. **PostPreviewContainer.tsx & SocialCardSimulator.tsx**:
   - Remove the hashtags input field and `hashtagsStr` state.
   - Remove the red bottom warning alert box; preserve top-right counter & trim button.
   - Convert AI action bar into a single-row icon-only bar with CSS `:hover` delayed tooltips (`transition-delay: 1s`).
2. **CSS Styling (`index.css` or component inline CSS)**:
   - Create lightweight CSS classes for delayed tooltips: `tooltip-delayed` with `transition: opacity 0.2s 1s, visibility 0.2s 1s`.

## Verification Plan
1. Check Editor view: No hashtags input, no red bottom alert box.
2. Check top-right counter: Color turns red on >280 chars with trim button right next to it.
3. Check AI bar: Compact icon buttons, hovering for 1 second smoothly shows tooltip text.
