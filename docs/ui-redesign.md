# Grokden UI Redesign Log

## Phase 1 — Design tokens

**File:** `static/grokden-tokens.css` (loaded first in `app.html`)

Canonical tokens for all five themes. `grokden-premium-theme.css` `--grok-*` bridge aliases unified tokens. `pickOnColor()` enforces WCAG AA 4.5:1.

## Phase 2 — Glass system

**File:** `static/grokden-glass.css` — `.glass`, `.glass--strong`, `.glass--pill`

## Phase 3 — Labeled sidebar

**Component:** `src/lib/Sidebar.svelte` | **Styles:** `static/grokden-sidebar.css`

## Phase 4–5 — Welcome hero + command pill

Real SuperGrok HEAVY hero, glass command pill, ambient grid/vignette.

## Phase 6 — Skills & Connectors

**Component:** `src/lib/SkillsConnectors.svelte` | View id: `"skills"`

## Phase 7 — Shared primitives

**File:** `static/grokden-ui.css`

| Class | Use |
|-------|-----|
| `.btn`, `.btn--primary/secondary/ghost/danger` | Buttons |
| `.input`, `.select` | Form controls |
| `.card` | Canvas-style panels |
| `.chip`, `.badge`, `.eyebrow`, `.empty-state` | Labels / empty states |
| `.menu`, `.popover`, `.dialog` | Glass overlays |
| `.dark-scrollbar`, `.grok-scrollbar` | Themed scrollbars |

**Restyled components:** ParallelAgents, Canvas toolbar, SearchPanel, SourceControl, Settings (nav + theme cards), ProjectHome cards, FolderTrustDialog, UpdateOverlay, LaunchSplash (tokens), Onboarding, terminal header.

## Phase 8 — Cleanup

### Legacy CSS scoping fixes (removed cross-contamination)

| File | Change |
|------|--------|
| `grokden-smooth-layout.css` | `.grokden-sidebar-hidden` scoped to `.workspace-panels .sidebar` (not nav rail) |
| `grokden-rail-sidebar.css` | Explorer panel rules scoped to `.workspace-panels .sidebar` |
| `grokden-final-ui-reset.css` | Same scoping |
| `grokden-windowed-core.css` / `narrow.css` | Narrow viewport hide scoped to workspace panel |
| `grokden-interaction-v2.js` / `layout-controls.js` / `liquid-glass-navigation.js` | Query `.workspace-panels .sidebar` |

### Functional fixes (10-agent audit)

| Issue | Fix |
|-------|-----|
| Launch Grok CLI button missing from top bar | Restored in `+page.svelte` |
| Recent workspaces never persisted | `recordRecentWorkspace()` in `branding.ts` |
| Welcome agent preset not applied to settings | `applyWelcomeAgentPreset()` + WelcomeView wiring |
| Search/SCM didn't dismiss overlay views | `dismissOverlayViews()` + `openWorkspacePanel()` |
| Nav sidebar hidden when workspace panel collapsed | CSS scoping to `.workspace-panels .sidebar` |
| `buildThemeStyle` missing `--panel-2`, `--bg-elevated`, etc. | Added alias tokens in `editor-utils.ts` |
| Canvas pan swallowed toolbar clicks | `isChromeTarget()` guard in `Canvas.svelte` |
| `railActiveItem` didn't reflect active view | View-aware derivation |

### Remaining `!important` patches

Left in place where layout JS or liquid-glass layers still depend on them. Re-test before removing:
- `grokden-premium-theme-fix.css`
- Activity rail width rules in `grokden-rail-sidebar.css` (collapsed nav)

## New components

- `Sidebar.svelte` — labeled left navigation
- `SkillsConnectors.svelte` — WIP placeholder page