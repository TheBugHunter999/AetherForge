export const APP_DISPLAY_NAME = "Grokden";
export const WELCOME_TAGLINE = "Your AI workspace. Build, orchestrate, ship.";
export const RECENT_WORKSPACES_STORAGE_KEY = "Grokden.recentWorkspaces";

export type RecentWorkspaceEntry = {
  path: string;
  name: string;
  lastOpened?: number;
};

const RECENT_WORKSPACES_MAX = 12;

function workspaceDisplayName(path: string): string {
  return path.split(/[/\\]+/).filter(Boolean).pop() ?? path;
}

export function loadRecentWorkspaces(): RecentWorkspaceEntry[] {
  if (typeof localStorage === "undefined") return [];
  migrateLegacyBrandingStorage();
  try {
    const raw = localStorage.getItem(RECENT_WORKSPACES_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as RecentWorkspaceEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function recordRecentWorkspace(path: string): RecentWorkspaceEntry[] {
  if (typeof localStorage === "undefined") return [];
  const normalized = path.trim();
  if (!normalized) return loadRecentWorkspaces();

  const name = workspaceDisplayName(normalized);
  const now = Date.now();
  const existing = loadRecentWorkspaces().filter((entry) => entry.path !== normalized);
  const updated: RecentWorkspaceEntry[] = [
    { path: normalized, name, lastOpened: now },
    ...existing,
  ].slice(0, RECENT_WORKSPACES_MAX);

  localStorage.setItem(RECENT_WORKSPACES_STORAGE_KEY, JSON.stringify(updated));
  return updated;
}

const STORAGE_KEY_MIGRATIONS: Array<{ legacy: string; current: string }> = [
  { legacy: "AetherForge.settings", current: "Grokden.settings" },
  { legacy: "AetherForge.session", current: "Grokden.session" },
  { legacy: "AetherForge.onboarding", current: "Grokden.onboarding" },
  { legacy: "AetherForge.folderTrust", current: "Grokden.folderTrust" },
  { legacy: "AetherForge.premiumGrokTheme.enabled", current: "Grokden.premiumGrokTheme.enabled" },
  { legacy: "AetherForge.liquidGlassDefault.v1", current: "Grokden.liquidGlassDefault.v1" },
  { legacy: "AetherForgeTest.settings", current: "Grokden.settings" },
  { legacy: "AetherForgeTest.session", current: "Grokden.session" },
  { legacy: "AetherForgeTest.onboarding", current: "Grokden.onboarding" },
  { legacy: "AetherForgeTest.folderTrust", current: "Grokden.folderTrust" },
  { legacy: "AetherForgeTest.premiumGrokTheme.enabled", current: "Grokden.premiumGrokTheme.enabled" },
  { legacy: "AetherForgeTest.liquidGlassDefault.v1", current: "Grokden.liquidGlassDefault.v1" },
  { legacy: "aetherforge.settings", current: "Grokden.settings" },
  { legacy: "aetherforge.session", current: "Grokden.session" },
  { legacy: "aetherforge.onboarding", current: "Grokden.onboarding" },
  { legacy: "aetherforge.folderTrust", current: "Grokden.folderTrust" },
];

const LEGACY_STORAGE_PREFIXES = ["AetherForge.", "AetherForgeTest.", "aetherforge.", "aetherforgetest."];

export function migrateLegacyBrandingStorage(): void {
  if (typeof localStorage === "undefined") return;

  for (const { legacy, current } of STORAGE_KEY_MIGRATIONS) {
    if (localStorage.getItem(current) !== null) continue;
    const value = localStorage.getItem(legacy);
    if (value !== null) {
      localStorage.setItem(current, value);
    }
  }

  const keys: string[] = [];
  for (let i = 0; i < localStorage.length; i += 1) {
    const key = localStorage.key(i);
    if (key) keys.push(key);
  }

  for (const key of keys) {
    const prefix = LEGACY_STORAGE_PREFIXES.find((candidate) => key.startsWith(candidate));
    if (!prefix) continue;

    const current = `Grokden.${key.slice(prefix.length)}`;
    if (localStorage.getItem(current) !== null) continue;

    const value = localStorage.getItem(key);
    if (value !== null) {
      localStorage.setItem(current, value);
    }
  }
}

export async function syncAppBranding(): Promise<void> {
  if (typeof document !== "undefined") {
    document.title = APP_DISPLAY_NAME;
  }

  try {
    const { getCurrentWindow } = await import("@tauri-apps/api/window");
    await getCurrentWindow().setTitle(APP_DISPLAY_NAME);
  } catch {
    /* browser dev */
  }
}

export function migrateLegacyBranding(): void {
  migrateLegacyBrandingStorage();
}