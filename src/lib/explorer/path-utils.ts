export const EXPLORER_ROW_HEIGHT = 30;

export function normalizePathKey(path: string): string {
  return path.replace(/\\/g, "/").toLowerCase();
}

export function parentDirectoryPath(filePath: string): string {
  const normalized = filePath.replace(/[/\\]+$/, "");
  const index = Math.max(normalized.lastIndexOf("/"), normalized.lastIndexOf("\\"));
  if (index <= 0) return normalized;
  return normalized.slice(0, index);
}

export function folderDisplayName(folderPath: string | null): string {
  if (!folderPath) return "";
  return folderPath.split(/[/\\]+/).filter(Boolean).pop() ?? folderPath;
}

/** Keep the end of a string; prepend ellipsis when over maxLen (Section 7 path display). */
export function leftTruncate(text: string, maxLen: number, ellipsis = "…"): string {
  const value = text.trim();
  if (maxLen <= 0) return "";
  if (value.length <= maxLen) return value;
  if (ellipsis.length >= maxLen) return ellipsis.slice(0, maxLen);
  return `${ellipsis}${value.slice(value.length - (maxLen - ellipsis.length))}`;
}

/** Keep both ends of a string; ellipsis in the middle when over maxLen (Section 7 path display). */
export function middleTruncate(text: string, maxLen: number, ellipsis = "…"): string {
  const value = text.trim();
  if (maxLen <= 0) return "";
  if (value.length <= maxLen) return value;
  if (ellipsis.length >= maxLen) return ellipsis.slice(0, maxLen);
  const keep = maxLen - ellipsis.length;
  const head = Math.ceil(keep / 2);
  const tail = Math.floor(keep / 2);
  return `${value.slice(0, head)}${ellipsis}${value.slice(value.length - tail)}`;
}