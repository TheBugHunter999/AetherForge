import { invoke } from "@tauri-apps/api/core";

export async function prepareWizardWindow(): Promise<void> {
  try {
    await invoke("prepare_wizard_window");
  } catch {
    // Browser dev fallback.
  }
}

export async function transitionToWorkspace(): Promise<void> {
  try {
    await invoke("transition_to_workspace");
  } catch {
    // Browser dev fallback.
  }
}

export async function signalAppReady(): Promise<void> {
  try {
    await invoke("app_ready");
  } catch {
    // Browser dev fallback.
  }
}

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}