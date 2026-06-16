<script lang="ts">
  import type { WorkspaceInfo } from "$lib/workspace/types";

  type Props = {
    projectName: string;
    workspaceInfo: WorkspaceInfo | null;
    indexing: boolean;
    agentCount: number;
  };

  let { projectName, workspaceInfo, indexing, agentCount }: Props = $props();
</script>

<div class="explorer-header">
  <div class="explorer-header-main">
    <span class="project-name" title={projectName}>{projectName || "No folder"}</span>
    {#if workspaceInfo?.branch}
      <span class="branch-chip" title="Git branch">{workspaceInfo.branch}</span>
    {/if}
  </div>
  <div class="explorer-header-meta">
    {#if workspaceInfo && workspaceInfo.changedCount > 0}
      <span class="meta-chip" title="Changed files">{workspaceInfo.changedCount} changed</span>
    {/if}
    {#if agentCount > 0}
      <span class="meta-chip accent" title="Active agents">{agentCount} agent{agentCount === 1 ? "" : "s"}</span>
    {/if}
    {#if indexing}
      <span class="meta-chip indexing" title="Indexing workspace">Indexing…</span>
    {/if}
    {#if workspaceInfo?.error}
      <span class="meta-chip warn" title={workspaceInfo.error}>Index error</span>
    {/if}
  </div>
</div>

<style>
  .explorer-header {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 0 12px 8px;
    flex-shrink: 0;
  }

  .explorer-header-main {
    display: flex;
    align-items: center;
    gap: 6px;
    min-width: 0;
  }

  .project-name {
    font-size: 11px;
    font-weight: 500;
    color: var(--text);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    flex: 1;
    min-width: 0;
  }

  .branch-chip {
    flex-shrink: 0;
    font-size: 9px;
    padding: 1px 6px;
    border-radius: 4px;
    color: var(--accent);
    background: var(--accent-soft);
    border: 1px solid var(--accent-mid);
  }

  .explorer-header-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
  }

  .meta-chip {
    font-size: 9px;
    color: var(--text-mute);
    padding: 1px 5px;
    border-radius: 3px;
    background: var(--chip-bg);
    border: 1px solid var(--border);
  }
  .meta-chip.accent {
    color: var(--accent);
  }
  .meta-chip.indexing {
    color: var(--text-dim);
    animation: pulse-meta 1.2s ease-in-out infinite;
  }
  .meta-chip.warn {
    color: var(--warn);
  }
  @keyframes pulse-meta {
    0%,
    100% {
      opacity: 0.55;
    }
    50% {
      opacity: 1;
    }
  }
</style>