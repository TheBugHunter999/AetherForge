<script lang="ts">
  import { middleTruncate } from "$lib/explorer/path-utils";
  import type { WorkspaceInfo } from "$lib/workspace/types";

  type Props = {
    projectName: string;
    workspaceInfo: WorkspaceInfo | null;
    indexing: boolean;
    agentCount: number;
  };

  let { projectName, workspaceInfo, indexing, agentCount }: Props = $props();

  const displayProjectName = $derived(middleTruncate(projectName || "No folder", 40));
  const displayBranch = $derived(
    workspaceInfo?.branch ? middleTruncate(workspaceInfo.branch, 24) : null,
  );
</script>

<div class="explorer-header">
  <div class="explorer-header-main">
    <span class="project-name" title={projectName}>{displayProjectName}</span>
    {#if displayBranch}
      <span class="branch-chip" title={workspaceInfo?.branch}>{displayBranch}</span>
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
    gap: var(--grok-space-2, 4px);
    padding: 0 var(--grok-space-5, 12px) var(--grok-space-4, 8px);
    flex-shrink: 0;
  }

  .explorer-header-main {
    display: flex;
    align-items: center;
    gap: var(--grok-space-3, 6px);
    min-width: 0;
  }

  .project-name {
    font-size: var(--grok-font-size-xs, 11px);
    font-weight: var(--grok-font-weight-medium, 500);
    letter-spacing: 0.05em;
    text-transform: uppercase;
    color: var(--grok-text-secondary, var(--text-dim));
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    flex: 1;
    min-width: 0;
  }

  .branch-chip {
    flex-shrink: 0;
    font-size: 9px;
    padding: 1px var(--grok-space-3, 6px);
    border-radius: var(--grok-radius-lg, 8px);
    color: var(--grok-purple, var(--accent));
    background: var(--grok-purple-soft, var(--accent-soft));
    border: 1px solid color-mix(in srgb, var(--grok-purple, var(--accent)) 28%, transparent);
  }

  .explorer-header-meta {
    display: flex;
    flex-wrap: wrap;
    gap: var(--grok-space-2, 4px);
  }

  .meta-chip {
    font-size: 9px;
    color: var(--grok-text-muted, var(--text-mute));
    padding: 1px 5px;
    border-radius: var(--grok-radius-lg, 8px);
    background: var(--grok-chip-bg, var(--chip-bg));
    border: 1px solid var(--grok-border, var(--border));
  }

  .meta-chip.accent {
    color: var(--grok-purple, var(--accent));
  }

  .meta-chip.indexing {
    color: var(--grok-text-secondary, var(--text-dim));
    animation: pulse-meta 1.2s ease-in-out infinite;
  }

  .meta-chip.warn {
    color: var(--grok-warn, var(--warn));
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