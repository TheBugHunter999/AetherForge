import { solveLayout, clampPanelSize, computeMinWindowSize } from "./solver";
import type { LayoutConstraintState, LayoutMeasure, LayoutUserIntent } from "./types";

function measure(w: number, h: number): LayoutMeasure {
  return { workspaceWidth: w, workspaceHeight: h, outerWidth: w + 40, outerHeight: h + 92 };
}

function intent(partial: Partial<LayoutUserIntent> = {}): LayoutUserIntent {
  return {
    sidebarOpen: true,
    secondaryOpen: true,
    panelOpen: true,
    panelSize: 320,
    zenMode: false,
    ...partial,
  };
}

const config = { panelLocation: "right" as const, uiDensity: "comfortable" as const };
const bottomConfig = { panelLocation: "bottom" as const, uiDensity: "comfortable" as const };

export function runLayoutTests(): { name: string; ok: boolean; detail?: string }[] {
  const results: { name: string; ok: boolean; detail?: string }[] = [];
  const assert = (name: string, ok: boolean, detail?: string) => {
    results.push({ name, ok, detail: ok ? undefined : detail ?? "failed" });
  };

  const allOpenAt860 = solveLayout(measure(860, 508), config, intent());
  assert(
    "side panel all open at 860w yields editor >= 200 or auto-collapse",
    allOpenAt860.snapshot.editorWidth >= 200 ||
      !allOpenAt860.snapshot.secondaryOpen ||
      !allOpenAt860.snapshot.sidebarOpen ||
      !allOpenAt860.snapshot.panelOpen,
    `editor=${allOpenAt860.snapshot.editorWidth}`,
  );

  const crushed = solveLayout(measure(540, 508), config, intent());
  assert(
    "crushed width auto-collapses secondary first",
    !crushed.snapshot.secondaryOpen || crushed.snapshot.editorWidth >= 200,
    `secondary=${crushed.snapshot.secondaryOpen} editor=${crushed.snapshot.editorWidth}`,
  );

  const zen = solveLayout(measure(860, 508), config, intent({ zenMode: true }));
  assert("zen hides sidebars", !zen.snapshot.sidebarOpen && !zen.snapshot.secondaryOpen);

  const bottom = solveLayout(measure(860, 400), bottomConfig, intent({ secondaryOpen: false, panelSize: 320 }));
  assert(
    "bottom panel clamps height preserving editor min",
    bottom.snapshot.editorHeight >= 200 || !bottom.snapshot.panelOpen,
    `editorH=${bottom.snapshot.editorHeight} panel=${bottom.snapshot.panelSize}`,
  );

  assert(
    "clampPanelSize subtracts reserved sidebar width for side dock",
    clampPanelSize(400, 860, { reservedAlongAxis: 520 }) <= 140,
    `got ${clampPanelSize(400, 860, { reservedAlongAxis: 520 })}`,
  );

  const mins = computeMinWindowSize(config, true);
  assert("min window width >= 1080 with all panels", mins.width >= 1080, `got ${mins.width}`);
  assert("min window height >= 680", mins.height >= 680, `got ${mins.height}`);

  const constraint: LayoutConstraintState = {
    collapsedByConstraint: { secondary: true, sidebar: false, panel: false },
    lastConstraintCollapseWidth: 800,
  };
  const restored = solveLayout(measure(900, 508), config, intent(), constraint);
  assert(
    "hysteresis restores secondary when width grows",
    restored.snapshot.secondaryOpen,
    `secondary=${restored.snapshot.secondaryOpen}`,
  );

  assert("panel size 0 when panel closed", solveLayout(measure(900, 508), config, intent({ panelOpen: false })).snapshot.panelSize === 0);

  return results;
}