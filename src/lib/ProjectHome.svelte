<script lang="ts">
  import { fileMeta } from "$lib/editor-utils";
  import { leftTruncate } from "$lib/explorer/path-utils";

  export type RecentFile = {
    path: string;
    name: string;
  };

  type Props = {
    folderName: string;
    folderPath: string;
    recentFiles: RecentFile[];
    agentCount: number;
    gitBranch?: string | null;
    gitDirty?: boolean;
    onOpenFile: (file: RecentFile) => void;
    onOpenTerminal: () => void;
    onStartAgent: () => void;
    onOpenCanvas: () => void;
    onQuickOpen: () => void;
  };

  let {
    folderName,
    folderPath,
    recentFiles = [],
    agentCount,
    gitBranch = null,
    gitDirty = false,
    onOpenFile,
    onOpenTerminal,
    onStartAgent,
    onOpenCanvas,
    onQuickOpen,
  }: Props = $props();

  const displayPath = $derived(leftTruncate(folderPath, 72));
  const hasGit = $derived(Boolean(gitBranch?.trim()));
  const agentSummary = $derived(
    agentCount > 0
      ? `${agentCount} agent${agentCount === 1 ? "" : "s"} running`
      : "No agents running",
  );

  const quickActions = [
    { id: "terminal", label: "Open terminal", handler: onOpenTerminal },
    { id: "agent", label: "Start agent", handler: onStartAgent },
    { id: "canvas", label: "Open canvas", handler: onOpenCanvas },
  ] as const;
</script>

<div class="grok-project-home">
  <div class="grok-project-home__shell">
    <header class="grok-project-home__header">
      <div class="grok-project-home__header-icon" aria-hidden="true">
        <svg viewBox="0 0 16 16">
          <path
            d="M2 5h4l1.1 1.2H14v6.3H2V5z"
            fill="none"
            stroke="currentColor"
            stroke-width="1.2"
            stroke-linejoin="round"
          />
        </svg>
      </div>
      <div class="grok-project-home__header-meta">
        <h1 class="grok-project-home__title">{folderName}</h1>
        <p class="grok-project-home__path" title={folderPath}>{displayPath}</p>
      </div>
    </header>

    <div class="grok-project-home__grid">
      {#if hasGit}
        <section class="grok-project-home__card card grok-project-home__card--git" aria-labelledby="grok-project-home-git-heading">
          <h2 id="grok-project-home-git-heading" class="grok-project-home__card-title">Source control</h2>
          <div class="grok-project-home__git-summary">
            <span class="grok-project-home__git-branch" title={gitBranch ?? undefined}>
              <svg viewBox="0 0 16 16" aria-hidden="true">
                <path
                  d="M5.5 3.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm5 5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM6.2 5.8c1.1.8 2.5 1.2 3.8 1.2"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.2"
                  stroke-linecap="round"
                />
                <path
                  d="M6.2 10.2c1.1-.8 2.5-1.2 3.8-1.2"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.2"
                  stroke-linecap="round"
                />
              </svg>
              {gitBranch}
            </span>
            <span
              class="grok-project-home__git-status"
              class:grok-project-home__git-status--dirty={gitDirty}
            >
              {gitDirty ? "Uncommitted changes" : "Working tree clean"}
            </span>
          </div>
        </section>
      {/if}

      <section
        class="grok-project-home__card card grok-project-home__card--recent"
        aria-labelledby="grok-project-home-recent-heading"
      >
        <div class="grok-project-home__card-head">
          <h2 id="grok-project-home-recent-heading" class="grok-project-home__card-title">Recent files</h2>
          {#if recentFiles.length > 0}
            <button type="button" class="grok-project-home__card-action" onclick={onQuickOpen}>
              Quick open
            </button>
          {/if}
        </div>

        {#if recentFiles.length > 0}
          <ul class="grok-project-home__file-list">
            {#each recentFiles as file (file.path)}
              <li>
                <button
                  type="button"
                  class="grok-project-home__file-row"
                  onclick={() => onOpenFile(file)}
                >
                  <span
                    class="grok-project-home__file-badge"
                    style="color: {fileMeta(file.name).color}"
                  >
                    {fileMeta(file.name).label}
                  </span>
                  <span class="grok-project-home__file-meta">
                    <span class="grok-project-home__file-name">{file.name}</span>
                    <span class="grok-project-home__file-path" title={file.path}>
                      {leftTruncate(file.path, 56)}
                    </span>
                  </span>
                </button>
              </li>
            {/each}
          </ul>
        {:else}
          <div class="grok-project-home__empty">
            <p class="grok-project-home__empty-copy">No recent files yet</p>
            <button type="button" class="grok-project-home__empty-btn" onclick={onQuickOpen}>
              Open a file
            </button>
          </div>
        {/if}
      </section>

      <section
        class="grok-project-home__card card grok-project-home__card--agents"
        aria-labelledby="grok-project-home-agents-heading"
      >
        <h2 id="grok-project-home-agents-heading" class="grok-project-home__card-title">Agents</h2>
        <div class="grok-project-home__agents-summary">
          <span
            class="grok-project-home__agents-count"
            class:grok-project-home__agents-count--active={agentCount > 0}
          >
            {agentCount}
          </span>
          <div class="grok-project-home__agents-meta">
            <span class="grok-project-home__agents-label">{agentSummary}</span>
            <span class="grok-project-home__agents-caption">
              {agentCount > 0
                ? "Parallel agents are active in this workspace."
                : "Launch an agent to start autonomous work."}
            </span>
          </div>
        </div>
        {#if agentCount === 0}
          <button type="button" class="grok-project-home__inline-btn" onclick={onStartAgent}>
            Start agent
          </button>
        {/if}
      </section>

      <section
        class="grok-project-home__card card grok-project-home__card--actions"
        aria-labelledby="grok-project-home-actions-heading"
      >
        <h2 id="grok-project-home-actions-heading" class="grok-project-home__card-title">Quick actions</h2>
        <div class="grok-project-home__action-grid" role="group" aria-label="Quick actions">
          {#each quickActions as action (action.id)}
            <button type="button" class="grok-project-home__action-btn" onclick={action.handler}>
              {#if action.id === "terminal"}
                <svg viewBox="0 0 16 16" aria-hidden="true">
                  <path
                    d="M3.5 5.5 6 8l-2.5 2.5M8 10.5h4.5"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.25"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              {:else if action.id === "agent"}
                <svg viewBox="0 0 16 16" aria-hidden="true">
                  <circle cx="8" cy="5.5" r="2.25" fill="none" stroke="currentColor" stroke-width="1.2" />
                  <path
                    d="M4.5 13.5c.6-2.4 2-3.5 3.5-3.5s2.9 1.1 3.5 3.5"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.2"
                    stroke-linecap="round"
                  />
                </svg>
              {:else}
                <svg viewBox="0 0 16 16" aria-hidden="true">
                  <rect x="2.5" y="2.5" width="11" height="11" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.2" />
                  <path d="M5.5 8h5M8 5.5v5" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" />
                </svg>
              {/if}
              <span>{action.label}</span>
            </button>
          {/each}
        </div>
      </section>
    </div>
  </div>
</div>