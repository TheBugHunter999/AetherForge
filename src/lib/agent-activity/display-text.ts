export function truncateText(text: string, maxLen: number): string {
  const t = text.trim();
  if (t.length <= maxLen) return t;
  return `${t.slice(0, Math.max(0, maxLen - 1))}…`;
}

export function shortPath(path: string, maxLen = 56): string {
  const norm = path.replace(/\\/g, "/").trim();
  if (!norm) return "";
  const parts = norm.split("/").filter(Boolean);
  const shortened = parts.length <= 2 ? norm : `…/${parts.slice(-2).join("/")}`;
  return truncateText(shortened, maxLen);
}

export function formatStepFiles(files: string[], maxFiles = 3, maxEach = 32): string {
  if (!files.length) return "";
  const shown = files.slice(0, maxFiles).map((f) => {
    const base = f.split(/[/\\]/).pop() ?? f;
    return truncateText(base, maxEach);
  });
  const extra = files.length - maxFiles;
  return extra > 0 ? `${shown.join(", ")}, +${extra} more` : shown.join(", ");
}

export function normalizeActivityTitle(title: string, maxLen = 72): string {
  return truncateText(title.replace(/\s+/g, " "), maxLen);
}