const CSI_RE = /^\x1b\[[0-9;?]*[ -/]*[@-~]/;
const OSC_RE = /^\x1b\][^\x07]*(?:\x07|\x1b\\)/;

export function stripAnsi(input: string): string {
  return stripChunk(input);
}

export class AnsiStripper {
  private carry = "";

  push(input: string): string {
    let s = this.carry + input;
    this.carry = "";

    const lastEsc = s.lastIndexOf("\x1b");
    if (lastEsc >= 0) {
      const tail = s.slice(lastEsc);
      if (/^\x1b(?:\[[0-9;?]*[ -/]*)?$/.test(tail) || /^\x1b\][^\x07]*$/.test(tail)) {
        this.carry = tail;
        s = s.slice(0, lastEsc);
      }
    }

    return stripChunk(s);
  }

  flush(): string {
    const rest = this.carry;
    this.carry = "";
    return stripChunk(rest);
  }
}

function stripChunk(s: string): string {
  let out = "";
  let i = 0;
  while (i < s.length) {
    if (s[i] === "\x1b") {
      const tail = s.slice(i);
      const osc = tail.match(OSC_RE);
      if (osc) {
        i += osc[0].length;
        continue;
      }
      const csi = tail.match(CSI_RE);
      if (csi) {
        i += csi[0].length;
        continue;
      }
      break;
    }

    // Terminal TUIs frequently redraw one status line with carriage returns and
    // backspaces. Preserve CR so the parser can keep only the newest redraw,
    // and apply backspace locally so activity text does not show control junk.
    if (s[i] === "\b") {
      out = out.slice(0, -1);
      i += 1;
      continue;
    }
    if (s[i] === "\r") {
      out += "\r";
      i += 1;
      continue;
    }

    out += s[i];
    i += 1;
  }
  return out;
}

const CONTROL_CHARS = /[\x00-\x07\x0b\x0c\x0e-\x1f\x7f]/g;

export function sanitizeDisplayText(text: string, maxLen = 120): string {
  const cleaned = stripAnsi(text).replace(CONTROL_CHARS, "").replace(/\s+/g, " ").trim();
  if (!cleaned) return "";
  return cleaned.length > maxLen ? `${cleaned.slice(0, maxLen - 1)}…` : cleaned;
}
