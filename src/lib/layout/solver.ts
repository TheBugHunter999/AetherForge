import type { PanelLocation } from "$lib/editor-utils";
import {
  CHROME_HEIGHT,
  COLLAPSE_HYSTERESIS,
  EDITOR_MIN,
  PANEL_MAX_RATIO,
  PANEL_MAX_SIZE,
  PANEL_MIN_SIZE,
  PANEL_USER_MIN_SIZE,
  RAIL_WIDTH,
  RAIL_WIDTH_COMPACT,
  SECONDARY_DEFAULT,
  SIDEBAR_DEFAULT,
  WINDOW_MIN_HEIGHT,
  WINDOW_MIN_WIDTH,
} from "./constants";
import type {
  ConstraintCollapseFlags,
  LayoutConfig,
  LayoutConstraintState,
  LayoutMeasure,
  LayoutSolveResult,
  LayoutSnapshot,
  LayoutUserIntent,
  PanelClampOptions,
  UiDensity,
} from "./types";

export {
  PANEL_MIN_SIZE,
  PANEL_MAX_SIZE,
  PANEL_MAX_RATIO,
  EDITOR_MIN as MIN_MAIN_AREA,
} from "./constants";

/** Clamp panel height (bottom) or width (left/right) against workspace span. */
export function clampPanelSize(
  size: number,
  workspaceSpan: number,
  options: PanelClampOptions = {},
): number {
  const minSize = options.minSize ?? PANEL_USER_MIN_SIZE;
  const minMain = options.minMain ?? EDITOR_MIN;
  const maxSize = options.maxSize ?? PANEL_MAX_SIZE;
  const maxRatio = options.maxRatio ?? PANEL_MAX_RATIO;
  const reserved = options.reservedAlongAxis ?? 0;

  if (workspaceSpan <= 0) return 0;

  const effectiveSpan = Math.max(0, workspaceSpan - reserved);
  const maxByRatio = Math.floor(effectiveSpan * maxRatio);
  const maxByMain = Math.max(0, effectiveSpan - minMain);
  const upper = Math.min(maxSize, maxByRatio, maxByMain);
  const lower = Math.min(minSize, upper);

  if (upper <= 0) return 0;
  if (!Number.isFinite(size)) return lower;
  return Math.max(lower, Math.min(upper, size));
}

export function panelWorkspaceSpan(
  location: PanelLocation,
  workspaceWidth: number,
  workspaceHeight: number,
): number {
  return location === "bottom" ? workspaceHeight : workspaceWidth;
}

export function railWidthForDensity(density: UiDensity): number {
  return density === "compact" ? RAIL_WIDTH_COMPACT : RAIL_WIDTH;
}

function fixedSidebarWidth(sidebarOpen: boolean, secondaryOpen: boolean): number {
  return (sidebarOpen ? SIDEBAR_DEFAULT : 0) + (secondaryOpen ? SECONDARY_DEFAULT : 0);
}

function panelReservedAlongAxis(
  location: PanelLocation,
  sidebarOpen: boolean,
  secondaryOpen: boolean,
): number {
  return location === "bottom" ? 0 : fixedSidebarWidth(sidebarOpen, secondaryOpen);
}

function clampPanelForLayout(
  size: number,
  location: PanelLocation,
  workspaceW: number,
  workspaceH: number,
  sidebarOpen: boolean,
  secondaryOpen: boolean,
): number {
  const span = panelWorkspaceSpan(location, workspaceW, workspaceH);
  const reserved = panelReservedAlongAxis(location, sidebarOpen, secondaryOpen);
  return clampPanelSize(size, span, { reservedAlongAxis: reserved });
}

function computeEditorWidth(
  workspaceW: number,
  panelLocation: PanelLocation,
  panelOpen: boolean,
  panelSize: number,
  sidebarOpen: boolean,
  secondaryOpen: boolean,
): number {
  const panelsW =
    panelOpen && panelLocation !== "bottom"
      ? workspaceW - panelSize
      : workspaceW;
  return panelsW - fixedSidebarWidth(sidebarOpen, secondaryOpen);
}

function computeEditorHeight(
  workspaceH: number,
  panelLocation: PanelLocation,
  panelOpen: boolean,
  panelSize: number,
): number {
  if (panelOpen && panelLocation === "bottom") {
    return workspaceH - panelSize;
  }
  return workspaceH;
}

function editorFits(editorW: number, editorH: number): boolean {
  return editorW >= EDITOR_MIN && editorH >= EDITOR_MIN;
}

function emptyConstraint(): LayoutConstraintState {
  return {
    collapsedByConstraint: { secondary: false, sidebar: false, panel: false },
    lastConstraintCollapseWidth: 0,
  };
}

function applyCollapseOrder(
  intent: LayoutUserIntent,
  config: LayoutConfig,
  measure: LayoutMeasure,
  constraint: LayoutConstraintState,
): {
  sidebarOpen: boolean;
  secondaryOpen: boolean;
  panelOpen: boolean;
  panelSize: number;
  constraint: LayoutConstraintState;
} {
  let sidebarOpen = intent.zenMode ? false : intent.sidebarOpen;
  let secondaryOpen = intent.zenMode ? false : intent.secondaryOpen;
  let panelOpen = intent.panelOpen;
  let panelSize = intent.panelSize;
  const flags: ConstraintCollapseFlags = { ...constraint.collapsedByConstraint };
  let lastWidth = constraint.lastConstraintCollapseWidth;

  const evalFit = () => {
    const clamped = clampPanelForLayout(
      panelSize,
      config.panelLocation,
      measure.workspaceWidth,
      measure.workspaceHeight,
      sidebarOpen,
      secondaryOpen,
    );
    const editorW = computeEditorWidth(
      measure.workspaceWidth,
      config.panelLocation,
      panelOpen,
      clamped,
      sidebarOpen,
      secondaryOpen,
    );
    const editorH = computeEditorHeight(
      measure.workspaceHeight,
      config.panelLocation,
      panelOpen,
      clamped,
    );
    return { fits: editorFits(editorW, editorH), clamped, editorW, editorH };
  };

  let state = evalFit();
  panelSize = state.clamped;

  if (!state.fits && secondaryOpen) {
    secondaryOpen = false;
    flags.secondary = true;
    lastWidth = measure.workspaceWidth;
    state = evalFit();
    panelSize = state.clamped;
  }

  if (!state.fits && sidebarOpen) {
    sidebarOpen = false;
    flags.sidebar = true;
    lastWidth = measure.workspaceWidth;
    state = evalFit();
    panelSize = state.clamped;
  }

  if (!state.fits && panelOpen) {
    panelOpen = false;
    flags.panel = true;
    lastWidth = measure.workspaceWidth;
    panelSize = 0;
    state = evalFit();
  }

  if (!state.fits) {
    panelSize = clampPanelForLayout(
      panelSize,
      config.panelLocation,
      measure.workspaceWidth,
      measure.workspaceHeight,
      sidebarOpen,
      secondaryOpen,
    );
  }

  return {
    sidebarOpen,
    secondaryOpen,
    panelOpen,
    panelSize,
    constraint: {
      collapsedByConstraint: flags,
      lastConstraintCollapseWidth: lastWidth,
    },
  };
}

function tryRestoreFromHysteresis(
  intent: LayoutUserIntent,
  measure: LayoutMeasure,
  constraint: LayoutConstraintState,
): { intent: LayoutUserIntent; constraint: LayoutConstraintState } {
  const width = measure.workspaceWidth;
  const threshold = constraint.lastConstraintCollapseWidth + COLLAPSE_HYSTERESIS;
  if (width < threshold) return { intent, constraint };

  const flags = { ...constraint.collapsedByConstraint };
  let secondaryOpen = intent.secondaryOpen;
  let sidebarOpen = intent.sidebarOpen;
  let panelOpen = intent.panelOpen;

  if (flags.secondary && !intent.zenMode) {
    secondaryOpen = true;
    flags.secondary = false;
  }
  if (flags.sidebar && !intent.zenMode) {
    sidebarOpen = true;
    flags.sidebar = false;
  }
  if (flags.panel) {
    panelOpen = true;
    flags.panel = false;
  }

  return {
    intent: { ...intent, sidebarOpen, secondaryOpen, panelOpen },
    constraint: { ...constraint, collapsedByConstraint: flags },
  };
}

export function computeMinWindowSize(
  config: LayoutConfig,
  allPanelsOpen = true,
): { width: number; height: number } {
  const rail = railWidthForDensity(config.uiDensity);
  const chrome = CHROME_HEIGHT[config.uiDensity];
  const sidebars = allPanelsOpen ? SIDEBAR_DEFAULT + SECONDARY_DEFAULT : 0;
  const panelAlongW =
    config.panelLocation !== "bottom" ? PANEL_USER_MIN_SIZE : 0;
  const panelAlongH =
    config.panelLocation === "bottom" ? PANEL_USER_MIN_SIZE : 0;

  const width = Math.max(
    WINDOW_MIN_WIDTH,
    rail + sidebars + EDITOR_MIN + panelAlongW,
  );
  const height = Math.max(
    WINDOW_MIN_HEIGHT,
    chrome + EDITOR_MIN + panelAlongH,
  );
  return { width, height };
}

function buildCssVars(snapshot: Omit<LayoutSnapshot, "cssVars">): Record<string, string> {
  return {
    "--sidebar-width": `${snapshot.sidebarWidth}px`,
    "--secondary-width": `${snapshot.secondaryWidth}px`,
    "--panel-size": `${snapshot.panelSize}px`,
    "--rail-width": `${snapshot.railWidth}px`,
    "--editor-min": `${EDITOR_MIN}px`,
  };
}

export function solveLayout(
  measure: LayoutMeasure,
  config: LayoutConfig,
  intent: LayoutUserIntent,
  constraint: LayoutConstraintState = emptyConstraint(),
): LayoutSolveResult {
  const restored = tryRestoreFromHysteresis(intent, measure, constraint);
  const resolved = applyCollapseOrder(restored.intent, config, measure, restored.constraint);

  const panelSize = resolved.panelOpen
    ? clampPanelForLayout(
        resolved.panelSize,
        config.panelLocation,
        measure.workspaceWidth,
        measure.workspaceHeight,
        resolved.sidebarOpen,
        resolved.secondaryOpen,
      )
    : 0;

  const editorWidth = computeEditorWidth(
    measure.workspaceWidth,
    config.panelLocation,
    resolved.panelOpen,
    panelSize,
    resolved.sidebarOpen,
    resolved.secondaryOpen,
  );
  const editorHeight = computeEditorHeight(
    measure.workspaceHeight,
    config.panelLocation,
    resolved.panelOpen,
    panelSize,
  );

  const mins = computeMinWindowSize(config, true);
  const railWidth = restored.intent.zenMode ? 0 : railWidthForDensity(config.uiDensity);

  const base: Omit<LayoutSnapshot, "cssVars"> = {
    sidebarOpen: resolved.sidebarOpen,
    secondaryOpen: resolved.secondaryOpen,
    panelOpen: resolved.panelOpen,
    panelSize,
    editorWidth: Math.max(0, editorWidth),
    editorHeight: Math.max(0, editorHeight),
    sidebarWidth: resolved.sidebarOpen ? SIDEBAR_DEFAULT : 0,
    secondaryWidth: resolved.secondaryOpen ? SECONDARY_DEFAULT : 0,
    railWidth,
    minWindowWidth: mins.width,
    minWindowHeight: mins.height,
    collapsedByConstraint: resolved.constraint.collapsedByConstraint,
  };

  return {
    snapshot: { ...base, cssVars: buildCssVars(base) },
    constraint: resolved.constraint,
  };
}

export function cssVarsToStyle(vars: Record<string, string>): string {
  return Object.entries(vars)
    .map(([key, value]) => `${key}:${value}`)
    .join(";");
}