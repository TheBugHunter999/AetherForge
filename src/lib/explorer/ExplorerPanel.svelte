<script lang="ts">
  import type { AppSettings } from "$lib/editor-utils";
  import ExplorerTree from "$lib/explorer/ExplorerTree.svelte";
  import {
    collapseAllExplorer,
    getExplorerError,
    workspaceDisplayName,
  } from "$lib/explorer/explorer-store.svelte";
  import type { ExplorerTreeNode } from "$lib/workspace/types";

  type Props = {
    settings: AppSettings;
    folderPath: string | null;
    folderRestricted: boolean;
    selectedFolderPath: string | null;
    activeTabPath: string | null;
    view: string;
    onOpenFolder: () => void;
    onOpenFile: (node: ExplorerTreeNode) => void;
    onNewFile: () => void;
    onNewFolder: () => void;
    onRefresh: () => void;
    onSelectFolder: (path: string) => void;
  };

  let {
    settings,
    folderPath,
    folderRestricted,
    selectedFolderPath,
    activeTabPath,
    view,
    onOpenFolder,
    onOpenFile,
    onNewFile,
    onNewFolder,
    onRefresh,
    onSelectFolder,
  }: Props = $props();

  const explorerError = $derived(getExplorerError());
  const projectName = $derived(workspaceDisplayName() || folderPath?.split(/[/\\]+/).pop() || "");
</script>

<div class="explorer-panel">
  <div class="sidebar-header">
    <span>Explorer</span>
    <button type="button" class="open-folder-btn" onclick={onOpenFolder} title="Open folder">…</button>
  </div>

  {#if explorerError}
    <div class="explorer-error" title={explorerError}>{explorerError}</div>
  {/if}

  {#if folderPath}
    <div class="workspace-section">
      <span class="section-label" title={folderPath}>{projectName}</span>
      <div class="section-actions">
        <button type="button" class="icon-btn" disabled={folderRestricted} onclick={onNewFile} title="New file">+</button>
        <button type="button" class="icon-btn" disabled={folderRestricted} onclick={onNewFolder} title="New folder">⊕</button>
        <button type="button" class="icon-btn" onclick={onRefresh} title="Refresh">↻</button>
        <button type="button" class="icon-btn" onclick={collapseAllExplorer} title="Collapse all">⊟</button>
      </div>
    </div>
  {/if}

  <ExplorerTree
    {settings}
    {folderPath}
    {selectedFolderPath}
    {activeTabPath}
    {view}
    {onOpenFile}
    {onSelectFolder}
  />
</div>

<style>
  .explorer-panel {
    display: flex;
    flex-direction: column;
    min-height: 0;
    flex: 1;
  }

  .sidebar-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 12px 4px;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--text-mute);
    flex-shrink: 0;
  }

  .open-folder-btn {
    padding: 0 2px;
    font-size: 14px;
    line-height: 1;
    font-family: inherit;
    color: var(--text-mute);
    background: none;
    border: none;
    cursor: pointer;
    transition: color 0.12s;
  }
  .open-folder-btn:hover {
    color: var(--text);
  }

  .explorer-error {
    margin: 0 8px 4px;
    padding: 4px 8px;
    font-size: 11px;
    color: var(--danger);
    background: var(--danger-soft);
    border: 1px solid var(--border);
    border-radius: 3px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    flex-shrink: 0;
  }

  .workspace-section {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 6px;
    padding: 2px 8px 4px 20px;
    flex-shrink: 0;
  }

  .section-label {
    flex: 1;
    min-width: 0;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.02em;
    text-transform: uppercase;
    color: var(--text-dim);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .section-actions {
    display: flex;
    align-items: center;
    gap: 2px;
    flex-shrink: 0;
    opacity: 0;
    transition: opacity 0.12s;
  }

  .workspace-section:hover .section-actions,
  .section-actions:focus-within {
    opacity: 1;
  }

  .icon-btn {
    width: 20px;
    height: 20px;
    padding: 0;
    font-size: 12px;
    line-height: 1;
    font-family: inherit;
    color: var(--text-mute);
    background: none;
    border: none;
    border-radius: 3px;
    cursor: pointer;
  }

  .icon-btn:hover:not(:disabled) {
    color: var(--text);
    background: var(--hover);
  }

  .icon-btn:disabled {
    opacity: 0.35;
    cursor: default;
  }
</style>