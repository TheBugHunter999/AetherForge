<script lang="ts">
  type MenuItem = {
    label: string;
    action: () => void;
    shortcut?: string;
  };

  type MenuGroup = {
    label: string;
    items: MenuItem[];
  };

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

  let openMenu = $state<string | null>(null);

  const menus = $derived.by((): MenuGroup[] => [
    {
      label: "File",
      items: [
        { label: "Open Folder…", action: onOpenFolder },
        { label: "Save", action: onSave, shortcut: `${modLabel}+S` },
        { label: "Quick Open…", action: onQuickOpen, shortcut: `${modLabel}+P` },
        { label: "Settings", action: onOpenSettings },
      ],
    },
    {
      label: "Edit",
      items: [
        { label: "Copy", action: onCopy, shortcut: `${modLabel}+C` },
        { label: "Paste", action: onPaste, shortcut: `${modLabel}+V` },
        { label: "Select All", action: onSelectAll, shortcut: `${modLabel}+A` },
      ],
    },
    {
      label: "Selection",
      items: [{ label: "Select All", action: onSelectAll, shortcut: `${modLabel}+A` }],
    },
    {
      label: "View",
      items: [
        { label: "Toggle Activity Bar", action: onToggleActivityBar },
        { label: "Toggle Explorer Side Bar", action: onToggleExplorer, shortcut: `${modLabel}+B` },
        { label: "Toggle Panel", action: onTogglePanel, shortcut: `${modLabel}+\`` },
        { label: "Toggle Secondary Side Bar", action: onToggleSecondary },
        { label: "Search", action: onOpenSearch },
        { label: "Source Control", action: onOpenScm },
      ],
    },
    {
      label: "Go",
      items: [
        { label: "Quick Open…", action: onQuickOpen, shortcut: `${modLabel}+P` },
        { label: "Explorer", action: onOpenExplorer },
        { label: "Search", action: onOpenSearch },
      ],
    },
    {
      label: "Run",
      items: [
        { label: "Launch Grok CLI", action: onLaunchGrok },
        { label: "Parallel Agents", action: onOpenAgents },
        { label: "Debug Panel", action: onOpenDebug },
      ],
    },
    {
      label: "Terminal",
      items: [
        { label: "Toggle Terminal", action: onTogglePanel, shortcut: `${modLabel}+\`` },
        { label: "Open Workspace Terminal", action: onOpenTerminal },
        { label: "Launch Grok CLI", action: onLaunchGrok },
      ],
    },
    {
      label: "Help",
      items: [
        { label: "Settings", action: onOpenSettings },
        { label: "Check for Updates", action: onCheckUpdates },
      ],
    },
  ]);

  function closeMenus() {
    openMenu = null;
  }

  function toggleMenu(label: string) {
    openMenu = openMenu === label ? null : label;
  }

  function runMenuItem(item: MenuItem) {
    closeMenus();
    item.action();
  }

  function layoutIcon(type: "activity" | "sidebar" | "panel" | "secondary" | "quick" | "settings") {
    if (type === "activity") {
      return "M2.5 3h13v12H2.5zm4 0v12M4.5 6h.01M4.5 9h.01M4.5 12h.01";
    }
    if (type === "sidebar") {
      return "M2.5 3h13v12H2.5V3zm4.5 0v12";
    }
    if (type === "panel") {
      return "M2.5 3h13v12H2.5V3zm0 7.5h13";
    }
    if (type === "secondary") {
      return "M2.5 3h13v12H2.5V3zm8.5 0v12";
    }
    if (type === "quick") {
      return "M8 3.5a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9zm3.5 7L15 13.5";
    }
    return "M9 2.5v2M9 13.5v2M2.5 9h2M13.5 9h2M4.4 4.4l1.4 1.4M12.2 12.2l1.4 1.4M4.4 13.6l1.4-1.4M12.2 5.8l1.4-1.4M9 6.6a2.4 2.4 0 1 0 0 4.8 2.4 2.4 0 0 0 0-4.8z";
  }
</script>

<svelte:window onclick={closeMenus} onkeydown={(e) => e.key === "Escape" && closeMenus()} />

<nav class="grokden-menu-bar" aria-label="Application menu">
  {#each menus as menu (menu.label)}
    <div class="grokden-menu" class:grokden-menu-open={openMenu === menu.label}>
      <button
        type="button"
        class="grokden-menu-trigger"
        onclick={(e) => {
          e.stopPropagation();
          toggleMenu(menu.label);
        }}
      >
        {menu.label}
      </button>
      <div class="grokden-menu-list" role="menu">
        {#each menu.items as item (item.label)}
          <button
            type="button"
            class="grokden-menu-item"
            role="menuitem"
            onclick={(e) => {
              e.stopPropagation();
              runMenuItem(item);
            }}
          >
            <span>{item.label}</span>
            {#if item.shortcut}
              <kbd>{item.shortcut}</kbd>
            {/if}
          </button>
        {/each}
      </div>
    </div>
  {/each}
</nav>

<div class="grokden-layout-controls" role="toolbar" aria-label="Layout controls">
  <button
    type="button"
    class="grokden-layout-btn grokden-layout-btn-activity"
    class:active={activityBarExpanded}
    aria-label="Toggle Activity Bar"
    title="Toggle Activity Bar"
    onclick={onToggleActivityBar}
  >
    <svg viewBox="0 0 18 18" aria-hidden="true"><path d={layoutIcon("activity")} fill="none" stroke="currentColor" stroke-width="1.45" stroke-linejoin="round" /></svg>
  </button>
  <button
    type="button"
    class="grokden-layout-btn grokden-layout-btn-sidebar"
    class:active={explorerOpen}
    aria-label="Toggle Explorer Side Bar"
    title="Toggle Explorer Side Bar ({modLabel}+B)"
    onclick={onToggleExplorer}
  >
    <svg viewBox="0 0 18 18" aria-hidden="true"><path d={layoutIcon("sidebar")} fill="none" stroke="currentColor" stroke-width="1.45" stroke-linejoin="round" /></svg>
  </button>
  <button
    type="button"
    class="grokden-layout-btn grokden-layout-btn-panel"
    class:active={terminalOpen}
    aria-label="Toggle Panel"
    title={"Toggle Panel (" + modLabel + "+`)"}
    onclick={onTogglePanel}
  >
    <svg viewBox="0 0 18 18" aria-hidden="true"><path d={layoutIcon("panel")} fill="none" stroke="currentColor" stroke-width="1.45" stroke-linejoin="round" /></svg>
  </button>
  <button
    type="button"
    class="grokden-layout-btn grokden-layout-btn-secondary"
    class:active={secondaryOpen}
    aria-label="Toggle Secondary Side Bar"
    title="Toggle Secondary Side Bar"
    onclick={onToggleSecondary}
  >
    <svg viewBox="0 0 18 18" aria-hidden="true"><path d={layoutIcon("secondary")} fill="none" stroke="currentColor" stroke-width="1.45" stroke-linejoin="round" /></svg>
  </button>
  <button
    type="button"
    class="grokden-layout-btn grokden-layout-btn-quick"
    class:active={quickOpenActive}
    aria-label="Quick Open"
    title="Quick Open ({modLabel}+P)"
    onclick={onQuickOpen}
  >
    <svg viewBox="0 0 18 18" aria-hidden="true"><path d={layoutIcon("quick")} fill="none" stroke="currentColor" stroke-width="1.45" stroke-linecap="round" /></svg>
  </button>
  <button
    type="button"
    class="grokden-layout-btn grokden-layout-btn-settings"
    class:active={settingsActive}
    aria-label="Settings"
    title="Settings"
    onclick={onOpenSettings}
  >
    <svg viewBox="0 0 18 18" aria-hidden="true"><path d={layoutIcon("settings")} fill="none" stroke="currentColor" stroke-width="1.45" stroke-linecap="round" /></svg>
  </button>
</div>