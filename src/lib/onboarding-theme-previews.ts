export type ThemePreviewSpec = {
  id: string;
  label: string;
  frame: string;
  sidebar: string;
  editor: string;
  accent: string;
  lines: string[];
};

import { THEMES } from "./theme-palette";

function previewFromTheme(id: string, label: string): ThemePreviewSpec {
  const t = THEMES[id];
  return {
    id,
    label,
    frame: t.surfaceRaised,
    sidebar: t.panel,
    editor: t.editorBg,
    accent: t.accent,
    lines: [t.accentMuted, t.danger, t.info, t.success],
  };
}

export const ONBOARDING_THEMES: ThemePreviewSpec[] = [
  previewFromTheme("codex", "Codex"),
  previewFromTheme("obsidian", "Obsidian"),
  previewFromTheme("aurora", "Aurora"),
  previewFromTheme("frost", "Frost"),
  previewFromTheme("midnight", "Midnight"),
];
