<script lang="ts">
  import type { UpdateIndicatorState } from "$lib/updater/updater-store.svelte";

  let {
    state = "hidden",
    version = "",
    title = "Update available",
    disabled = false,
    onclick,
  }: {
    state?: UpdateIndicatorState;
    version?: string;
    title?: string;
    disabled?: boolean;
    onclick?: () => void;
  } = $props();

  const visible = $derived(state !== "hidden");
  const label = $derived(
    state === "active"
      ? `Updating${version ? ` to v${version}` : ""}…`
      : version
        ? `Update to v${version}`
        : title,
  );
</script>

{#if visible}
  <button
    type="button"
    class="update-indicator"
    class:available={state === "available"}
    class:active={state === "active"}
    aria-label={label}
    {title}
    {disabled}
    {onclick}
  >
    <svg class="update-indicator-icon" viewBox="0 0 16 16" aria-hidden="true">
      <path
        d="M8 2.5v7.5M8 10l-2.5-2.5M8 10l2.5-2.5"
        fill="none"
        stroke="currentColor"
        stroke-width="1.25"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M3.5 12.5h9"
        fill="none"
        stroke="currentColor"
        stroke-width="1.25"
        stroke-linecap="round"
      />
    </svg>
    {#if state === "available"}
      <span class="update-indicator-dot" aria-hidden="true"></span>
    {/if}
  </button>
{/if}

<style>
  .update-indicator {
    position: relative;
    flex: 0 0 32px;
    width: 32px;
    height: 32px;
    border: none;
    background: transparent;
    padding: 0;
    margin: 0 2px 0 0;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--accent);
    transition: background 0.12s, color 0.12s;
    -webkit-app-region: no-drag;
    app-region: no-drag;
  }

  .update-indicator-icon {
    width: 14px;
    height: 14px;
    display: block;
  }

  .update-indicator:hover:not(:disabled) {
    background: var(--hover);
    color: var(--accent);
  }

  .update-indicator.available .update-indicator-icon {
    animation: update-nudge 2.4s ease-in-out infinite;
  }

  .update-indicator.active {
    opacity: 0.85;
    cursor: wait;
  }

  .update-indicator:disabled {
    opacity: 0.45;
    cursor: default;
  }

  .update-indicator-dot {
    position: absolute;
    top: 7px;
    right: 7px;
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: var(--accent);
    box-shadow: 0 0 0 1px var(--panel-solid);
  }

  @keyframes update-nudge {
    0%,
    100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(1px);
    }
  }
</style>