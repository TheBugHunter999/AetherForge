import type { PanelLocation } from "$lib/editor-utils";

export type UiDensity = "comfortable" | "compact" | "spacious";

export type LayoutUserIntent = {
  sidebarOpen: boolean;
  secondaryOpen: boolean;
  panelOpen: boolean;
  panelSize: number;
  zenMode: boolean;
};

export type LayoutMeasure = {
  workspaceWidth: number;
  workspaceHeight: number;
  outerWidth: number;
  outerHeight: number;
};

export type LayoutConfig = {
  panelLocation: PanelLocation;
  uiDensity: UiDensity;
};

export type ConstraintCollapseFlags = {
  secondary: boolean;
  sidebar: boolean;
  panel: boolean;
};

export type LayoutConstraintState = {
  collapsedByConstraint: ConstraintCollapseFlags;
  lastConstraintCollapseWidth: number;
};

export type LayoutSnapshot = {
  sidebarOpen: boolean;
  secondaryOpen: boolean;
  panelOpen: boolean;
  panelSize: number;
  editorWidth: number;
  editorHeight: number;
  sidebarWidth: number;
  secondaryWidth: number;
  railWidth: number;
  minWindowWidth: number;
  minWindowHeight: number;
  collapsedByConstraint: ConstraintCollapseFlags;
  cssVars: Record<string, string>;
};

export type LayoutSolveResult = {
  snapshot: LayoutSnapshot;
  constraint: LayoutConstraintState;
};

export type PanelClampOptions = {
  minSize?: number;
  minMain?: number;
  maxSize?: number;
  maxRatio?: number;
  reservedAlongAxis?: number;
};