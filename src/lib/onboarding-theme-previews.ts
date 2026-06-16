export type ThemePreviewSpec = {
  id: string;
  label: string;
  frame: string;
  sidebar: string;
  editor: string;
  accent: string;
  lines: string[];
};

export const ONBOARDING_THEMES: ThemePreviewSpec[] = [
  {
    id: "grokden-dark",
    label: "Dark Modern",
    frame: "#1a1a22",
    sidebar: "#14141a",
    editor: "#111116",
    accent: "#4a9eff",
    lines: ["#c678dd", "#e06c75", "#4a9eff", "#e5c07b"],
  },
  {
    id: "nord",
    label: "Solarized Dark",
    frame: "#2e3440",
    sidebar: "#3b4252",
    editor: "#2a3040",
    accent: "#88c0d0",
    lines: ["#ebcb8b", "#88c0d0", "#d08770", "#81a1c1"],
  },
  {
    id: "light",
    label: "Light Modern",
    frame: "#e8eaef",
    sidebar: "#f0f2f6",
    editor: "#fafbfc",
    accent: "#5b4cdb",
    lines: ["#7c3aed", "#dc2626", "#2563eb", "#ca8a04"],
  },
  {
    id: "gruvbox-dark",
    label: "Warm Dark",
    frame: "#282b2c",
    sidebar: "#323536",
    editor: "#1a1c1d",
    accent: "#fe8019",
    lines: ["#b8bb26", "#8ec07c", "#fabd2f", "#83a598"],
  },
];