/** Imperative bridge for static chrome scripts (menu bar, layout toolbar). */

export type GrokdenLayoutBridge = {
  toggleTerminal: () => void;
  openTerminal: () => void;
  closeTerminal: () => void;
  isTerminalOpen: () => boolean;
  toggleActivityBar: () => void;
  isActivityBarVisible: () => boolean;
  toggleSidebar: () => void;
  isSidebarOpen: () => boolean;
  toggleSecondary: () => void;
  isSecondaryOpen: () => boolean;
};

declare global {
  interface Window {
    __grokdenLayout?: GrokdenLayoutBridge;
  }
}

export function installLayoutBridge(bridge: GrokdenLayoutBridge): void {
  if (typeof window === "undefined") return;
  window.__grokdenLayout = bridge;
}

export function clearLayoutBridge(): void {
  if (typeof window === "undefined") return;
  delete window.__grokdenLayout;
}