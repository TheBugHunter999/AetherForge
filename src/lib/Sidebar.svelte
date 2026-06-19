<script lang="ts">
  import { onMount } from "svelte";
  import ActivityRail, { type ActivityRailItem } from "$lib/ActivityRail.svelte";
  import { APP_DISPLAY_NAME } from "$lib/branding";

  export type SidebarSelectItem = ActivityRailItem | "skills";

  const SIDEBAR_COLLAPSED_KEY = "Grokden.sidebar.collapsed";

  let {
    activeItem = null,
    zenHidden = false,
    scmDisabled = false,
    agentBadgeCount = 0,
    onSelect,
    onOpenTerminal,
    onOpenFolder,
  }: {
    activeItem?: SidebarSelectItem | null;
    zenHidden?: boolean;
    scmDisabled?: boolean;
    agentBadgeCount?: number;
    onSelect: (item: SidebarSelectItem) => void;
    onOpenTerminal: () => void;
    onOpenFolder: () => void;
  } = $props();

  let collapsed = $state(false);
  let projectsOpen = $state(true);
  let historyOpen = $state(true);

  const userInitials = $derived(
    APP_DISPLAY_NAME.split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase() || "U",
  );

  function toggleCollapsed() {
    collapsed = !collapsed;
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(SIDEBAR_COLLAPSED_KEY, collapsed ? "1" : "0");
    }
  }

  function handleRailSelect(item: ActivityRailItem) {
    onSelect(item);
  }

  onMount(() => {
    if (typeof localStorage === "undefined") return;
    collapsed = localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === "1";
  });
</script>

{#if collapsed}
  <div class="sidebar sidebar--collapsed" class:zen-hidden={zenHidden}>
    <div class="sidebar__brand">
      <span class="sidebar__glyph" aria-hidden="true">{userInitials[0]}</span>
      <button
        type="button"
        class="sidebar__collapse"
        aria-label="Expand sidebar"
        title="Expand sidebar"
        onclick={toggleCollapsed}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
          <path d="M9 6l6 6-6 6" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </button>
    </div>
    <ActivityRail
      activeItem={activeItem === "skills" ? null : activeItem}
      {zenHidden}
      {scmDisabled}
      {agentBadgeCount}
      onSelect={handleRailSelect}
    />
  </div>
{:else}
  <nav class="sidebar" class:zen-hidden={zenHidden} aria-label="Main navigation">
    <div class="sidebar__brand">
      <span class="sidebar__glyph" aria-hidden="true">{userInitials[0]}</span>
      <span class="sidebar__wordmark">{APP_DISPLAY_NAME}</span>
      <button
        type="button"
        class="sidebar__collapse"
        aria-label="Collapse sidebar"
        title="Collapse sidebar"
        onclick={toggleCollapsed}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
          <path d="M15 6l-6 6 6 6" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </button>
    </div>

    <div class="sidebar__scroll">
      <button
        type="button"
        class="sidebar__item"
        class:active={activeItem === "search"}
        onclick={() => onSelect("search")}
      >
        <svg class="sidebar__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
          <circle cx="11" cy="11" r="7" />
          <line x1="16.5" y1="16.5" x2="21" y2="21" stroke-linecap="round" />
        </svg>
        <span class="sidebar__label">Search</span>
      </button>

      <div class="sidebar__eyebrow">Primary</div>

      <button type="button" class="sidebar__item" onclick={onOpenTerminal}>
        <svg class="sidebar__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <polyline points="7 9 10 12 7 15" stroke-linecap="round" stroke-linejoin="round" />
          <line x1="13" y1="15" x2="17" y2="15" stroke-linecap="round" />
        </svg>
        <span class="sidebar__label">Terminal</span>
      </button>

      <button
        type="button"
        class="sidebar__item"
        class:active={activeItem === "agents"}
        onclick={() => onSelect("agents")}
      >
        <svg class="sidebar__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
          <rect x="4" y="4" width="7" height="7" rx="1.5" />
          <rect x="13" y="4" width="7" height="7" rx="1.5" />
          <rect x="4" y="13" width="7" height="7" rx="1.5" />
          <rect x="13" y="13" width="7" height="7" rx="1.5" />
        </svg>
        <span class="sidebar__label">Parallel Agents</span>
        {#if agentBadgeCount > 0}
          <span class="sidebar__agent-badge">{agentBadgeCount}</span>
        {/if}
      </button>

      <button
        type="button"
        class="sidebar__item"
        class:active={activeItem === "canvas"}
        onclick={() => onSelect("canvas")}
      >
        <svg class="sidebar__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
          <circle cx="6" cy="6" r="2.5" />
          <circle cx="18" cy="7" r="2.5" />
          <circle cx="12" cy="18" r="2.5" />
          <line x1="8" y1="7" x2="15.5" y2="8" />
          <line x1="10" y1="15" x2="14" y2="10" />
        </svg>
        <span class="sidebar__label">Canvas</span>
      </button>

      <button
        type="button"
        class="sidebar__item"
        class:active={activeItem === "skills"}
        onclick={() => onSelect("skills")}
      >
        <svg class="sidebar__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
          <rect x="4" y="4" width="8" height="8" rx="1.5" />
          <rect x="12" y="12" width="8" height="8" rx="1.5" />
          <path d="M12 8h2.5a2.5 2.5 0 0 1 0 5H12" stroke-linecap="round" />
        </svg>
        <span class="sidebar__label">Skills &amp; Connectors</span>
        <span class="badge-soon">Soon</span>
      </button>

      <div class="sidebar__eyebrow">Workspace</div>

      <button
        type="button"
        class="sidebar__item"
        class:active={activeItem === "explorer"}
        onclick={() => onSelect("explorer")}
      >
        <svg class="sidebar__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
          <path d="M3 7h6l2 2h10v10H3V7z" stroke-linejoin="round" />
        </svg>
        <span class="sidebar__label">Explorer</span>
      </button>

      <button
        type="button"
        class="sidebar__item"
        class:active={activeItem === "scm"}
        disabled={scmDisabled}
        onclick={() => onSelect("scm")}
      >
        <svg class="sidebar__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
          <circle cx="6" cy="6" r="2" />
          <circle cx="18" cy="6" r="2" />
          <circle cx="12" cy="18" r="2" />
          <path d="M6 8v4l6 4M18 8v4l-6 4" stroke-linecap="round" />
        </svg>
        <span class="sidebar__label">Source Control</span>
      </button>

      <div class="sidebar__section">
        <button
          type="button"
          class="sidebar__section-head"
          aria-expanded={projectsOpen}
          onclick={() => (projectsOpen = !projectsOpen)}
        >
          <span>Projects</span>
          <span class="sidebar__chev" aria-hidden="true">▾</span>
        </button>
        {#if projectsOpen}
          <button type="button" class="sidebar__item" onclick={onOpenFolder}>
            <svg class="sidebar__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
              <line x1="12" y1="6" x2="12" y2="18" stroke-linecap="round" />
              <line x1="6" y1="12" x2="18" y2="12" stroke-linecap="round" />
            </svg>
            <span class="sidebar__label">+ New Project</span>
          </button>
        {/if}
      </div>

      <div class="sidebar__section">
        <button
          type="button"
          class="sidebar__section-head"
          aria-expanded={historyOpen}
          onclick={() => (historyOpen = !historyOpen)}
        >
          <span>History</span>
          <span class="sidebar__chev" aria-hidden="true">▾</span>
        </button>
        {#if historyOpen}
          <p class="sidebar__history-empty">No history yet</p>
        {/if}
      </div>
    </div>

    <div class="sidebar__footer">
      <button
        type="button"
        class="sidebar__item"
        class:active={activeItem === "settings"}
        onclick={() => onSelect("settings")}
      >
        <svg class="sidebar__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
          <circle cx="12" cy="12" r="3" />
          <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4l1.4-1.4M17 7l1.4-1.4" stroke-linecap="round" />
        </svg>
        <span class="sidebar__label">Settings</span>
      </button>

      <div class="sidebar__user">
        <span class="sidebar__avatar" aria-hidden="true">{userInitials}</span>
        <div class="sidebar__user-meta">
          <span class="sidebar__user-name">{APP_DISPLAY_NAME}</span>
          <span class="sidebar__user-email">workspace@grokden.local</span>
        </div>
      </div>
    </div>
  </nav>
{/if}

<style>
  .sidebar.zen-hidden {
    display: none;
  }

  .sidebar--collapsed :global(.activity-rail) {
    width: 100%;
    border-right: none;
    background: transparent;
  }

  .sidebar__agent-badge {
    font-size: 9px;
    font-weight: 600;
    min-width: 16px;
    height: 16px;
    padding: 0 4px;
    border-radius: var(--radius-pill);
    background: var(--accent);
    color: var(--on-accent);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
</style>