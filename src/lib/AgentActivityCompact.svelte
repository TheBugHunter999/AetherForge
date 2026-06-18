<script lang="ts">
  import { getTerminalCompactActivity } from "$lib/agent-activity/activity-store";
  import { isSafeActivityLine } from "$lib/agent-activity/grok-tui-parser";

  type Props = { terminalId: number | null };
  let { terminalId }: Props = $props();

  const compact = $derived(
    terminalId != null ? getTerminalCompactActivity(terminalId) : undefined,
  );
  const displayTitle = $derived(
    compact?.currentTitle && isSafeActivityLine(compact.currentTitle)
      ? compact.currentTitle
      : null,
  );
</script>

{#if displayTitle}
  <span
    class="compact-activity"
    class:approval={compact?.status === "awaiting_approval"}
    title={displayTitle}
  >
    <span class="pip" class:live={compact?.status !== "done"}></span>
    <span class="label">{displayTitle}</span>
  </span>
{/if}

<style>
  .compact-activity {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    width: 100%;
    min-width: 0;
    font-size: 9px;
    color: var(--text-mute);
    overflow: hidden;
  }
  .compact-activity.approval { color: var(--warn); }
  .pip {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: var(--text-mute);
    flex-shrink: 0;
  }
  .pip.live {
    background: var(--text-dim);
    animation: pulse 1.4s ease-in-out infinite;
  }
  .label {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    min-width: 0;
    flex: 1 1 auto;
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.4; }
  }
</style>