import { invoke } from "@tauri-apps/api/core";

export type DroppedTerminalImage = {
  path: string;
  source: "file" | "url" | "data-url";
  label: string;
};

const IMAGE_EXT_RE = /\.(png|jpe?g|webp|gif|bmp|svg)(\?|#|$)/i;
const DATA_IMAGE_RE = /^data:image\//i;
const HTTP_RE = /^https?:\/\//i;

function isImageFile(file: File): boolean {
  return file.type.toLowerCase().startsWith("image/") || IMAGE_EXT_RE.test(file.name);
}

function unique<T>(items: T[]): T[] {
  return [...new Set(items)];
}

function firstHtmlImageUrl(html: string): string[] {
  const urls: string[] = [];
  const imgRe = /<img\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/gi;
  for (const match of html.matchAll(imgRe)) urls.push(match[1]);
  return urls;
}

function urlsFromText(text: string): string[] {
  return text
    .split(/\r?\n|\s+/)
    .map((part) => part.trim())
    .filter(Boolean)
    .filter((part) => HTTP_RE.test(part) || DATA_IMAGE_RE.test(part) || part.startsWith("file://"));
}

function urlsFromUriList(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"));
}

async function saveFileLikeImage(file: File): Promise<DroppedTerminalImage> {
  const directPath = (file as File & { path?: string }).path;
  if (directPath) {
    return { path: directPath, source: "file", label: file.name || directPath };
  }

  const bytes = Array.from(new Uint8Array(await file.arrayBuffer()));
  const path = await invoke<string>("save_dropped_image", {
    fileName: file.name || "dropped-image.png",
    mimeType: file.type || null,
    bytes,
  });
  return { path, source: "file", label: file.name || "dropped image" };
}

async function saveDataUrl(url: string): Promise<DroppedTerminalImage> {
  const response = await fetch(url);
  const blob = await response.blob();
  const mimeType = blob.type || "image/png";
  const ext = mimeType.includes("jpeg") || mimeType.includes("jpg")
    ? "jpg"
    : mimeType.includes("webp")
      ? "webp"
      : mimeType.includes("gif")
        ? "gif"
        : mimeType.includes("svg")
          ? "svg"
          : "png";
  const bytes = Array.from(new Uint8Array(await blob.arrayBuffer()));
  const path = await invoke<string>("save_dropped_image", {
    fileName: `dropped-image.${ext}`,
    mimeType,
    bytes,
  });
  return { path, source: "data-url", label: "embedded image" };
}

function fileUrlToPath(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "file:") return null;
    return decodeURIComponent(parsed.pathname.replace(/^\/(.):\//, "$1:/"));
  } catch {
    return null;
  }
}

async function saveUrlImage(url: string): Promise<DroppedTerminalImage> {
  const filePath = fileUrlToPath(url);
  if (filePath) return { path: filePath, source: "file", label: filePath.split(/[\\/]/).pop() || filePath };

  if (DATA_IMAGE_RE.test(url)) return saveDataUrl(url);

  const path = await invoke<string>("download_dropped_image", { url });
  return { path, source: "url", label: url };
}

async function droppedUrls(dt: DataTransfer): Promise<string[]> {
  const urls: string[] = [];
  const types = Array.from(dt.types || []);

  if (types.includes("text/uri-list")) {
    urls.push(...urlsFromUriList(dt.getData("text/uri-list")));
  }
  if (types.includes("text/html")) {
    urls.push(...firstHtmlImageUrl(dt.getData("text/html")));
  }
  if (types.includes("text/plain")) {
    urls.push(...urlsFromText(dt.getData("text/plain")));
  }

  return unique(urls).filter((url) => DATA_IMAGE_RE.test(url) || url.startsWith("file://") || HTTP_RE.test(url));
}

export async function collectDroppedTerminalImages(dt: DataTransfer): Promise<DroppedTerminalImage[]> {
  const images: DroppedTerminalImage[] = [];

  const files = Array.from(dt.files || []).filter(isImageFile);
  for (const file of files) images.push(await saveFileLikeImage(file));

  const seenPaths = new Set(images.map((image) => image.path));
  for (const url of await droppedUrls(dt)) {
    try {
      const saved = await saveUrlImage(url);
      if (!seenPaths.has(saved.path)) {
        images.push(saved);
        seenPaths.add(saved.path);
      }
    } catch (error) {
      console.warn("[Grokden] Failed to import dropped image URL:", url, error);
    }
  }

  return images;
}

function quotePath(path: string): string {
  const escaped = path.replace(/"/g, '\\"');
  return `"${escaped}"`;
}

export function formatDroppedImagesForTerminal(images: DroppedTerminalImage[]): string {
  if (images.length === 0) return "";
  if (images.length === 1) return ` Image: ${quotePath(images[0].path)} `;
  return ` Images: ${images.map((image) => quotePath(image.path)).join(" ")} `;
}
