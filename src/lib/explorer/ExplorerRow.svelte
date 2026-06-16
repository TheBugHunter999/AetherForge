<script lang="ts">
  import { isTextFile } from "$lib/editor-utils";
  import type { ExplorerTreeNode } from "$lib/workspace/types";
  import type { ExplorerDisplayRow } from "$lib/settings-runtime";

  type Props = {
    row: ExplorerDisplayRow<ExplorerTreeNode>;
    selectedFolderPath: string | null;
    activeTabPath: string | null;
    view: string;
    gitStatus: string | null;
    nestExpanded: boolean;
    loading: boolean;
    expanded: boolean;
    onToggleFolder: (path: string) => void;
    onOpenFile: (node: ExplorerTreeNode) => void;
    onToggleNest: (path: string) => void;
  };

  let {
    row,
    selectedFolderPath,
    activeTabPath,
    view,
    gitStatus,
    nestExpanded,
    loading,
    expanded,
    onToggleFolder,
    onOpenFile,
    onToggleNest,
  }: Props = $props();

  const node = $derived(row.node);
  const indent = $derived(8 + node.depth * 8 + row.depthOffset * 8);
  const isActiveFile = $derived(view === "editor" && activeTabPath === node.path);
  const showGit = $derived(!node.isDir && gitStatus);
</script>

{#if node.isDir}
  <button
    type="button"
    class="tree-row folder"
    class:loading
    class:selected={selectedFolderPath === node.path}
    style="padding-left: {indent}px"
    onclick={() => onToggleFolder(node.path)}
  >
    <span class="twistie" class:open={expanded && !loading} class:loading aria-hidden="true"></span>
    <span class="icon folder-icon" aria-hidden="true">
      <svg viewBox="0 0 16 16" width="16" height="16">
        <path
          d="M1.5 3.5h5l1.2 1.2H14.5v8h-13v-9.2z"
          fill="none"
          stroke="currentColor"
          stroke-width="1"
          stroke-linejoin="round"
        />
      </svg>
    </span>
    <span class="label">{node.name}</span>
  </button>
{:else}
  <div
    class="tree-file-row"
    class:active={isActiveFile}
    class:nest-child={row.isNestChild}
    style="padding-left: {indent}px"
  >
    {#if row.hasNestedChildren}
      <button
        type="button"
        class="twistie nest-twistie"
        class:open={nestExpanded}
        aria-label="Toggle nested files"
        onclick={() => onToggleNest(node.path)}
      ></button>
    {:else}
      <span class="twistie-spacer" aria-hidden="true"></span>
    {/if}
    <button
      type="button"
      class="tree-row file"
      class:muted={!isTextFile(node.name)}
      onclick={() => onOpenFile(node)}
    >
      <span class="icon file-icon" aria-hidden="true">
        <svg viewBox="0 0 16 16" width="16" height="16">
          <path
            d="M4 1.5h5.5L13 5v9.5H4V1.5z"
            fill="none"
            stroke="currentColor"
            stroke-width="1"
            stroke-linejoin="round"
          />
          <path d="M9.5 1.5V5H13" fill="none" stroke="currentColor" stroke-width="1" />
        </svg>
      </span>
      <span class="label">{node.name}</span>
      {#if showGit}
        <span class="git-status" data-status={gitStatus} title="Git status">{gitStatus}</span>
      {/if}
    </button>
  </div>
{/if}

<style>
  .tree-row {
    display: flex;
    align-items: center;
    gap: 4px;
    width: 100%;
    height: 22px;
    min-height: 22px;
    padding: 0 8px 0 4px;
    margin: 0;
    font-size: 13px;
    font-weight: 400;
    font-family: inherit;
    color: var(--text-dim);
    background: none;
    border: none;
    border-radius: 0;
    text-align: left;
    cursor: pointer;
    box-sizing: border-box;
    user-select: none;
  }

  .tree-row.folder {
    color: var(--text);
  }

  .tree-row:hover,
  .tree-row.folder.selected {
    background: var(--hover);
  }

  .tree-row.file.muted {
    opacity: 0.72;
  }

  .tree-row.folder.loading {
    color: var(--text-mute);
  }

  .tree-file-row {
    display: flex;
    align-items: center;
    gap: 0;
    width: 100%;
    height: 22px;
    min-width: 0;
    box-sizing: border-box;
  }

  .tree-file-row.active {
    background: var(--hover);
    box-shadow: inset 2px 0 0 var(--accent);
  }

  .tree-file-row.active .tree-row.file {
    color: var(--text);
    background: transparent;
  }

  .tree-file-row.active .file-icon {
    color: var(--text);
  }

  .tree-row.file {
    flex: 1;
    min-width: 0;
    padding-right: 0;
  }

  .twistie,
  .twistie-spacer,
  .nest-twistie {
    width: 16px;
    height: 16px;
    flex-shrink: 0;
  }

  .twistie {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    position: relative;
  }

  .twistie::before {
    content: "";
    width: 0;
    height: 0;
    border-top: 3px solid transparent;
    border-bottom: 3px solid transparent;
    border-left: 4px solid var(--text-mute);
    transition: transform 0.1s ease;
  }

  .twistie.open::before {
    transform: rotate(90deg);
  }

  .twistie.loading::before {
    width: 6px;
    height: 6px;
    border: none;
    border-radius: 50%;
    background: var(--text-mute);
    opacity: 0.45;
    animation: pulse-dot 1s ease-in-out infinite;
  }

  .nest-twistie {
    border: none;
    background: none;
    cursor: pointer;
    padding: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  .nest-twistie::before {
    content: "";
    width: 0;
    height: 0;
    border-top: 3px solid transparent;
    border-bottom: 3px solid transparent;
    border-left: 4px solid var(--text-mute);
    transition: transform 0.1s ease;
  }

  .nest-twistie.open::before {
    transform: rotate(90deg);
  }

  .icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    flex-shrink: 0;
    color: var(--text-mute);
  }

  .folder-icon {
    color: color-mix(in srgb, var(--accent) 55%, var(--text-mute));
  }

  .file-icon {
    color: var(--text-dim);
  }

  .label {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    line-height: 22px;
  }

  .git-status {
    flex-shrink: 0;
    margin-left: auto;
    padding: 0 8px 0 4px;
    font-size: 11px;
    font-weight: 400;
    line-height: 22px;
    opacity: 0.9;
  }

  .git-status[data-status="U"],
  .git-status[data-status="?"] {
    color: var(--success);
  }

  .git-status[data-status="A"],
  .git-status[data-status="M"] {
    color: var(--warn);
  }

  .git-status[data-status="D"],
  .git-status[data-status="!"] {
    color: var(--danger);
  }

  .git-status[data-status="R"] {
    color: var(--accent);
  }

  @keyframes pulse-dot {
    0%,
    100% {
      opacity: 0.35;
    }
    50% {
      opacity: 0.8;
    }
  }
</style>