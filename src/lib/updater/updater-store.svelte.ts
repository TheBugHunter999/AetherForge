import {
  checkForUpdate,
  downloadUpdate,
  parseReleaseNotes,
  restartApp,
} from "$lib/updater/updater-bridge";
import type { Update } from "@tauri-apps/plugin-updater";

export type UpdaterPhase =
  | "idle"
  | "checking"
  | "available"
  | "downloading"
  | "installing"
  | "ready"
  | "error";

export type UpdateIndicatorState = "hidden" | "available" | "active";

let pendingUpdate = $state<Update | null>(null);

export const updater = $state({
  phase: "idle" as UpdaterPhase,
  version: "",
  notes: [] as string[],
  progress: null as number | null,
  error: "",
  overlayOpen: false,
});

export function getIndicatorState(): UpdateIndicatorState {
  if (updater.phase === "available") return "available";
  if (updater.phase === "downloading" || updater.phase === "installing" || updater.phase === "ready") {
    return "active";
  }
  return "hidden";
}

export function openOverlay(): void {
  updater.overlayOpen = true;
}

export function dismissOverlay(): void {
  if (updater.phase === "downloading" || updater.phase === "installing") return;
  updater.overlayOpen = false;
  if (updater.phase === "error") {
    updater.phase = pendingUpdate ? "available" : "idle";
    updater.error = "";
  }
}

export async function check(allowPrerelease = false): Promise<void> {
  if (updater.phase === "checking" || updater.phase === "downloading" || updater.phase === "installing") {
    return;
  }
  updater.phase = "checking";
  updater.error = "";
  try {
    const update = await checkForUpdate();
    if (!update) {
      updater.phase = "idle";
      pendingUpdate = null;
      updater.version = "";
      updater.notes = [];
      return;
    }
    pendingUpdate = update;
    updater.version = update.version;
    updater.notes = parseReleaseNotes(update.body);
    updater.phase = "available";
    if (allowPrerelease && import.meta.env.DEV) {
      console.info("[Grokden] Update available:", update.version);
    }
  } catch (err) {
    updater.phase = "error";
    updater.error = err instanceof Error ? err.message : String(err);
    if (import.meta.env.DEV) {
      console.warn("[Grokden] Update check failed:", updater.error);
    }
  }
}

export async function startDownload(): Promise<void> {
  const update = pendingUpdate;
  if (!update) return;
  updater.overlayOpen = true;
  updater.phase = "downloading";
  updater.progress = 0;
  updater.error = "";
  try {
    await downloadUpdate(update, (pct) => {
      updater.progress = pct;
    });
    updater.phase = "installing";
    updater.progress = 100;
    updater.phase = "ready";
    await restartApp();
  } catch (err) {
    updater.phase = "error";
    updater.error = err instanceof Error ? err.message : String(err);
    updater.progress = null;
  }
}

export async function retry(): Promise<void> {
  updater.error = "";
  if (pendingUpdate) {
    await startDownload();
    return;
  }
  await check();
}

export async function restart(): Promise<void> {
  await restartApp();
}