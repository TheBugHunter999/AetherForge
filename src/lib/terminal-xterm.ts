/** Shared xterm fit/resize helpers — avoids PTY resize storms that break Grok TUI alt-screen. */

export type TermDims = { cols: number; rows: number };

export const DEFAULT_RESIZE_DEBOUNCE_MS = 120;

const ALT_ENTER_RE = /\x1b\[[0-9;]*\?1049h|\x1b\[[0-9;]*\?47h/;
const ALT_LEAVE_RE = /\x1b\[[0-9;]*\?1049l|\x1b\[[0-9;]*\?47l/;

export function debounce<T extends (...args: never[]) => void>(fn: T, ms: number): T {
  let timer: ReturnType<typeof setTimeout> | undefined;
  return ((...args: never[]) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      timer = undefined;
      fn(...args);
    }, ms);
  }) as T;
}

export function dimsChanged(prev: TermDims | null, next: TermDims): boolean {
  if (!prev) return true;
  return prev.cols !== next.cols || prev.rows !== next.rows;
}

export function clampDims(cols: number, rows: number): TermDims | null {
  if (!Number.isFinite(cols) || !Number.isFinite(rows)) return null;
  const c = Math.floor(cols);
  const r = Math.floor(rows);
  if (c < 2 || r < 2) return null;
  return { cols: c, rows: r };
}

export function hostSizeChanged(
  prevW: number,
  prevH: number,
  w: number,
  h: number,
  threshold = 1,
): boolean {
  return Math.abs(w - prevW) >= threshold || Math.abs(h - prevH) >= threshold;
}

/** Track alternate-screen (Grok TUI) from PTY output chunks. */
export function parseAltScreenActive(chunk: string, wasActive: boolean): boolean {
  let active = wasActive;
  for (const part of chunk.split(/(?=\x1b)/)) {
    if (ALT_ENTER_RE.test(part)) active = true;
    if (ALT_LEAVE_RE.test(part)) active = false;
  }
  return active;
}

/** Gate PTY resize: skip cache hits and defer while alt-screen is active. */
export function shouldNotifyPtyResize(
  cached: TermDims | null,
  proposed: TermDims | null,
  options?: { altScreenActive?: boolean },
): boolean {
  const clamped = proposed ? clampDims(proposed.cols, proposed.rows) : null;
  if (!clamped) return false;
  if (!dimsChanged(cached, clamped)) return false;
  if (options?.altScreenActive) return false;
  return true;
}