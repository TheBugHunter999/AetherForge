import { check, type Update } from "@tauri-apps/plugin-updater";
import { relaunch } from "@tauri-apps/plugin-process";

export function parseReleaseNotes(body: string | undefined): string[] {
  if (!body?.trim()) return [];
  return body
    .split(/\r?\n/)
    .map((line) => line.replace(/^[-*•]\s*/, "").trim())
    .filter(Boolean);
}

export async function checkForUpdate(): Promise<Update | null> {
  return check();
}

export async function downloadUpdate(
  update: Update,
  onProgress: (pct: number | null) => void,
): Promise<void> {
  let downloaded = 0;
  let total: number | undefined;

  await update.downloadAndInstall((event) => {
    if (event.event === "Started") {
      total = event.data.contentLength ?? undefined;
      downloaded = 0;
      onProgress(total ? 0 : null);
    } else if (event.event === "Progress") {
      downloaded += event.data.chunkLength;
      if (total && total > 0) {
        onProgress(Math.min(100, (downloaded / total) * 100));
      } else {
        onProgress(null);
      }
    } else if (event.event === "Finished") {
      onProgress(100);
    }
  });
}

export async function restartApp(): Promise<void> {
  await relaunch();
}