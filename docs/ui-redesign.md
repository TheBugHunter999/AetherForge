# Grokden UI Redesign Log

## Phase 1 — Design tokens

- Added `static/grokden-tokens.css` as canonical token source (loaded first in `app.html`).
- Retuned `grokden-premium-theme.css` `--grok-*` bridge to alias unified tokens.
- Fixed `pickOnColor()` in `color-utils.ts` for WCAG AA 4.5:1 on accent pairs.

### Legacy CSS removals

_(Track `!important` patch removals here in Phase 8.)_