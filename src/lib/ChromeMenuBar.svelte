<script lang="ts">
  import MenuBar from "./MenuBar.svelte";
  import LayoutControls from "./LayoutControls.svelte";

  let {
    modLabel,
    activityBarExpanded,
    explorerOpen,
    terminalOpen,
    secondaryOpen,
    settingsActive = false,
    quickOpenActive = false,
    onToggleActivityBar,
    onToggleExplorer,
    onTogglePanel,
    onToggleSecondary,
    onQuickOpen,
    onOpenSettings,
    onOpenFolder,
    onSave,
    onCopy,
    onPaste,
    onSelectAll,
    onLaunchGrok,
    onOpenAgents,
    onOpenExplorer,
    onOpenSearch,
    onOpenScm,
    onOpenTerminal,
    onOpenDebug,
    onCheckUpdates,
  }: {
    modLabel: string;
    activityBarExpanded: boolean;
    explorerOpen: boolean;
    terminalOpen: boolean;
    secondaryOpen: boolean;
    settingsActive?: boolean;
    quickOpenActive?: boolean;
    onToggleActivityBar: () => void;
    onToggleExplorer: () => void;
    onTogglePanel: () => void;
    onToggleSecondary: () => void;
    onQuickOpen: () => void;
    onOpenSettings: () => void;
    onOpenFolder: () => void;
    onSave: () => void;
    onCopy: () => void;
    onPaste: () => void;
    onSelectAll: () => void;
    onLaunchGrok: () => void;
    onOpenAgents: () => void;
    onOpenExplorer: () => void;
    onOpenSearch: () => void;
    onOpenScm: () => void;
    onOpenTerminal: () => void;
    onOpenDebug: () => void;
    onCheckUpdates: () => void;
  } = $props();
</script>

<div class="chrome-menu-strip">
  <MenuBar
    {modLabel}
    {onToggleActivityBar}
    {onToggleExplorer}
    {onTogglePanel}
    {onToggleSecondary}
    {onQuickOpen}
    {onOpenSettings}
    {onOpenFolder}
    {onSave}
    {onCopy}
    {onPaste}
    {onSelectAll}
    {onLaunchGrok}
    {onOpenAgents}
    {onOpenExplorer}
    {onOpenSearch}
    {onOpenScm}
    {onOpenTerminal}
    {onOpenDebug}
    {onCheckUpdates}
  />
  <LayoutControls
    {modLabel}
    {activityBarExpanded}
    {explorerOpen}
    {terminalOpen}
    {secondaryOpen}
    {settingsActive}
    {quickOpenActive}
    {onToggleActivityBar}
    {onToggleExplorer}
    {onTogglePanel}
    {onToggleSecondary}
    {onQuickOpen}
    {onOpenSettings}
  />
</div>

<style>
  .chrome-menu-strip {
    display: flex;
    align-items: center;
    height: var(--grok-chrome-h, 32px);
    flex: 0 0 auto;
    -webkit-app-region: no-drag;
    app-region: no-drag;
  }
</style>