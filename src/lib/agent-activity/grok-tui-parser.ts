import type { StepKind, ToolKind } from "$lib/agent-activity/types";
import { AnsiStripper, sanitizeDisplayText } from "$lib/agent-activity/grok-ansi";
import { shortPath } from "$lib/agent-activity/display-text";

export type ParserEvent =
  | { type: "step_start"; title: string; kind: StepKind; toolKind?: ToolKind; files?: string[] }
  | { type: "step_end"; title?: string }
  | { type: "status"; title: string };

const LEADING_STATUS_MARK = /^(?:[>›*•●○◦\-–—▶]\s*)?/;

const TOOL_PATTERNS: { re: RegExp; kind: ToolKind; label: (m: RegExpMatchArray) => string }[] = [
  {
    re: /^(?:[>›*•●○◦\-–—▶]\s*)?(?:read(?:ing)?|open(?:ing)?)\s+(?:file\s+)?[`'"]?([^`'"\n]{2,140})[`'"]?\s*$/i,
    kind: "read",
    label: (m) => `Reading ${shortPath(cleanTarget(m[1]))}`,
  },
  {
    re: /^(?:[>›*•●○◦\-–—▶]\s*)?(?:writ(?:e|ing)|sav(?:e|ing)|creat(?:e|ing))\s+(?:file\s+)?[`'"]?([^`'"\n]{2,140})[`'"]?\s*$/i,
    kind: "write",
    label: (m) => `Writing ${shortPath(cleanTarget(m[1]))}`,
  },
  {
    re: /^(?:[>›*•●○◦\-–—▶]\s*)?(?:edit(?:ing)?|patch(?:ing)?|updat(?:e|ing))\s+(?:file\s+)?[`'"]?([^`'"\n]{2,140})[`'"]?\s*$/i,
    kind: "write",
    label: (m) => `Editing ${shortPath(cleanTarget(m[1]))}`,
  },
  {
    re: /^(?:[>›*•●○◦\-–—▶]\s*)?(?:run(?:ning)?|exec(?:uting)?|executed)\s+(?:command\s+)?[`'"]?([^`'"\n]{3,160})[`'"]?\s*$/i,
    kind: "execute",
    label: (m) => `Running ${trimCmd(m[1])}`,
  },
  {
    re: /^(?:[>›*•●○◦\-–—▶]\s*)?(?:grep(?:ping)?|search(?:ing)?)\s+(?:for\s+)?[`'"]?([^`'"\n]{2,140})[`'"]?\s*$/i,
    kind: "search",
    label: (m) => `Searching ${trimCmd(m[1])}`,
  },
  {
    re: /^(?:[>›*•●○◦\-–—▶]\s*)?image-to-video\s+(.{3,140})$/i,
    kind: "execute",
    label: (m) => `Video: ${trimCmd(m[1])}`,
  },
  {
    re: /^(?:[>›*•●○◦\-–—▶]\s*)?\/imagine(?:-video)?\s+(.{3,140})$/i,
    kind: "execute",
    label: (m) => `Imagine: ${trimCmd(m[1])}`,
  },
];

function cleanTarget(value: string): string {
  return sanitizeDisplayText(value.replace(/[.,;:]$/, ""), 80);
}

function trimCmd(cmd: string): string {
  return sanitizeDisplayText(cmd, 48);
}

function normalizeLine(raw: string): string {
  const idx = raw.lastIndexOf("\r");
  return sanitizeDisplayText(idx >= 0 ? raw.slice(idx + 1) : raw, 220);
}

function looksLikePromptOrEcho(line: string): boolean {
  return (
    /^(?:PS\s+)?[A-Za-z]:[\\/].*[>#$]\s*/.test(line) ||
    /^\w+@[\w.-]+:.*[$#]\s*/.test(line) ||
    /^\$\s+/.test(line) ||
    /^>\s*(?:npm|pnpm|yarn|git|cargo|tauri|node|python|grok)\b/i.test(line)
  );
}

const BOX_DRAWING_RE = /[\u2500-\u257F\u2580-\u259F\u25A0-\u25FF\u2800-\u28FF\uE000-\uF8FF]/;
const PARTIAL_TUI_RE =
  /(?:\[\s*\d{0,3}%?\s*\]|█{2,}|░{2,}|▓{2,}|─{2,}|│|┌|┐|└|┘|├|┤|┬|┴|┼|╭|╮|╰|╯|╱|╲|╳)/;

function looksLikeTuiNoise(line: string): boolean {
  if (/\u001b/.test(line)) return true;
  if (BOX_DRAWING_RE.test(line)) return true;
  if (PARTIAL_TUI_RE.test(line)) return true;
  if (/^[\W_]+$/.test(line)) return true;
  if (/^[\s\-_=|/\\.+*#@~`^]+$/u.test(line)) return true;

  const body = line.replace(LEADING_STATUS_MARK, "");
  if (!body || body.length > 180) return true;

  const letters = body.match(/\p{L}/gu)?.length ?? 0;
  if (letters < 2) return true;

  const oddChars = body.replace(/[\p{L}\p{N}\s._/@:+=,()\[\]{}'"`\\\-]/gu, "").length;
  return oddChars > Math.max(4, body.length * 0.22);
}

export function isSafeActivityLine(line: string): boolean {
  if (line.length < 3 || line.length > 180) return false;
  if (looksLikePromptOrEcho(line)) return false;
  if (looksLikeTuiNoise(line)) return false;
  if (/^(?:user|assistant|system|error|warning):/i.test(line)) return false;
  return true;
}

export class GrokTuiParser {
  private buffer = "";
  private lastTitle = "";
  private consumedLines = 0;
  private ansi = new AnsiStripper();

  push(chunk: string): ParserEvent[] {
    this.buffer += this.ansi.push(chunk);
    if (this.buffer.length > 8000) {
      const trimmed = this.buffer.slice(-4000);
      const lineCount = trimmed.split("\n").length;
      this.buffer = trimmed;
      this.consumedLines = Math.max(0, this.consumedLines - lineCount);
    }
    return this.parseCompleteLines();
  }

  flush(): ParserEvent[] {
    const tail = this.ansi.flush();
    if (tail) this.buffer += tail;
    return this.parseCompleteLines();
  }

  private parseCompleteLines(): ParserEvent[] {
    const parts = this.buffer.split("\n");
    const completeCount = this.buffer.endsWith("\n") ? parts.length : parts.length - 1;
    const events: ParserEvent[] = [];

    for (let i = this.consumedLines; i < completeCount; i++) {
      const event = this.matchLine(normalizeLine(parts[i] ?? ""));
      if (!event || event.type === "step_end") continue;
      if (event.title === this.lastTitle) continue;
      this.lastTitle = event.title;
      events.push(event);
    }

    this.consumedLines = completeCount;
    return events;
  }

  private matchLine(line: string): ParserEvent | null {
    if (!isSafeActivityLine(line)) return null;

    if (/^(?:[>›*•●○◦\-–—▶]\s*)?(?:thinking|reasoning|analyzing|planning|working)(?:[.… ]*)$/i.test(line)) {
      return { type: "step_start", title: "Thinking…", kind: "thought" };
    }

    if (/^(?:[>›*•●○◦\-–—▶]\s*)?(?:waiting for|needs|requires|requesting).{0,36}(?:approval|permission|confirm)/i.test(line)) {
      return { type: "step_start", title: "Waiting for your approval", kind: "permission" };
    }

    if (/^(?:[>›*•●○◦\-–—▶]\s*)?loading[.… ]*$/i.test(line)) {
      return { type: "step_start", title: "Loading…", kind: "thought" };
    }

    for (const pat of TOOL_PATTERNS) {
      const m = line.match(pat.re);
      if (!m) continue;
      const title = sanitizeDisplayText(pat.label(m));
      if (!title) continue;
      return {
        type: "step_start",
        title,
        kind: "tool_call",
        toolKind: pat.kind,
        files: m[1] ? [cleanTarget(m[1])] : undefined,
      };
    }

    return null;
  }
}