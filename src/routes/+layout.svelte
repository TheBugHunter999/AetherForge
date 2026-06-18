<script lang="ts">
  import { onMount } from "svelte";

  function syncParallelAgentUi() {
    const liveCount = document.querySelectorAll(
      ".swarm .agent-cell.active, .swarm .agent-cell.launching",
    ).length;

    const nav = document.querySelector<HTMLElement>(
      ".codex-nav-item[aria-label='Parallel Agents']",
    );
    const badge = nav?.querySelector<HTMLElement>(".rail-badge.inline");
    if (badge) {
      badge.hidden = liveCount === 0;
      if (liveCount > 0) badge.textContent = String(liveCount);
    }

    const rows = Array.from(
      document.querySelectorAll<HTMLElement>(".codex-session-section .codex-list-row"),
    );
    const row = rows.find((item) => item.textContent?.toLowerCase().includes("parallel agents"));
    const meta = row?.querySelector<HTMLElement>(".codex-list-time");
    if (meta) meta.textContent = liveCount > 0 ? `${liveCount} live` : "ready";
  }

  onMount(() => {
    syncParallelAgentUi();
    const observer = new MutationObserver(syncParallelAgentUi);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["class", "hidden"],
    });
    const interval = window.setInterval(syncParallelAgentUi, 1000);
    return () => {
      observer.disconnect();
      window.clearInterval(interval);
    };
  });
</script>

<slot />

<style>
  :global(.rail-badge[hidden]) {
    display: none !important;
  }

  :global(.ide.glass-window .activity-rail),
  :global(.ide.glass-window .sidebar),
  :global(.ide.glass-window .secondary-sidebar) {
    contain: layout paint style;
    transform: translateZ(0);
    backface-visibility: hidden;
  }

  :global(.ide.glass-window .editor-area),
  :global(.ide.glass-window .editor-content),
  :global(.ide.glass-window .view-pane),
  :global(.ide.glass-window .editor-placeholder),
  :global(.ide.glass-window .welcome-center) {
    position: relative;
    isolation: isolate;
  }

  :global(.ide.glass-window .rail-btn:hover),
  :global(.ide.glass-window .codex-list-row:hover:not(:disabled)),
  :global(.ide.glass-window .codex-project-row:hover) {
    background: color-mix(in srgb, var(--hover) 78%, transparent);
    box-shadow: inset 0 0 0 1px transparent;
  }
</style>
