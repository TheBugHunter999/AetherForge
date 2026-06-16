import type { AppSettings } from "$lib/editor-utils";
import { cssVarsToStyle, solveLayout } from "./solver";
import type { LayoutConstraintState, LayoutMeasure, LayoutUserIntent } from "./types";
import { syncWindowMinSize } from "./layout-tauri";

export function createLayoutConstraintState(): LayoutConstraintState {
  return {
    collapsedByConstraint: { secondary: false, sidebar: false, panel: false },
    lastConstraintCollapseWidth: 0,
  };
}

export type LayoutReconcileInput = {
  settings: AppSettings;
  measure: LayoutMeasure;
  sidebarCollapsed: boolean;
  secondarySidebarOpen: boolean;
  terminalOpen: boolean;
  terminalHeight: number;
  constraint: LayoutConstraintState;
};

export type LayoutReconcileOutput = {
  sidebarCollapsed: boolean;
  secondarySidebarOpen: boolean;
  terminalOpen: boolean;
  terminalHeight: number;
  constraint: LayoutConstraintState;
  panelSize: number;
  layoutStyle: string;
  snapshot: ReturnType<typeof solveLayout>["snapshot"];
};

export function reconcileLayout(input: LayoutReconcileInput): LayoutReconcileOutput {
  const userIntent: LayoutUserIntent = {
    sidebarOpen: !input.sidebarCollapsed && !input.settings.zenMode,
    secondaryOpen: input.secondarySidebarOpen && !input.settings.zenMode,
    panelOpen: input.terminalOpen,
    panelSize: input.terminalHeight,
    zenMode: input.settings.zenMode,
  };

  const { snapshot, constraint } = solveLayout(
    input.measure,
    {
      panelLocation: input.settings.panelDefaultLocation,
      uiDensity: input.settings.uiDensity as "comfortable" | "compact" | "spacious",
    },
    userIntent,
    input.constraint,
  );

  void syncWindowMinSize(snapshot.minWindowWidth, snapshot.minWindowHeight);

  return {
    sidebarCollapsed: !snapshot.sidebarOpen,
    secondarySidebarOpen: snapshot.secondaryOpen,
    terminalOpen: snapshot.panelOpen,
    terminalHeight: snapshot.panelSize || input.terminalHeight,
    constraint,
    panelSize: snapshot.panelSize,
    layoutStyle: cssVarsToStyle(snapshot.cssVars),
    snapshot,
  };
}

let reconcileRaf = 0;

export function scheduleLayoutReconcile(run: () => void): void {
  if (reconcileRaf) cancelAnimationFrame(reconcileRaf);
  reconcileRaf = requestAnimationFrame(() => {
    reconcileRaf = 0;
    run();
  });
}