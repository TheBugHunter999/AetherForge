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
</script>

<svelte:window onclick={closeMenus} onkeydown={(event) => event.key === "Escape" && closeMenus()} />

<nav class="menu-bar" aria-label="Application menu" onclick={(event) => event.stopPropagation()}>
  {#each menus as menu (menu.label)}
    <div class="menu" class:open={openMenu === menu.label}>
      <button type="button" class="menu-trigger" onclick={() => toggleMenu(menu.label)}>
        {menu.label}
      </button>
      {#if openMenu === menu.label}
        <div class="menu-list" role="menu">
          {#each menu.items as item (item.label)}
            <button type="button" class="menu-item" role="menuitem" onclick={() => runMenuItem(item)}>
              <span>{item.label}</span>
              {#if item.shortcut}
                <kbd>{item.shortcut}</kbd>
              {/if}
            </button>
          {/each}
        </div>
      {/if}
    </div>
  {/each}
</nav>

<style>
  .menu-bar {
    flex: 0 0 auto;
    display: flex;
    align-items: center;
    gap: 1px;
    height: var(--grok-chrome-h, 32px);
    margin: 0 8px;
    user-select: none;
    -webkit-app-region: no-drag;
    app-region: no-drag;
    position: relative;
    z-index: 50010;
  }

  .menu {
    position: relative;
    height: var(--grok-chrome-h, 32px);
    display: flex;
    align-items: center;
  }

  .menu-trigger {
    height: 24px;
    padding: 0 8px;
    border: 1px solid transparent;
    border-radius: 6px;
    background: transparent;
    color: var(--text, var(--grok-text, #f4f4f7));
    font: inherit;
    font-size: 12px;
    line-height: 1;
    cursor: default;
    transition:
      background 120ms cubic-bezier(0.22, 1, 0.36, 1),
      border-color 120ms cubic-bezier(0.22, 1, 0.36, 1),
      color 120ms cubic-bezier(0.22, 1, 0.36, 1);
  }

  .menu-trigger:hover,
  .menu.open .menu-trigger {
    background: var(--hover, rgba(255, 255, 255, 0.075));
    border-color: var(--border-muted, rgba(255, 255, 255, 0.1));
    color: var(--text, #fff);
  }

  .menu-list {
    position: absolute;
    top: calc(100% - 1px);
    left: 0;
    min-width: 218px;
    padding: 6px;
    border: 1px solid var(--border, rgba(255, 255, 255, 0.14));
    border-radius: 11px;
    background: var(--surface-overlay, #151720);
    color: var(--text-dim, #d4d4df);
    box-shadow: var(--grok-shadow-overlay, 0 18px 48px rgba(0, 0, 0, 0.46));
    z-index: 50020;
  }

  :global(.ide.glass-window) .menu-list {
    background: color-mix(in srgb, var(--surface-overlay, #151720) 92%, transparent);
    backdrop-filter: blur(28px) saturate(1.4);
    -webkit-backdrop-filter: blur(28px) saturate(1.4);
    border-color: var(--glass-border, var(--border));
    box-shadow:
      0 18px 48px rgba(0, 0, 0, 0.48),
      inset 0 1px 0 var(--glass-highlight, rgba(255, 255, 255, 0.08));
  }

  .menu-item {
    width: 100%;
    min-height: 28px;
    padding: 0 9px;
    border: 0;
    border-radius: 7px;
    background: transparent;
    color: inherit;
    font: inherit;
    font-size: 12px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 24px;
    cursor: default;
    white-space: nowrap;
    transition:
      background 120ms cubic-bezier(0.22, 1, 0.36, 1),
      color 120ms cubic-bezier(0.22, 1, 0.36, 1);
  }

  .menu-item:hover {
    color: var(--text, #fff);
    background: color-mix(in srgb, var(--accent, #8b5cf6) 22%, var(--hover, rgba(255, 255, 255, 0.07)));
  }

  .menu-item kbd {
    color: var(--text-mute, #8f8b91);
    font: inherit;
    font-size: 11px;
  }

  @media (max-width: 720px) {
    .menu:nth-child(n + 5) {
      display: none;
    }
  }
</style>
