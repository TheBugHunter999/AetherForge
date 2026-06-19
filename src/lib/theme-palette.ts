import {
  contrastRatio,
  meetsWcagAA,
  oklchToHex,
  pickOnColor,
  rgbaFromRgb,
  type Oklch,
} from "./color-utils";

/** Per-theme Liquid Glass tuning — consumed by buildGlassThemeVars (Phase B/C). */
export type ThemeGlassTuning = {
  tintHue: number;
  refraction: number;
  blurMultiplier: number;
  specularStrength: number;
  sheenStrength: number;
  contrastEdgeStrength: number;
  aberrationBias: number;
  isLight: boolean;
};

export type TerminalPalette = {
  black: string;
  red: string;
  green: string;
  yellow: string;
  blue: string;
  magenta: string;
  cyan: string;
  white: string;
  brightBlack: string;
  brightRed: string;
  brightGreen: string;
  brightYellow: string;
  brightBlue: string;
  brightMagenta: string;
  brightCyan: string;
  brightWhite: string;
};

/** Canonical theme token contract — all themes must implement every field. */
export type ThemePalette = {
  bg: string;
  panel: string;
  panelSolid: string;
  editorBg: string;
  chrome: string;
  surfaceRaised: string;
  surfaceOverlay: string;
  surfaceInset: string;
  border: string;
  borderStrong: string;
  borderMuted: string;
  divider: string;
  text: string;
  textDim: string;
  textMute: string;
  textDisabled: string;
  hover: string;
  hoverStrong: string;
  active: string;
  accent: string;
  accentHover: string;
  accentMuted: string;
  onAccent: string;
  success: string;
  onSuccess: string;
  warning: string;
  onWarning: string;
  danger: string;
  onDanger: string;
  info: string;
  onInfo: string;
  /** @deprecated Use `warning` — kept for palette authoring parity. */
  warn: string;
  chipBg: string;
  scrollbar: string;
  scrollbarHover: string;
  selection: string;
  terminal: TerminalPalette;
  glass: ThemeGlassTuning;
  isLight?: boolean;
};

type ThemeSpec = {
  id: string;
  label: string;
  isLight: boolean;
  neutralHue: number;
  neutralChroma: number;
  accentHue: number;
  accentChroma: number;
  surfaces: {
    bg: number;
    panel: number;
    panelSolid: number;
    editorBg: number;
    chrome: number;
    raised: number;
    inset: number;
  };
  text: { primary: number; dim: number; mute: number };
  accent: { l: number; c: number; h: number };
  semantic: {
    success: Oklch;
    warning: Oklch;
    danger: Oklch;
    info: Oklch;
  };
  glass: ThemeGlassTuning;
  terminal: TerminalPalette;
};

function surface(hue: number, chroma: number, l: number): string {
  return oklchToHex(l, chroma, hue);
}

function ensureContrast(fgL: number, bgHex: string, hue: number, chroma: number, isLight: boolean): string {
  let l = fgL;
  const step = isLight ? -0.02 : 0.02;
  const limit = isLight ? 0.12 : 0.98;
  for (let i = 0; i < 24; i++) {
    const hex = oklchToHex(l, chroma, hue);
    const ratio = contrastRatio(hex, bgHex);
    if (meetsWcagAA(ratio, false)) return hex;
    l += step;
    if (isLight ? l < limit : l > limit) break;
  }
  return oklchToHex(fgL, chroma, hue);
}

function ensureSecondaryContrast(fgL: number, bgHex: string, hue: number, chroma: number, isLight: boolean): string {
  let l = fgL;
  const step = isLight ? -0.015 : 0.015;
  const limit = isLight ? 0.2 : 0.92;
  for (let i = 0; i < 20; i++) {
    const hex = oklchToHex(l, chroma, hue);
    const ratio = contrastRatio(hex, bgHex);
    if (meetsWcagAA(ratio, true)) return hex;
    l += step;
    if (isLight ? l < limit : l > limit) break;
  }
  return oklchToHex(fgL, chroma, hue);
}

function buildFromSpec(spec: ThemeSpec): ThemePalette {
  const { neutralHue, neutralChroma, isLight } = spec;
  const fgHue = isLight ? 250 : neutralHue;
  const fgChroma = isLight ? 0.03 : Math.min(neutralChroma, 0.02);

  const bg = surface(neutralHue, neutralChroma, spec.surfaces.bg);
  const panel = surface(neutralHue, neutralChroma + 0.008, spec.surfaces.panel);
  const panelSolid = surface(neutralHue, neutralChroma + 0.01, spec.surfaces.panelSolid);
  const editorBg = surface(neutralHue, neutralChroma, spec.surfaces.editorBg);
  const chrome = surface(neutralHue, neutralChroma + 0.012, spec.surfaces.chrome);
  const surfaceRaised = surface(neutralHue, neutralChroma + 0.015, spec.surfaces.raised);
  const surfaceInset = surface(neutralHue, neutralChroma, spec.surfaces.inset);

  const text = ensureContrast(spec.text.primary, bg, fgHue, fgChroma, isLight);
  const textDim = ensureSecondaryContrast(spec.text.dim, bg, fgHue, fgChroma + 0.01, isLight);
  const textMute = ensureSecondaryContrast(spec.text.mute, panel, fgHue, fgChroma + 0.02, isLight);

  const accent = oklchToHex(spec.accent.l, spec.accent.c, spec.accent.h);
  const accentHover = oklchToHex(
    Math.min(0.78, spec.accent.l + (isLight ? -0.06 : 0.06)),
    spec.accent.c,
    spec.accent.h,
  );
  const accentMuted = oklchToHex(
    isLight ? 0.62 : 0.72,
    spec.accent.c * 0.55,
    spec.accent.h,
  );
  const onAccent = pickOnColor(accent);

  const lineBase = isLight ? "#0f172a" : "#f8fafc";
  const borderAlpha = isLight ? 0.1 : 0.08;
  const borderStrongAlpha = isLight ? 0.16 : 0.14;
  const borderMutedAlpha = isLight ? 0.05 : 0.045;
  const dividerAlpha = isLight ? 0.07 : 0.06;
  const hoverAlpha = isLight ? 0.05 : 0.055;
  const hoverStrongAlpha = isLight ? 0.08 : 0.1;
  const activeAlpha = isLight ? 0.11 : 0.13;
  const chipAlpha = isLight ? 0.05 : 0.065;
  const scrollAlpha = isLight ? 0.2 : 0.24;
  const scrollHoverAlpha = isLight ? 0.34 : 0.38;
  const selectionAlpha = isLight ? 0.2 : 0.24;

  const success = oklchToHex(spec.semantic.success.l, spec.semantic.success.c, spec.semantic.success.h);
  const warning = oklchToHex(spec.semantic.warning.l, spec.semantic.warning.c, spec.semantic.warning.h);
  const danger = oklchToHex(spec.semantic.danger.l, spec.semantic.danger.c, spec.semantic.danger.h);
  const info = oklchToHex(spec.semantic.info.l, spec.semantic.info.c, spec.semantic.info.h);

  return {
    bg,
    panel,
    panelSolid,
    editorBg,
    chrome,
    surfaceRaised,
    surfaceOverlay: rgbaFromRgb(panelSolid, isLight ? 0.94 : 0.92),
    surfaceInset,
    border: rgbaFromRgb(lineBase, borderAlpha),
    borderStrong: rgbaFromRgb(lineBase, borderStrongAlpha),
    borderMuted: rgbaFromRgb(lineBase, borderMutedAlpha),
    divider: rgbaFromRgb(lineBase, dividerAlpha),
    text,
    textDim,
    textMute,
    textDisabled: rgbaFromRgb(text, 0.38),
    hover: rgbaFromRgb(lineBase, hoverAlpha),
    hoverStrong: rgbaFromRgb(lineBase, hoverStrongAlpha),
    active: rgbaFromRgb(lineBase, activeAlpha),
    accent,
    accentHover,
    accentMuted,
    onAccent,
    success,
    onSuccess: pickOnColor(success),
    warning,
    onWarning: pickOnColor(warning),
    danger,
    onDanger: pickOnColor(danger),
    info,
    onInfo: pickOnColor(info),
    warn: warning,
    chipBg: rgbaFromRgb(lineBase, chipAlpha),
    scrollbar: rgbaFromRgb(lineBase, scrollAlpha),
    scrollbarHover: rgbaFromRgb(lineBase, scrollHoverAlpha),
    selection: rgbaFromRgb(accent, selectionAlpha),
    terminal: spec.terminal,
    glass: spec.glass,
    isLight,
  };
}

const THEME_SPECS: ThemeSpec[] = [
  {
    id: "codex",
    label: "Codex",
    isLight: false,
    neutralHue: 68,
    neutralChroma: 0.012,
    accentHue: 42,
    accentChroma: 0.12,
    surfaces: { bg: 0.24, panel: 0.19, panelSolid: 0.175, editorBg: 0.225, chrome: 0.155, raised: 0.28, inset: 0.2 },
    text: { primary: 0.94, dim: 0.78, mute: 0.62 },
    accent: { l: 0.68, c: 0.12, h: 42 },
    semantic: {
      success: { l: 0.62, c: 0.14, h: 155 },
      warning: { l: 0.74, c: 0.12, h: 72 },
      danger: { l: 0.65, c: 0.18, h: 25 },
      info: { l: 0.68, c: 0.1, h: 250 },
    },
    glass: {
      tintHue: 68,
      refraction: 1,
      blurMultiplier: 1,
      specularStrength: 1,
      sheenStrength: 1,
      contrastEdgeStrength: 1,
      aberrationBias: 0.35,
      isLight: false,
    },
    terminal: {
      black: "#1e1d1b",
      red: "#e87070",
      green: "#4ecf8e",
      yellow: "#d4a84f",
      blue: "#6aa8f5",
      magenta: "#c88fd4",
      cyan: "#5ec4d4",
      white: "#eceae6",
      brightBlack: "#7a7772",
      brightRed: "#f5a0a0",
      brightGreen: "#7ee0ac",
      brightYellow: "#e8c878",
      brightBlue: "#94c0fa",
      brightMagenta: "#ddb0e4",
      brightCyan: "#88dce8",
      brightWhite: "#faf9f7",
    },
  },
  {
    id: "obsidian",
    label: "Obsidian",
    isLight: false,
    neutralHue: 285,
    neutralChroma: 0.018,
    accentHue: 285,
    accentChroma: 0.14,
    surfaces: { bg: 0.12, panel: 0.145, panelSolid: 0.16, editorBg: 0.13, chrome: 0.11, raised: 0.2, inset: 0.1 },
    text: { primary: 0.93, dim: 0.74, mute: 0.58 },
    accent: { l: 0.62, c: 0.18, h: 285 },
    semantic: {
      success: { l: 0.64, c: 0.14, h: 160 },
      warning: { l: 0.76, c: 0.14, h: 75 },
      danger: { l: 0.63, c: 0.2, h: 27 },
      info: { l: 0.62, c: 0.16, h: 255 },
    },
    glass: {
      tintHue: 285,
      refraction: 1.05,
      blurMultiplier: 1.08,
      specularStrength: 1.1,
      sheenStrength: 0.95,
      contrastEdgeStrength: 1.05,
      aberrationBias: 0.4,
      isLight: false,
    },
    terminal: {
      black: "#12111a",
      red: "#f07070",
      green: "#3ecf9a",
      yellow: "#e8b04a",
      blue: "#5a9cf5",
      magenta: "#b888e8",
      cyan: "#58c8e8",
      white: "#e8e6f0",
      brightBlack: "#6e6c7e",
      brightRed: "#f8a8a8",
      brightGreen: "#6ee8b4",
      brightYellow: "#f0d070",
      brightBlue: "#88b8fa",
      brightMagenta: "#d0a8f8",
      brightCyan: "#88e0f8",
      brightWhite: "#f8f6ff",
    },
  },
  {
    id: "aurora",
    label: "Aurora",
    isLight: false,
    neutralHue: 265,
    neutralChroma: 0.025,
    accentHue: 280,
    accentChroma: 0.16,
    surfaces: { bg: 0.155, panel: 0.175, panelSolid: 0.19, editorBg: 0.14, chrome: 0.13, raised: 0.24, inset: 0.12 },
    text: { primary: 0.92, dim: 0.74, mute: 0.58 },
    accent: { l: 0.64, c: 0.17, h: 280 },
    semantic: {
      success: { l: 0.72, c: 0.12, h: 165 },
      warning: { l: 0.82, c: 0.13, h: 85 },
      danger: { l: 0.68, c: 0.17, h: 22 },
      info: { l: 0.7, c: 0.12, h: 245 },
    },
    glass: {
      tintHue: 265,
      refraction: 1.12,
      blurMultiplier: 1.1,
      specularStrength: 1.15,
      sheenStrength: 1.05,
      contrastEdgeStrength: 1,
      aberrationBias: 0.5,
      isLight: false,
    },
    terminal: {
      black: "#10121c",
      red: "#f07888",
      green: "#4cd4a0",
      yellow: "#e8c050",
      blue: "#68a8f8",
      magenta: "#b890f8",
      cyan: "#58d0e8",
      white: "#dce4f5",
      brightBlack: "#5e6a85",
      brightRed: "#f8a0b0",
      brightGreen: "#78e8b8",
      brightYellow: "#f0d878",
      brightBlue: "#98c4ff",
      brightMagenta: "#d4b0ff",
      brightCyan: "#88e8ff",
      brightWhite: "#f0f4ff",
    },
  },
  {
    id: "frost",
    label: "Frost",
    isLight: true,
    neutralHue: 250,
    neutralChroma: 0.012,
    accentHue: 250,
    accentChroma: 0.14,
    surfaces: { bg: 0.97, panel: 0.99, panelSolid: 0.995, editorBg: 0.985, chrome: 0.96, raised: 1, inset: 0.94 },
    text: { primary: 0.22, dim: 0.38, mute: 0.5 },
    accent: { l: 0.55, c: 0.16, h: 250 },
    semantic: {
      success: { l: 0.48, c: 0.12, h: 160 },
      warning: { l: 0.58, c: 0.14, h: 65 },
      danger: { l: 0.52, c: 0.18, h: 25 },
      info: { l: 0.5, c: 0.16, h: 255 },
    },
    glass: {
      tintHue: 250,
      refraction: 0.55,
      blurMultiplier: 0.92,
      specularStrength: 0.7,
      sheenStrength: 0.65,
      contrastEdgeStrength: 1.25,
      aberrationBias: 0.2,
      isLight: true,
    },
    terminal: {
      black: "#e2e6ee",
      red: "#c53030",
      green: "#047857",
      yellow: "#b45309",
      blue: "#1d4ed8",
      magenta: "#7c3aed",
      cyan: "#0e7490",
      white: "#1e293b",
      brightBlack: "#64748b",
      brightRed: "#dc2626",
      brightGreen: "#059669",
      brightYellow: "#d97706",
      brightBlue: "#2563eb",
      brightMagenta: "#6d28d9",
      brightCyan: "#0891b2",
      brightWhite: "#0f172a",
    },
  },
  {
    id: "midnight",
    label: "Midnight",
    isLight: false,
    neutralHue: 0,
    neutralChroma: 0,
    accentHue: 280,
    accentChroma: 0.16,
    surfaces: { bg: 0, panel: 0.08, panelSolid: 0.1, editorBg: 0.04, chrome: 0.06, raised: 0.14, inset: 0 },
    text: { primary: 0.94, dim: 0.72, mute: 0.55 },
    accent: { l: 0.64, c: 0.17, h: 280 },
    semantic: {
      success: { l: 0.72, c: 0.12, h: 165 },
      warning: { l: 0.82, c: 0.13, h: 85 },
      danger: { l: 0.68, c: 0.17, h: 22 },
      info: { l: 0.7, c: 0.12, h: 245 },
    },
    glass: {
      tintHue: 280,
      refraction: 1.15,
      blurMultiplier: 1.05,
      specularStrength: 1.2,
      sheenStrength: 0.9,
      contrastEdgeStrength: 1.15,
      aberrationBias: 0.45,
      isLight: false,
    },
    terminal: {
      black: "#0a0a0a",
      red: "#f07070",
      green: "#4cd4a0",
      yellow: "#e8c050",
      blue: "#68a8f8",
      magenta: "#b890f8",
      cyan: "#58d0e8",
      white: "#e8e8e8",
      brightBlack: "#666666",
      brightRed: "#f8a0a0",
      brightGreen: "#78e8b8",
      brightYellow: "#f0d878",
      brightBlue: "#98c4ff",
      brightMagenta: "#d4b0ff",
      brightCyan: "#88e8ff",
      brightWhite: "#ffffff",
    },
  },
];

export const THEMES: Record<string, ThemePalette> = Object.fromEntries(
  THEME_SPECS.map((spec) => [spec.id, buildFromSpec(spec)]),
);

export const themeList = THEME_SPECS.map((spec) => {
  const t = THEMES[spec.id];
  return {
    id: spec.id,
    label: spec.label,
    bg: t.bg,
    text: t.textDim,
    panel: t.panel,
  };
});