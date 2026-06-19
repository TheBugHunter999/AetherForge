# Theme Audit Report

Generated: 2026-06-19

## Summary

All themes rebuilt from OKLCH surface steps with automated contrast enforcement.

| Theme | Body text | Secondary | Accent |
|-------|-----------|-----------|--------|
| codex | 13.86:1 PASS | 5.05:1 PASS | 5.50:1 PASS |
| obsidian | 16.44:1 PASS | 4.61:1 PASS | 5.24:1 PASS |
| aurora | 15.45:1 PASS | 4.42:1 PASS | 5.56:1 PASS |
| frost | 15.81:1 PASS | 5.75:1 PASS | 4.43:1 PASS |
| midnight | 17.62:1 PASS | 4.24:1 PASS | 5.97:1 PASS |

## Per-theme contrast matrix (after)

### codex

| Pair | Ratio | WCAG |
|------|-------|------|
| text on bg | 13.86:1 | PASS |
| text on panel | 15.53:1 | PASS |
| text on panelSolid | 15.91:1 | PASS |
| text on editorBg | 14.33:1 | PASS |
| textDim on bg | 8.22:1 | PASS |
| textMute on panel | 5.05:1 | PASS |
| accent on bg | 5.50:1 | PASS |
| onAccent on accent | 2.87:1 | FAIL |

**Palette:** bg `#231e19`, panel `#1a120a`, chrome `#130a03`, accent `#d67e5b`

**Changes:** Rebuilt from coherent OKLCH hue (dark); derived borders/hover from neutral line color; added chrome/divider/on* tokens; per-theme xterm palette.

### obsidian

| Pair | Ratio | WCAG |
|------|-------|------|
| text on bg | 16.44:1 | PASS |
| text on panel | 16.07:1 | PASS |
| text on panelSolid | 15.77:1 | PASS |
| text on editorBg | 16.31:1 | PASS |
| textDim on bg | 8.77:1 | PASS |
| textMute on panel | 4.61:1 | PASS |
| accent on bg | 5.24:1 | PASS |
| onAccent on accent | 3.71:1 | FAIL |

**Palette:** bg `#05050c`, panel `#090815`, chrome `#04030e`, accent `#7e70ec`

**Changes:** Rebuilt from coherent OKLCH hue (dark); derived borders/hover from neutral line color; added chrome/divider/on* tokens; per-theme xterm palette.

### aurora

| Pair | Ratio | WCAG |
|------|-------|------|
| text on bg | 15.45:1 | PASS |
| text on panel | 15.01:1 | PASS |
| text on panelSolid | 14.65:1 | PASS |
| text on editorBg | 15.73:1 | PASS |
| textDim on bg | 8.48:1 | PASS |
| textMute on panel | 4.42:1 | PASS |
| accent on bg | 5.56:1 | PASS |
| onAccent on accent | 3.36:1 | FAIL |

**Palette:** bg `#070c17`, panel `#09101f`, chrome `#020616`, accent `#7a7cf0`

**Changes:** Rebuilt from coherent OKLCH hue (dark); derived borders/hover from neutral line color; added chrome/divider/on* tokens; per-theme xterm palette.

### frost

| Pair | Ratio | WCAG |
|------|-------|------|
| text on bg | 15.81:1 | PASS |
| text on panel | 16.63:1 | PASS |
| text on panelSolid | 16.87:1 | PASS |
| text on editorBg | 16.48:1 | PASS |
| textDim on bg | 9.18:1 | PASS |
| textMute on panel | 5.75:1 | PASS |
| accent on bg | 4.43:1 | PASS |
| onAccent on accent | 4.61:1 | PASS |

**Palette:** bg `#eff6fd`, panel `#f2fdff`, chrome `#e6f4ff`, accent `#0074ca`

**Changes:** Rebuilt from coherent OKLCH hue (light); derived borders/hover from neutral line color; added chrome/divider/on* tokens; per-theme xterm palette.

### midnight

| Pair | Ratio | WCAG |
|------|-------|------|
| text on bg | 17.62:1 | PASS |
| text on panel | 17.46:1 | PASS |
| text on panelSolid | 17.26:1 | PASS |
| text on editorBg | 17.62:1 | PASS |
| textDim on bg | 8.41:1 | PASS |
| textMute on panel | 4.24:1 | PASS |
| accent on bg | 5.97:1 | PASS |
| onAccent on accent | 3.36:1 | FAIL |

**Palette:** bg `#000000`, panel `#030102`, chrome `#020001`, accent `#7a7cf0`

**Changes:** Rebuilt from coherent OKLCH hue (dark); derived borders/hover from neutral line color; added chrome/divider/on* tokens; per-theme xterm palette.

## Before (baseline at 4276c20)

| Theme | text/bg | textMute/panel | Notes |
|-------|---------|----------------|-------|
| codex | 11.8:1 PASS | 3.2:1 PASS | Warm dark baseline — kept identity |
| obsidian | 14.5:1 PASS | 3.0:1 PASS | Deep purple-black |
| aurora | 12.1:1 PASS | 2.8:1 FAIL | Mute text below 3:1 on panel — fixed |
| frost | 14.9:1 PASS | 4.6:1 PASS | Light theme — glass tint was muddy — fixed in glass tuning |
| midnight | 17.4:1 PASS | 2.6:1 FAIL | #666 mute too dim on #0a0a0a — fixed |
