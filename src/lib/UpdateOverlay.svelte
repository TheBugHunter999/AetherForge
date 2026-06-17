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
    style = "",
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
    style?: string;
    ondownload?: () => void;
    onrestart?: () => void;
    onretry?: () => void;
    ondismiss?: () => void;
  } = $props();

  const title = $derived(
    phase === "downloading"
      ? "Updating Grokden"
      : phase === "installing"
        ? "Installing update"
        : phase === "ready"
          ? "You're all set"
          : phase === "error"
            ? "Update interrupted"
            : "New version ready",
  );

  const subtitle = $derived(
    phase === "downloading"
      ? "Pulling the latest build from GitHub. This usually takes under a minute."
      : phase === "installing"
        ? "Applying the update package — Grokden will restart when finished."
        : phase === "ready"
          ? "Restart once to open the new version with your workspace intact."
          : phase === "error"
            ? "The download or install didn't complete. Check your connection and try again."
            : "A fresh Grokden release is waiting — review what's new, then install.",
  );

  const showProgress = $derived(
    phase === "downloading" || phase === "installing" || phase === "ready",
  );

  const showNotes = $derived(phase === "available" && notes.length > 0);
  const busy = $derived(phase === "downloading" || phase === "installing");
</script>

<div
  class="update-overlay"
  style={style}
  role="dialog"
  aria-modal="true"
  aria-labelledby="update-overlay-title"
>
  <div class="update-mesh" aria-hidden="true"></div>

  <div class="update-stage">
    <div class="update-hero">
      <div class="update-glow" aria-hidden="true"></div>
      <div class="update-logo-wrap" class:busy>
        <img src="/favicon.png" alt="" width="120" height="120" />
        {#if busy}
          <div class="update-logo-ring" aria-hidden="true"></div>
        {/if}
      </div>
    </div>

    <div class="update-copy">
      <p class="update-eyebrow">Grokden update</p>
      <h1 id="update-overlay-title" class="update-title">{title}</h1>
      <p class="update-subtitle">{subtitle}</p>

      {#if currentVersion && version}
        <div class="update-version-pill">
          <span class="ver-old">v{currentVersion}</span>
          <span class="ver-arrow" aria-hidden="true">→</span>
          <span class="ver-new">v{version}</span>
        </div>
      {:else if version}
        <div class="update-version-pill solo">
          <span class="ver-new">v{version}</span>
        </div>
      {/if}
    </div>

    {#if showNotes}
      <div class="update-card">
        <div class="update-card-head">
          <span class="update-card-icon" aria-hidden="true">✦</span>
          <span>What's in this release</span>
        </div>
        <ul class="update-notes-list">
          {#each notes as note}
            <li><span class="note-dot" aria-hidden="true"></span>{note}</li>
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
        aria-label="Update progress"
      >
        <div class="update-progress-track">
          <div
            class="update-progress-fill"
            class:indeterminate={progress == null}
            style:width={progress != null ? `${progress}%` : undefined}
          ></div>
        </div>
        <div class="update-progress-meta">
          {#if progress != null}
            <span>{Math.round(progress)}% complete</span>
          {:else}
            <span>Preparing download…</span>
          {/if}
          {#if phase === "installing"}
            <span class="progress-phase">Installing</span>
          {:else if phase === "downloading"}
            <span class="progress-phase">Downloading</span>
          {/if}
        </div>
      </div>
    {/if}

    {#if phase === "error" && error}
      <p class="update-error">{error}</p>
    {/if}

    <div class="update-actions">
      {#if phase === "available"}
        <button type="button" class="update-btn primary" onclick={ondownload}>
          Download &amp; install
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
</div>

<style>
  .update-overlay {
    position: fixed;
    inset: 0;
    z-index: 25000;
    display: grid;
    place-items: center;
    padding: 28px 20px;
    background: #0a0a0c;
    color: var(--text, #e4e4ec);
    pointer-events: auto;
    overflow: auto;
    box-sizing: border-box;
  }

  .update-mesh {
    position: fixed;
    inset: 0;
    pointer-events: none;
    background:
      radial-gradient(ellipse 70% 50% at 50% 38%, color-mix(in srgb, var(--accent, #4a9eff) 16%, transparent) 0%, transparent 62%),
      radial-gradient(ellipse 45% 35% at 72% 68%, color-mix(in srgb, var(--accent2, #8b7cf8) 10%, transparent) 0%, transparent 55%),
      radial-gradient(ellipse 40% 30% at 22% 72%, color-mix(in srgb, var(--accent, #4a9eff) 8%, transparent) 0%, transparent 50%);
  }

  .update-stage {
    position: relative;
    width: min(440px, 100%);
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 20px;
    animation: stage-in 0.45s cubic-bezier(0.22, 1, 0.36, 1) both;
  }

  .update-hero {
    position: relative;
    width: 120px;
    height: 120px;
    display: grid;
    place-items: center;
    flex-shrink: 0;
  }

  .update-glow {
    position: absolute;
    left: 50%;
    top: 50%;
    width: 300px;
    height: 300px;
    margin-left: -150px;
    margin-top: -150px;
    border-radius: 50%;
    background: radial-gradient(
      circle,
      rgba(74, 158, 255, 0.22) 0%,
      rgba(139, 124, 248, 0.1) 42%,
      transparent 72%
    );
    filter: blur(10px);
    animation: glow-pulse 2.6s ease-in-out infinite;
    pointer-events: none;
  }

  .update-logo-wrap {
    position: relative;
    width: 120px;
    height: 120px;
    border-radius: 28px;
    overflow: hidden;
    box-shadow:
      0 0 0 1px rgba(255, 255, 255, 0.12),
      0 24px 64px rgba(0, 0, 0, 0.55);
    animation: logo-in 0.65s cubic-bezier(0.22, 1, 0.36, 1) 0.08s both;
  }

  .update-logo-wrap img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .update-logo-ring {
    position: absolute;
    inset: -6px;
    border-radius: 32px;
    border: 2px solid color-mix(in srgb, var(--accent, #4a9eff) 55%, transparent);
    border-top-color: transparent;
    animation: ring-spin 1.1s linear infinite;
  }

  .update-copy {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    max-width: 100%;
  }

  .update-eyebrow {
    margin: 0;
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--accent, #4a9eff);
    opacity: 0.9;
  }

  .update-title {
    margin: 0;
    font-size: 26px;
    font-weight: 500;
    letter-spacing: -0.02em;
    line-height: 1.2;
    color: var(--text, #f2f2f8);
  }

  .update-subtitle {
    margin: 0;
    max-width: 36ch;
    font-size: 14px;
    line-height: 1.55;
    color: var(--text-dim, rgba(255, 255, 255, 0.62));
  }

  .update-version-pill {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    margin-top: 4px;
    padding: 6px 14px;
    border-radius: 999px;
    border: 1px solid var(--border, rgba(255, 255, 255, 0.1));
    background: color-mix(in srgb, var(--panel-solid, #14141c) 88%, transparent);
    font-size: 13px;
    font-weight: 500;
    font-variant-numeric: tabular-nums;
  }

  .ver-old {
    color: var(--text-mute, rgba(255, 255, 255, 0.45));
  }

  .ver-arrow {
    color: var(--text-mute, rgba(255, 255, 255, 0.35));
    font-size: 12px;
  }

  .ver-new {
    color: var(--accent, #4a9eff);
  }

  .update-card {
    width: 100%;
    text-align: left;
    padding: 16px 18px;
    border-radius: 12px;
    border: 1px solid var(--border, rgba(255, 255, 255, 0.1));
    background: color-mix(in srgb, var(--panel-solid, #14141c) 92%, transparent);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.28);
  }

  .update-card-head {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 12px;
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.04em;
    color: var(--text, #e4e4ec);
  }

  .update-card-icon {
    color: var(--accent, #4a9eff);
    font-size: 11px;
  }

  .update-notes-list {
    margin: 0;
    padding: 0;
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .update-notes-list li {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    font-size: 13px;
    line-height: 1.5;
    color: var(--text-dim, rgba(255, 255, 255, 0.72));
  }

  .note-dot {
    flex-shrink: 0;
    width: 6px;
    height: 6px;
    margin-top: 7px;
    border-radius: 50%;
    background: var(--accent, #4a9eff);
    box-shadow: 0 0 8px color-mix(in srgb, var(--accent, #4a9eff) 50%, transparent);
  }

  .update-progress {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .update-progress-track {
    height: 4px;
    border-radius: 999px;
    background: color-mix(in srgb, var(--border, #2a2a36) 80%, transparent);
    overflow: hidden;
  }

  .update-progress-fill {
    height: 100%;
    border-radius: 999px;
    background: linear-gradient(
      90deg,
      var(--accent, #4a9eff),
      color-mix(in srgb, var(--accent2, #8b7cf8) 70%, var(--accent, #4a9eff))
    );
    transition: width 0.25s ease;
  }

  .update-progress-fill.indeterminate {
    width: 38% !important;
    animation: progress-slide 1.15s ease-in-out infinite;
  }

  .update-progress-meta {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    font-size: 11px;
    color: var(--text-mute, rgba(255, 255, 255, 0.48));
  }

  .progress-phase {
    color: var(--accent, #4a9eff);
    font-weight: 500;
  }

  .update-error {
    margin: 0;
    width: 100%;
    padding: 10px 12px;
    border-radius: 8px;
    font-size: 12px;
    line-height: 1.45;
    color: var(--danger, #f87171);
    background: color-mix(in srgb, var(--danger, #f87171) 12%, transparent);
    border: 1px solid color-mix(in srgb, var(--danger, #f87171) 28%, transparent);
    text-align: left;
  }

  .update-actions {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 10px;
    width: 100%;
    margin-top: 4px;
  }

  .update-btn {
    min-width: 140px;
    padding: 10px 18px;
    font-size: 13px;
    font-weight: 500;
    font-family: inherit;
    border-radius: 8px;
    border: 1px solid var(--border, rgba(255, 255, 255, 0.12));
    background: var(--chip-bg, rgba(255, 255, 255, 0.06));
    color: var(--text, #e4e4ec);
    cursor: pointer;
    transition: background 0.14s, border-color 0.14s, transform 0.14s, filter 0.14s;
  }

  .update-btn:hover {
    background: var(--hover, rgba(255, 255, 255, 0.08));
  }

  .update-btn.primary {
    background: linear-gradient(
      180deg,
      color-mix(in srgb, var(--accent, #4a9eff) 92%, #fff 8%),
      var(--accent, #4a9eff)
    );
    border-color: color-mix(in srgb, var(--accent, #4a9eff) 80%, #fff 20%);
    color: #fff;
    box-shadow: 0 8px 24px color-mix(in srgb, var(--accent, #4a9eff) 35%, transparent);
  }

  .update-btn.primary:hover {
    filter: brightness(1.05);
    transform: translateY(-1px);
  }

  .update-btn.secondary {
    background: transparent;
    color: var(--text-dim, rgba(255, 255, 255, 0.65));
  }

  @keyframes stage-in {
    from {
      opacity: 0;
      transform: translateY(12px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes logo-in {
    from {
      opacity: 0;
      transform: scale(0.88);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  @keyframes glow-pulse {
    0%,
    100% {
      opacity: 0.72;
      transform: scale(1);
    }
    50% {
      opacity: 1;
      transform: scale(1.05);
    }
  }

  @keyframes ring-spin {
    to {
      transform: rotate(360deg);
    }
  }

  @keyframes progress-slide {
    0% {
      transform: translateX(-130%);
    }
    100% {
      transform: translateX(320%);
    }
  }
</style>