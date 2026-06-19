# Grokden UI Fix Pass — Patch File Decisions

Investigation of `static/grokden-*.css/.js` vs Svelte layout state in `+page.svelte`.

## Root cause

Two layout systems fight: Svelte state (`userSidebarOpen`, `sidebarCollapsed`, `userTerminalOpen`, `runLayoutReconcile`) and injected patches that toggle CSS classes / guess DOM by button text.

## Per-file decisions

| File | Decision | Reason |
|------|----------|--------|
| `grokden-rail-sidebar.css` | **DELETE** | Forces narrow `--grok-rail-w` + `overflow:hidden !important`; hides labels → clipped eyebrows. Replaced by `ActivityRail.svelte` scoped styles. |
| `grokden-sidebar.css` | **DELETE** (Phase 1) | Global nav rail styles; folded into `ActivityRail.svelte` scoped `<style>`. |
| `grokden-layout-controls.js` | **DELETE** (Phase 2) | DOM guessing (`clickButtonByText`, `classList.toggle` on `.ide`). Replaced by `ChromeMenuBar.svelte` bound to Svelte state. |
| `grokden-layout-controls.css` | **SLIM** (Phase 2) | Keep menu/toolbar button chrome only; remove `.grokden-activity-rail-hidden` hack. |
| `grokden-menu-panel-safe.js` | **DELETE** | Not linked in `app.html`; redundant once menu is Svelte. |
| `grokden-terminal-dnd-force.css` | **DELETE** (Phase 3) | Floating card overlay + bright inset borders on terminal wrapper. DnD lives in `Terminal.svelte`. |
| `grokden-terminal-dnd-force.js` | **DELETE** (Phase 3) | Duplicate DnD layer; `Terminal.svelte` `handleImageDrop` is source of truth. |
| `grokden-tab-panel-safe.css` | **SLIM** (Phase 3) | Remove terminal rounded/shadow/fixed-height rules; keep editor tab strip safety rules. |
| `grokden-final-ui-reset.css` | **DELETE** (Phase 4) | Masks broken terminal/sidebar states via `!important` class overrides. Svelte state owns visibility. |
| `grokden-premium-theme-fix.css` | **DELETE** (Phase 4) | Fold real token fixes into `grokden-tokens.css` / `grokden-premium-theme.css`. |
| `grokden-interaction-v2.js` | **DELETE** (Phase 4) | Not linked; legacy class toggles on `.ide`. |
| `grokden-ui-hotfix.js` | **SLIM** (Phase 4) | Remove terminal hide-class sync; keep menu hover behavior if still needed. |
| `grokden-tokens.css` | **KEEP** | Single source of truth for `--panel`, `--border`, `--terminal-bg`, etc. |
| `grokden-premium-theme.css` | **KEEP** | Theme presets; bridge to tokens. |
| `grokden-premium-theme.js` | **KEEP** | Runtime theme application. |
| `grokden-glass.css` | **KEEP** | Glass window mode tokens. |
| `grokden-smooth-layout.css` | **KEEP** | Explorer sidebar hide transition; scoped to `.workspace-panels .sidebar`. |
| `grokden-windowed-core.css` / `narrow.css` | **KEEP** | Window chrome sizing. |
| `grokden-vscode-editor.css` | **KEEP** | Editor gutter/tab styling. |
| `grokden-welcome.css` / `project-home.css` / `canvas.css` | **KEEP** | View-specific; no layout conflict. |
| `grokden-ui.css` | **KEEP** | Shared primitives from redesign. |
| `liquid-glass-*.css` / `liquid-glass-navigation.js` | **KEEP (for now)** | Legacy glass polish; revisit after core layout is stable. |

## State ownership (target)

| Concern | Owner |
|---------|-------|
| Nav rail width 248/56 | `sidebarCollapsed` in `+page.svelte` + `localStorage["Grokden.sidebar.collapsed"]` |
| Explorer sidebar open | `userSidebarOpen` + `grokden-sidebar-hidden` on `.workspace-panels .sidebar` |
| Secondary sidebar | `userSecondaryOpen` / `secondarySidebarOpen` |
| Terminal panel | `userTerminalOpen` / `terminalOpen` |
| Layout toolbar + menu | `ChromeMenuBar.svelte` (direct state bindings) |
| Imperative bridge | `installLayoutBridge` — extended for any remaining static scripts |