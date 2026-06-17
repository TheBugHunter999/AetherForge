import { invoke } from "@tauri-apps/api/core";

const GLASS_VAR_KEYS = [
  "--glass-strength",
  "--glass-panel-bg",
  "--glass-editor-bg",
  "--glass-rail-bg",
  "--glass-border",
] as const;

let chain: Promise<void> = Promise.resolve();
let latestPercent = 100;

async function invokeTransparency(percent: number): Promise<void> {
  await invoke("set_window_transparency", { percent });
}

/** Serialized native transparency updates — latest value always wins. */
export function applyWindowTransparency(percent: number): Promise<void> {
  latestPercent = percent;
  chain = chain.then(async () => {
    const target = latestPercent;
    try {
      await invokeTransparency(target);
    } catch {
      /* browser dev */
    }
  });
  return chain;
}

function applyGlassVarsToRoot(glassStyle: string): void {
  const el = document.documentElement;
  for (const chunk of glassStyle.split(";")) {
    const colon = chunk.indexOf(":");
    if (colon <= 0) continue;
    const key = chunk.slice(0, colon).trim();
    const value = chunk.slice(colon + 1).trim();
    if (key.startsWith("--glass-")) {
      el.style.setProperty(key, value);
    }
  }
}

function clearGlassVarsFromRoot(): void {
  const el = document.documentElement;
  for (const key of GLASS_VAR_KEYS) {
    el.style.removeProperty(key);
  }
}

function applyGlassDom(glass: boolean, glassStyle: string): void {
  if (typeof document === "undefined") return;
  const html = document.documentElement;
  const body = document.body;
  html.classList.toggle("glass-window", glass);
  html.classList.toggle("opaque-window", !glass);
  body.classList.toggle("glass-window", glass);
  body.classList.toggle("opaque-window", !glass);
  if (glass && glassStyle) {
    applyGlassVarsToRoot(glassStyle);
  } else {
    clearGlassVarsFromRoot();
  }
}

/**
 * Keep native and DOM glass state in sync without flicker.
 * Opaque (100%): native layer commits before CSS removes glass.
 * Glass (<100%): DOM glass classes/vars first, then native acrylic.
 */
export async function syncWindowGlass(percent: number, glassStyle: string): Promise<void> {
  const glass = percent < 100;
  if (!glass) {
    await applyWindowTransparency(percent);
    applyGlassDom(false, glassStyle);
  } else {
    applyGlassDom(true, glassStyle);
    await applyWindowTransparency(percent);
  }
}