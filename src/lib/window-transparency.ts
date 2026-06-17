import { invoke } from "@tauri-apps/api/core";

export async function applyWindowTransparency(percent: number): Promise<void> {
  try {
    await invoke("set_window_transparency", { percent });
  } catch {
    /* browser dev */
  }
}