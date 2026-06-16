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