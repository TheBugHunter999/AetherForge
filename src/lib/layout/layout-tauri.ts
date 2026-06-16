import { LogicalSize } from "@tauri-apps/api/dpi";
import { getCurrentWindow } from "@tauri-apps/api/window";

let lastMinWidth = 0;
let lastMinHeight = 0;

export async function syncWindowMinSize(width: number, height: number): Promise<void> {
  if (width === lastMinWidth && height === lastMinHeight) return;
  lastMinWidth = width;
  lastMinHeight = height;
  try {
    const win = getCurrentWindow();
    await win.setMinSize(new LogicalSize(width, height));
  } catch {
    /* browser dev */
  }
}

