<script lang="ts">
  import { fileMeta, isTextFile } from "$lib/editor-utils";
  import { workspaceSearchFuzzy } from "$lib/workspace/workspace-bridge";
  import type { WorkspaceSearchHit } from "$lib/workspace/types";

  type Props = {
    open: boolean;
    onClose: () => void;
    onOpenFile: (hit: { name: string; path: string }) => void;
  };

  let { open, onClose, onOpenFile }: Props = $props();

  let query = $state("");
  let hits = $state<WorkspaceSearchHit[]>([]);
  let selected = $state(0);
  let loading = $state(false);
  let error = $state<string | null>(null);
  let inputEl = $state<HTMLInputElement | undefined>();
  let debounceTimer: ReturnType<typeof setTimeout> | undefined;
  let searchGen = 0;

  async function runSearch(q: string) {
    const gen = ++searchGen;
    loading = true;
    error = null;
    try {
      const result = await workspaceSearchFuzzy(q, 80);
      if (gen !== searchGen) return;
      hits = result;
      selected = 0;
    } catch (err) {
      error = err instanceof Error ? err.message : String(err);
      hits = [];
    } finally {
      loading = false;
    }
  }

  function scheduleSearch(q: string) {
    if (debounceTimer) clearTimeout(debounceTimer);
    if (!q.trim()) {
      searchGen++;
      hits = [];
      selected = 0;
      error = null;
      loading = false;
      return;
    }
    debounceTimer = setTimeout(() => void runSearch(q), 120);
  }

  function pick(hit: WorkspaceSearchHit) {
    if (!isTextFile(hit.name)) return;
    onOpenFile({ name: hit.name, path: hit.path });
    onClose();
  }

  function onKeydown(event: KeyboardEvent) {
    if (!open) return;
    if (event.key === "Escape") {
      event.preventDefault();
      onClose();
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (hits.length) selected = (selected + 1) % hits.length;
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      if (hits.length) selected = (selected - 1 + hits.length) % hits.length;
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      const hit = hits[selected];
      if (hit) pick(hit);
    }
  }

  $effect(() => {
    if (open) {
      query = "";
      hits = [];
      selected = 0;
      error = null;
      requestAnimationFrame(() => inputEl?.focus());
    }
  });

  $effect(() => {
    if (!open) return;
    scheduleSearch(query);
    return () => {
      if (debounceTimer) clearTimeout(debounceTimer);
    };
  });
</script>

<svelte:window onkeydown={onKeydown} />

{#if open}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div class="quick-backdrop" role="presentation" onclick={(e) => e.target === e.currentTarget && onClose()}>
    <div class="quick-dialog" role="dialog" aria-modal="true" aria-label="Quick open">
      <input
        bind:this={inputEl}
        class="quick-input"
        placeholder="Search files by name (Ctrl+P)"
        value={query}
        oninput={(e) => (query = e.currentTarget.value)}
      />
      {#if loading}
        <div class="quick-status">Searching…</div>
      {:else if error}
        <div class="quick-status error">{error}</div>
      {:else if query.trim() && hits.length === 0}
        <div class="quick-status">No matching files</div>
      {/if}
      <ul class="quick-results">
        {#each hits as hit, i (hit.path)}
          <li>
            <button
              type="button"
              class="quick-hit"
              class:selected={i === selected}
              onclick={() => pick(hit)}
            >
              <span class="quick-badge" style="color: {fileMeta(hit.name).color}">{fileMeta(hit.name).label}</span>
              <span class="quick-name">{hit.name}</span>
              <span class="quick-path">{hit.path}</span>
            </button>
          </li>
        {/each}
      </ul>
    </div>
  </div>
{/if}

<style>
  .quick-backdrop {
    position: fixed;
    inset: 0;
    z-index: 12000;
    display: grid;
    place-items: start center;
    padding-top: 12vh;
    background: rgba(0, 0, 0, 0.45);
    backdrop-filter: blur(3px);
  }

  .quick-dialog {
    width: min(640px, calc(100vw - 32px));
    max-height: min(60vh, 480px);
    display: flex;
    flex-direction: column;
    border-radius: 8px;
    border: 1px solid var(--border);
    background: var(--panel-solid, var(--panel));
    box-shadow: 0 16px 48px rgba(0, 0, 0, 0.4);
    overflow: hidden;
  }

  .quick-input {
    width: 100%;
    box-sizing: border-box;
    padding: 12px 14px;
    font-size: 14px;
    font-family: inherit;
    color: var(--text);
    background: transparent;
    border: none;
    border-bottom: 1px solid var(--border);
    outline: none;
  }

  .quick-status {
    padding: 8px 14px;
    font-size: 11px;
    color: var(--text-mute);
    border-bottom: 1px solid var(--border);
  }
  .quick-status.error {
    color: var(--danger);
  }

  .quick-results {
    list-style: none;
    margin: 0;
    padding: 4px;
    overflow-y: auto;
    flex: 1;
  }

  .quick-hit {
    display: grid;
    grid-template-columns: auto 1fr;
    grid-template-rows: auto auto;
    gap: 0 8px;
    width: 100%;
    padding: 8px 10px;
    border: none;
    border-radius: 6px;
    background: transparent;
    color: var(--text);
    font-family: inherit;
    text-align: left;
    cursor: pointer;
  }
  .quick-hit:hover,
  .quick-hit.selected {
    background: var(--hover);
  }

  .quick-badge {
    grid-row: span 2;
    align-self: center;
    font-size: 9px;
    font-weight: 600;
    width: 20px;
    text-align: center;
  }

  .quick-name {
    font-size: 12px;
    font-weight: 500;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .quick-path {
    grid-column: 2;
    font-size: 10px;
    color: var(--text-mute);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
</style>