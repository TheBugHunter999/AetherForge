<script lang="ts">
  import type { AppSettings } from "$lib/editor-utils";
  import ExplorerRow from "$lib/explorer/ExplorerRow.svelte";
  import VirtualList from "$lib/explorer/VirtualList.svelte";
  import { gitStatusForPath } from "$lib/explorer/agent-overlay";
  import {
    getExplorerRows,
    getGitStatusMap,
    isFolderExpanded,
    isFolderLoading,
    toggleExplorerFolder,
    toggleNestParent,
    isNestParentExpanded,
    getWorkspaceRoot,
  } from "$lib/explorer/explorer-store.svelte";
  import type { ExplorerTreeNode } from "$lib/workspace/types";
  import type { ExplorerDisplayRow } from "$lib/settings-runtime";
  import { EXPLORER_ROW_HEIGHT } from "$lib/explorer/path-utils";

  type Props = {
    settings: AppSettings;
    folderPath: string | null;
    selectedFolderPath: string | null;
    activeTabPath: string | null;
    view: string;
    onOpenFile: (node: ExplorerTreeNode) => void;
    onSelectFolder: (path: string) => void;
  };

  let {
    settings,
    folderPath,
    selectedFolderPath,
    activeTabPath,
    view,
    onOpenFile,
    onSelectFolder,
  }: Props = $props();

  const rows = $derived(getExplorerRows(settings));
  const gitMap = $derived(getGitStatusMap());
  const root = $derived(getWorkspaceRoot());

  function handleToggleFolder(path: string) {
    onSelectFolder(path);
    void toggleExplorerFolder(path);
  }
</script>

<ul class="file-tree dark-scrollbar">
  {#if !folderPath || !root}
    <li class="tree-empty">No folder opened</li>
  {:else if rows.length === 0}
    <li class="tree-empty">Empty folder</li>
  {:else}
    <VirtualList
      items={rows}
      rowHeight={EXPLORER_ROW_HEIGHT}
      itemKey={(row: ExplorerDisplayRow<ExplorerTreeNode>) => row.node.path}
    >
      {#snippet children({ item: row, style })}
        <li class="tree-virtual-row" {style}>
          <ExplorerRow
            {row}
            {selectedFolderPath}
            {activeTabPath}
            {view}
            gitStatus={gitStatusForPath(gitMap, row.node.path)}
            nestExpanded={isNestParentExpanded(row.node.path)}
            loading={row.node.isDir && isFolderLoading(row.node.path)}
            expanded={row.node.isDir && isFolderExpanded(row.node.path)}
            onToggleFolder={handleToggleFolder}
            {onOpenFile}
            onToggleNest={toggleNestParent}
          />
        </li>
      {/snippet}
    </VirtualList>
  {/if}
</ul>

<style>
  .file-tree {
    list-style: none;
    margin: 0;
    padding: 0;
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .tree-empty {
    padding: var(--grok-space-2, 4px) 20px;
    font-size: var(--grok-font-size-base, 13px);
    color: var(--grok-text-muted, var(--text-mute));
    font-style: italic;
  }

  .tree-virtual-row {
    display: block;
    height: 30px;
    margin: 0;
    padding: 0;
    overflow: hidden;
  }
</style>