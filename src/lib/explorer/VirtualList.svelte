<script lang="ts" generics="T">
  import type { Snippet } from "svelte";

  type Props = {
    items: T[];
    rowHeight?: number;
    itemKey: (item: T, index: number) => string | number;
    children: Snippet<[{ item: T; index: number; style: string }]>;
  };

  let { items, rowHeight = 22, itemKey, children }: Props = $props();

  let viewportEl = $state<HTMLDivElement | undefined>();
  let scrollTop = $state(0);
  let viewportHeight = $state(320);

  const totalHeight = $derived(items.length * rowHeight);
  const startIndex = $derived(Math.max(0, Math.floor(scrollTop / rowHeight) - 2));
  const visibleCount = $derived(Math.ceil(viewportHeight / rowHeight) + 6);
  const endIndex = $derived(Math.min(items.length, startIndex + visibleCount));
  const offsetY = $derived(startIndex * rowHeight);
  const visibleItems = $derived(items.slice(startIndex, endIndex));

  function onScroll() {
    if (!viewportEl) return;
    scrollTop = viewportEl.scrollTop;
  }

  $effect(() => {
    if (!viewportEl) return;
    viewportHeight = viewportEl.clientHeight;
    const ro = new ResizeObserver(() => {
      if (viewportEl) viewportHeight = viewportEl.clientHeight;
    });
    ro.observe(viewportEl);
    return () => ro.disconnect();
  });
</script>

<div class="virtual-viewport dark-scrollbar" bind:this={viewportEl} onscroll={onScroll}>
  <div class="virtual-spacer" style="height: {totalHeight}px">
    <div class="virtual-window" style="transform: translateY({offsetY}px)">
      {#each visibleItems as item, i (itemKey(item, startIndex + i))}
        {@const index = startIndex + i}
        {@render children({ item, index, style: `height:${rowHeight}px` })}
      {/each}
    </div>
  </div>
</div>

<style>
  .virtual-viewport {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    overflow-x: hidden;
  }

  .virtual-spacer {
    position: relative;
    width: 100%;
  }

  .virtual-window {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    will-change: transform;
  }
</style>