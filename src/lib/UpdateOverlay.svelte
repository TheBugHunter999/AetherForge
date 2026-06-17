<script lang="ts">
  import type { UpdaterPhase } from "$lib/updater/updater-store.svelte";

  let {
    phase,
    version,
    currentVersion = "",
    notes = [],
    progress = null,
    error = "",
    dismissible = true,
    ondownload,
    onrestart,
    onretry,
    ondismiss,
  }: {
    phase: UpdaterPhase;
    version: string;
    currentVersion?: string;
    notes?: string[];
    progress?: number | null;
    error?: string;
    dismissible?: boolean;
    ondownload?: () => void;
    onrestart?: () => void;
    onretry?: () => void;
    ondismiss?: () => void;
  } = $props();

  const title = $derived(
    phase === "downloading"
      ? "Updating"
      : phase === "installing"
        ? "Installing update"
        : phase === "ready"
          ? "Update ready"
          : phase === "error"
            ? "Update failed"
            : "Update available",
  );

  const showProgress = $derived(
    phase === "downloading" || phase === "installing" || phase === "ready",
  );
</script>

<div
  class="update-overlay"
  role="dialog"
  aria-modal="true"
  aria-labelledby="update-overlay-title"
>
  <div class="update-glow" aria-hidden="true"></div>

  <div class="update-logo-wrap">
    <img src="/favicon.png" alt="" width="96" height="96" />
  </div>

  <h1 id="update-overlay-title" class="update-title">{title}</h1>

  <p class="update-version">
    {#if currentVersion && version}
      v{currentVersion} → <span class="update-version-new">v{version}</span>
    {:else if version}
      Version {version}
    {/if}
  </p>

  {#if notes.length > 0}
    <div class="update-notes">
      <p class="update-notes-label">What&apos;s new</p>
      <ul class="update-notes-list">
        {#each notes as note}
          <li>{note}</li>
        {/each}
      </ul>
    </div>
  {/if}

  {#if showProgress}
    <div
      class="update-progress"
      role="progressbar"
      aria-valuenow={progress ?? 0}
      aria-valuemin="0"
      aria-valuemax="100"
    >
      <div class="update-progress-track">
        <div
          class="update-progress-fill"
          class:indeterminate={progress == null}
          style:width={progress != null ? `${progress}%` : undefined}
        ></div>
      </div>
      {#if progress != null}
        <span class="update-progress-label">{Math.round(progress)}%</span>
      {:else}
        <span class="update-progress-label">Preparing…</span>
      {/if}
    </div>
  {/if}

  {#if phase === "error" && error}
    <p class="update-error">{error}</p>
  {/if}

  <div class="update-actions">
    {#if phase === "available"}
      <button type="button" class="update-btn primary" onclick={ondownload}>
        Download update
      </button>
      {#if dismissible}
        <button type="button" class="update-btn secondary" onclick={ondismiss}>
          Not now
        </button>
      {/if}
    {:else if phase === "ready"}
      <button type="button" class="update-btn primary" onclick={onrestart}>
        Restart Grokden
      </button>
    {:else if phase === "error"}
      <button type="button" class="update-btn primary" onclick={onretry}>
        Try again
      </button>
      {#if dismissible}
        <button type="button" class="update-btn secondary" onclick={ondismiss}>
          Dismiss
        </button>
      {/if}
    {/if}
  </div>
</div>

<style>
  .update-overlay {
    position: fixed;
    inset: 0;
    z-index: 25000;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 18px;
    padding: 32px 24px;
    background: var(--bg, #0a0a0c);
    pointer-events: auto;
  }

  .update-glow {
    position: absolute;
    width: 260px;
    height: 260px;
    border-radius: 50%;
    background: radial-gradient(
      circle,
      color-mix(in srgb, var(--accent) 18%, transparent) 0%,
      transparent 70%
    );
    filter: blur(8px);
    animation: update-glow-pulse 2.4s ease-in-out infinite;
  }

  .update-logo-wrap {
    position: relative;
    width: 96px;
    height: 96px;
    border-radius: 22px;
    overflow: hidden;
    box-shadow:
      0 0 0 1px rgba(255, 255, 255, 0.1),
      0 20px 60px rgba(0, 0, 0, 0.5);
  }

  .update-logo-wrap img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .update-title {
    margin: 0;
    font-size: 20px;
    font-weight: 500;
    letter-spacing: 0.01em;
    color: var(--text);
  }

  .update-version {
    margin: 0;
    font-size: 13px;
    color: var(--text-mute);
  }

  .update-version-new {
    color: var(--accent);
  }

  .update-notes {
    width: min(420px, 100%);
    max-height: 200px;
    overflow: auto;
    padding: 14px 16px;
    border-radius: 8px;
    border: 1px solid var(--border);
    background: var(--panel-solid);
    text-align: left;
  }

  .update-notes-label {
    margin: 0 0 8px;
    font-size: 10px;
    font-weight: 500;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--text-mute);
  }

  .update-notes-list {
    margin: 0;
    padding: 0 0 0 18px;
    font-size: 12px;
    line-height: 1.55;
    color: var(--text-dim);
  }

  .update-progress {
    width: min(320px, 100%);
    display: flex;
    flex-direction: column;
    gap: 6px;
    align-items: stretch;
  }

  .update-progress-track {
    height: 3px;
    border-radius: 2px;
    background: var(--border);
    overflow: hidden;
  }

  .update-progress-fill {
    height: 100%;
    background: var(--accent);
    border-radius: 2px;
    transition: width 0.2s ease;
  }

  .update-progress-fill.indeterminate {
    width: 35% !important;
    animation: update-progress-slide 1.2s ease-in-out infinite;
  }

  .update-progress-label {
    font-size: 11px;
    color: var(--text-mute);
    text-align: center;
  }

  .update-error {
    margin: 0;
    max-width: 360px;
    font-size: 12px;
    color: var(--danger);
    text-align: center;
  }

  .update-actions {
    display: flex;
    gap: 8px;
    margin-top: 4px;
  }

  .update-btn {
    padding: 8px 16px;
    font-size: 12px;
    font-weight: 500;
    font-family: inherit;
    border-radius: 6px;
    border: 1px solid var(--border);
    background: var(--chip-bg);
    color: var(--text);
    cursor: pointer;
    transition: background 0.12s, border-color 0.12s;
  }

  .update-btn:hover {
    background: var(--hover);
  }

  .update-btn.primary {
    background: var(--accent);
    border-color: var(--accent);
    color: #fff;
  }

  .update-btn.primary:hover {
    filter: brightness(1.06);
  }

  .update-btn.secondary {
    background: transparent;
  }

  @keyframes update-glow-pulse {
    0%,
    100% {
      opacity: 0.7;
      transform: scale(1);
    }
    50% {
      opacity: 1;
      transform: scale(1.06);
    }
  }

  @keyframes update-progress-slide {
    0% {
      transform: translateX(-120%);
    }
    100% {
      transform: translateX(320%);
    }
  }
</style>