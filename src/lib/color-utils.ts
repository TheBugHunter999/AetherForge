/** Perceptual color math for theme accessibility (OKLCH + WCAG contrast). */

export type Rgb = { r: number; g: number; b: number };
export type Oklch = { l: number; c: number; h: number };

const D65 = { x: 0.95047, y: 1.0, z: 1.08883 };

function clamp01(n: number): number {
  return Math.max(0, Math.min(1, n));
}

function srgbToLinear(c: number): number {
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

function linearToSrgb(c: number): number {
  return c <= 0.0031308 ? c * 12.92 : 1.055 * c ** (1 / 2.4) - 0.055;
}

export function hexToRgb(hex: string): Rgb {
  const h = hex.replace("#", "").trim();
  if (h.length === 3) {
    return {
      r: parseInt(h[0] + h[0], 16),
      g: parseInt(h[1] + h[1], 16),
      b: parseInt(h[2] + h[2], 16),
    };
  }
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

export function rgbToHex({ r, g, b }: Rgb): string {
  const to = (n: number) => Math.round(clamp01(n / 255) * 255).toString(16).padStart(2, "0");
  return `#${to(r)}${to(g)}${to(b)}`;
}

export function parseColor(input: string): Rgb | null {
  const value = input.trim();
  if (value.startsWith("#")) return hexToRgb(value);
  const rgba = value.match(/^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)/i);
  if (rgba) {
    return {
      r: Number(rgba[1]),
      g: Number(rgba[2]),
      b: Number(rgba[3]),
    };
  }
  return null;
}

export function relativeLuminance(rgb: Rgb): number {
  const r = srgbToLinear(rgb.r / 255);
  const g = srgbToLinear(rgb.g / 255);
  const b = srgbToLinear(rgb.b / 255);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrastRatio(fg: string, bg: string): number | null {
  const fgRgb = parseColor(fg);
  const bgRgb = parseColor(bg);
  if (!fgRgb || !bgRgb) return null;
  const l1 = relativeLuminance(fgRgb);
  const l2 = relativeLuminance(bgRgb);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

export function meetsWcagAA(ratio: number | null, largeOrSecondary = false): boolean {
  if (ratio == null) return false;
  return ratio >= (largeOrSecondary ? 3 : 4.5);
}

function oklabToLinearRgb(l: number, a: number, b: number): Rgb {
  const l_ = l + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = l - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = l - 0.0894841775 * a - 1.291485548 * b;

  const l3 = l_ ** 3;
  const m3 = m_ ** 3;
  const s3 = s_ ** 3;

  const lr = 4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3;
  const lg = -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3;
  const lb = -0.0041960863 * l3 - 0.7034186147 * m3 + 1.707614701 * s3;

  return {
    r: linearToSrgb(lr) * 255,
    g: linearToSrgb(lg) * 255,
    b: linearToSrgb(lb) * 255,
  };
}

function linearRgbToOklab(rgb: Rgb): { l: number; a: number; b: number } {
  const r = srgbToLinear(rgb.r / 255);
  const g = srgbToLinear(rgb.g / 255);
  const b = srgbToLinear(rgb.b / 255);

  const l = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b;
  const m = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b;
  const s = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b;

  const l_ = Math.cbrt(l);
  const m_ = Math.cbrt(m);
  const s_ = Math.cbrt(s);

  return {
    l: 0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_,
    a: 1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_,
    b: 0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_,
  };
}

export function hexToOklch(hex: string): Oklch {
  const lab = linearRgbToOklab(hexToRgb(hex));
  const c = Math.sqrt(lab.a * lab.a + lab.b * lab.b);
  let h = (Math.atan2(lab.b, lab.a) * 180) / Math.PI;
  if (h < 0) h += 360;
  return { l: lab.l, c, h };
}

export function oklchToHex(l: number, c: number, h: number): string {
  const hr = (h * Math.PI) / 180;
  const a = c * Math.cos(hr);
  const b = c * Math.sin(hr);
  return rgbToHex(oklabToLinearRgb(l, a, b));
}

export function adjustOklch(hex: string, delta: Partial<Oklch>): string {
  const base = hexToOklch(hex);
  return oklchToHex(
    delta.l ?? base.l,
    delta.c ?? base.c,
    delta.h ?? base.h,
  );
}

/** Mix foreground over opaque background (alpha compositing). */
export function compositeRgba(fg: string, bg: string): string | null {
  const m = fg.match(/^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+))?\s*\)$/i);
  if (!m) return null;
  const a = m[4] != null ? Number(m[4]) : 1;
  const fr = Number(m[1]);
  const fgG = Number(m[2]);
  const fb = Number(m[3]);
  const bgRgb = parseColor(bg);
  if (!bgRgb) return null;
  const r = Math.round(fr * a + bgRgb.r * (1 - a));
  const g = Math.round(fgG * a + bgRgb.g * (1 - a));
  const b = Math.round(fb * a + bgRgb.b * (1 - a));
  return rgbToHex({ r, g, b });
}

export function rgbaFromRgb(hex: string, alpha: number): string {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha.toFixed(3)})`;
}

/** Pick readable foreground (light or dark) for a background. */
export function pickOnColor(bgHex: string): string {
  const lum = relativeLuminance(hexToRgb(bgHex));
  return lum > 0.45 ? "#0f172a" : "#f8fafc";
}