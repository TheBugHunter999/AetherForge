<script lang="ts">
  import { onMount } from "svelte";
  import type { AgentModePreset } from "$lib/editor-utils";
  import {
    APP_DISPLAY_NAME,
    loadRecentWorkspaces,
    WELCOME_TAGLINE,
  } from "$lib/branding";

  export type RecentWorkspace = {
    path: string;
    name: string;
    lastOpened?: number;
  };

  export type WelcomeThemeId = "default-dark" | "high-contrast";

  type Props = {
    onOpenFolder: () => void;
    onOpenTerminal: () => void;
    onLaunchAgents: (preset: AgentModePreset) => void;
    onAgentPresetChange?: (preset: AgentModePreset) => void;
    onOpenCanvas: () => void;
    onCommandSubmit: (command: string) => void;
    onApplyTheme: (themeId: WelcomeThemeId) => void;
    agentModePreset?: AgentModePreset;
    recentWorkspaces?: RecentWorkspace[];
  };

  let {
    onOpenFolder,
    onOpenTerminal,
    onLaunchAgents,
    onAgentPresetChange,
    onOpenCanvas,
    onCommandSubmit,
    onApplyTheme,
    agentModePreset = "agent-driven",
    recentWorkspaces = [],
  }: Props = $props();

  let commandText = $state("");
  let commandInput = $state<HTMLInputElement | null>(null);
  let selectedAgentPreset = $state<AgentModePreset>("agent-driven");
  let storedWorkspaces = $state<RecentWorkspace[]>([]);
  let showQuickMenu = $state(false);
  let showModeMenu = $state(false);
  let starred = $state(false);
  let comparePercent = $state(50);
  let compareDragging = $state(false);
  let launchAnim = $state(false);

  const agentPresets: {
    id: AgentModePreset;
    title: string;
    caption: string;
    badge?: string;
  }[] = [
    { id: "strict", title: "Strict", caption: "Ask before every action" },
    {
      id: "review-driven",
      title: "Review-driven",
      caption: "Frequent checkpoints",
      badge: "Recommended",
    },
    { id: "agent-driven", title: "Agent-driven", caption: "Fewer interruptions" },
    { id: "custom", title: "Custom", caption: "Tune policies yourself" },
  ];

  const modeLabel = $derived(
    selectedAgentPreset === "agent-driven"
      ? "Heavy"
      : (agentPresets.find((p) => p.id === selectedAgentPreset)?.title ?? "Heavy"),
  );

  const themePreviews: {
    id: WelcomeThemeId;
    label: string;
    subtitle: string;
    frame: string;
    sidebar: string;
    editor: string;
    accent: string;
  }[] = [
    {
      id: "default-dark",
      label: "Premium Grok",
      subtitle: "Dark & warm gold accents",
      frame: "#0a0a0e",
      sidebar: "#0e0e12",
      editor: "#08080c",
      accent: "#c89650",
    },
    {
      id: "high-contrast",
      label: "Midnight",
      subtitle: "Pure black, crisp cyan",
      frame: "#000000",
      sidebar: "#050505",
      editor: "#030303",
      accent: "#55aadd",
    },
  ];

  const emptyExamples = [
    { label: "Open a sample folder", id: "open-folder" },
    { label: "Clone a repository", id: "clone-repo" },
    { label: "Launch parallel agents", id: "launch-agent" },
  ] as const;

  const quickChips = [
    { label: "Open folder", id: "open-folder" },
    { label: "Clone repo", id: "clone-repo" },
    { label: "New canvas", id: "new-canvas" },
    { label: "Launch agent", id: "launch-agent" },
    { label: "Open terminal", id: "open-terminal" },
  ] as const;

  function selectAgentPreset(preset: AgentModePreset) {
    selectedAgentPreset = preset;
    onAgentPresetChange?.(preset);
  }

  function launchParallelAgents() {
    onLaunchAgents(selectedAgentPreset);
  }

  $effect(() => {
    selectedAgentPreset = agentModePreset;
  });

  function runQuickAction(id: (typeof quickChips)[number]["id"]) {
    switch (id) {
      case "open-folder":
        onOpenFolder();
        break;
      case "clone-repo":
        onCommandSubmit("git clone");
        break;
      case "new-canvas":
        onOpenCanvas();
        break;
      case "launch-agent":
        launchParallelAgents();
        break;
      case "open-terminal":
        onOpenTerminal();
        break;
    }
  }

  const effectiveWorkspaces = $derived(
    recentWorkspaces.length > 0 ? recentWorkspaces : storedWorkspaces,
  );

  function submitCommand() {
    const trimmed = commandText.trim();
    if (!trimmed) return;
    onCommandSubmit(trimmed);
    commandText = "";
  }

  function handleCommandKeydown(event: KeyboardEvent) {
    if (event.key === "Enter") {
      event.preventDefault();
      submitCommand();
    }
  }

  function openWorkspace(workspace: RecentWorkspace) {
    onCommandSubmit(`open ${workspace.path}`);
  }

  function formatLastOpened(timestamp?: number): string {
    if (!timestamp) return "Recently opened";
    const delta = Date.now() - timestamp;
    const minutes = Math.floor(delta / 60_000);
    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 48) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  }

  function handleStartWorkspace() {
    launchAnim = true;
    setTimeout(() => {
      launchAnim = false;
      onOpenFolder();
    }, 900);
  }

  onMount(() => {
    storedWorkspaces = loadRecentWorkspaces();
    commandInput?.focus();
  });
</script>

<div class="grok-welcome welcome-stage">
  <div class="ambient-grid" aria-hidden="true"></div>
  <div class="ambient-vignette" aria-hidden="true"></div>

  <div class="welcome-center grok-welcome__shell">
    <div class="welcome-supergrok-hero" class:launch-react={launchAnim} aria-label="SuperGrok Heavy">
      <span class="welcome-supergrok-word">SuperGrok</span>
      <span class="welcome-supergrok-badge">HEAVY</span>
      <!-- StarToggle (adapted from Button.svelte sparkle bookmark) -->
      <div class="star-toggle" title={starred ? 'Unstar' : 'Star this workspace'}>
        <input class="star-toggle__input" id="star-fav" type="checkbox" bind:checked={starred} />
        <label class="star-toggle__label" for="star-fav">
          <div class="star-toggle__icon">
            <span style="--sw:2;--sd:25;--ss:11" class="star-toggle__sparkle"></span>
            <span style="--sw:1;--sd:100;--ss:18" class="star-toggle__sparkle"></span>
            <span style="--sw:1;--sd:280;--ss:5" class="star-toggle__sparkle"></span>
            <span style="--sw:2;--sd:200;--ss:3" class="star-toggle__sparkle"></span>
            <span style="--sw:2;--sd:30;--ss:20" class="star-toggle__sparkle"></span>
            <span style="--sw:1;--sd:250;--ss:4" class="star-toggle__sparkle"></span>
            <span style="--sw:2;--sd:210;--ss:8" class="star-toggle__sparkle"></span>
            <span style="--sw:1;--sd:100;--ss:9" class="star-toggle__sparkle"></span>
            <span style="--sw:2;--sd:135;--ss:9" class="star-toggle__sparkle"></span>
            <span style="--sw:2;--sd:45;--ss:4" class="star-toggle__sparkle"></span>
            <span style="--sw:1;--sd:78;--ss:16" class="star-toggle__sparkle"></span>
            <span style="--sw:2;--sd:97;--ss:1" class="star-toggle__sparkle"></span>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 30 30" class="star-toggle__star-icon">
              <path d="M0.96233 28.61C1.36043 29.0081 1.96007 29.1255 2.47555 28.8971L10.4256 25.3552C13.2236 24.11 16.4254 24.1425 19.2107 25.4401L27.4152 29.2747C27.476 29.3044 27.5418 29.3023 27.6047 29.32C27.6563 29.3348 27.7079 29.3497 27.761 29.3574C27.843 29.3687 27.9194 29.3758 28 29.3688C28.1273 29.3617 28.2531 29.3405 28.3726 29.2945C28.4447 29.262 28.5162 29.2287 28.5749 29.1842C28.6399 29.1446 28.6993 29.0994 28.7509 29.0477L28.9008 28.8582C28.9468 28.7995 28.9793 28.7274 29.0112 28.656C29.0599 28.5322 29.0811 28.4036 29.0882 28.2734C29.0939 28.1957 29.0868 28.1207 29.0769 28.0415C29.0705 27.9955 29.0585 27.9524 29.0472 27.9072C29.0295 27.8343 29.0302 27.7601 28.9984 27.6901L25.1638 19.4855C23.8592 16.7073 23.8273 13.5048 25.0726 10.7068L28.6145 2.75679C28.8429 2.24131 28.7318 1.63531 28.3337 1.2372C27.9165 0.820011 27.271 0.721743 26.7491 0.9961L19.8357 4.59596C16.8418 6.15442 13.2879 6.18696 10.2615 4.70062L1.80308 0.520214C1.7055 0.474959 1.60722 0.441742 1.50964 0.421943C1.44459 0.409215 1.37882 0.395769 1.3074 0.402133C1.14406 0.395769 0.981436 0.428275 0.818095 0.499692C0.77284 0.519491 0.719805 0.545671 0.67455 0.578198C0.596061 0.617088 0.524653 0.675786 0.4596 0.74084C0.394546 0.805894 0.335843 0.877306 0.296245 0.956502C0.263718 1.00176 0.237561 1.05477 0.217762 1.10003C0.152708 1.24286 0.126545 1.40058 0.120181 1.54978C0.120181 1.61483 0.126527 1.6735 0.132891 1.73219C0.15269 1.85664 0.178881 1.97332 0.237571 2.08434L4.41798 10.5427C5.91139 13.5621 5.8725 17.1238 4.3204 20.1099L0.720514 27.0233C0.440499 27.5536 0.545137 28.1928 0.96233 28.61Z"></path>
            </svg>
          </div>
        </label>
      </div>
    </div>

    <div class="cmdbar cmdbar--pill" role="search">
      <button
        type="button"
        class="cmdbar__plus"
        aria-label="Quick actions"
        aria-expanded={showQuickMenu}
        onclick={() => {
          showQuickMenu = !showQuickMenu;
          showModeMenu = false;
        }}
      >+</button>

      {#if showQuickMenu}
        <div class="cmdbar__menu" role="menu">
          {#each quickChips as chip}
            <button
              type="button"
              class="cmdbar__menu-item"
              role="menuitem"
              onclick={() => {
                runQuickAction(chip.id);
                showQuickMenu = false;
              }}
            >{chip.label}</button>
          {/each}
        </div>
      {/if}

      <input
        bind:this={commandInput}
        class="cmdbar__input"
        type="text"
        placeholder="How can I help you today?"
        bind:value={commandText}
        onkeydown={handleCommandKeydown}
        aria-label="Command"
      />

      <div class="cmdbar__right">
        <button
          type="button"
          class="cmdbar__mode"
          aria-haspopup="listbox"
          aria-expanded={showModeMenu}
          onclick={() => {
            showModeMenu = !showModeMenu;
            showQuickMenu = false;
          }}
        >
          {modeLabel} <span class="chev">▾</span>
        </button>

        {#if showModeMenu}
          <div class="cmdbar__menu cmdbar__menu--mode" role="listbox">
            {#each agentPresets as preset}
              <button
                type="button"
                class="cmdbar__menu-item"
                class:cmdbar__menu-item--active={selectedAgentPreset === preset.id}
                role="option"
                aria-selected={selectedAgentPreset === preset.id}
                onclick={() => {
                  selectAgentPreset(preset.id);
                  showModeMenu = false;
                }}
              >{preset.id === "agent-driven" ? "Heavy" : preset.title}</button>
            {/each}
          </div>
        {/if}

        <button class="cmdbar__icon" title="Voice input — coming soon" disabled aria-label="Voice input">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
            <rect x="9" y="3" width="6" height="11" rx="3" />
            <path d="M6 11a6 6 0 0 0 12 0M12 17v3" stroke-linecap="round" />
          </svg>
        </button>

        <button class="cmdbar__voice" title="Voice input — coming soon" disabled aria-label="Voice waveform">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <rect x="4" y="9" width="2" height="6" rx="1" />
            <rect x="8" y="6" width="2" height="12" rx="1" />
            <rect x="12" y="8" width="2" height="8" rx="1" />
            <rect x="16" y="5" width="2" height="14" rx="1" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Themes section (moved up for visibility) -->
    <section class="grok-welcome__section grok-welcome__section--themes" aria-labelledby="grok-welcome-themes-heading">
      <div class="grok-welcome__section-head">
        <h2 id="grok-welcome-themes-heading" class="grok-welcome__section-title">Themes</h2>
      </div>
      <div class="grok-welcome__theme-row">
        {#each themePreviews as theme}
          <article class="grok-welcome__theme-card">
            <div
              class="grok-welcome__theme-preview"
              style:--grok-theme-frame={theme.frame}
              style:--grok-theme-side={theme.sidebar}
              style:--grok-theme-editor={theme.editor}
              style:--grok-theme-accent={theme.accent}
            >
              <span class="grok-welcome__theme-bar">
                <span class="grok-welcome__theme-dot" style="background: #ff5f57"></span>
                <span class="grok-welcome__theme-dot" style="background: #febc2e"></span>
                <span class="grok-welcome__theme-dot" style="background: #28c840"></span>
              </span>
              <span class="grok-welcome__theme-side">
                <span class="grok-welcome__theme-file"></span>
                <span class="grok-welcome__theme-file grok-welcome__theme-file--active"></span>
                <span class="grok-welcome__theme-file"></span>
              </span>
              <span class="grok-welcome__theme-editor">
                <span class="grok-welcome__theme-line"></span>
                <span class="grok-welcome__theme-line grok-welcome__theme-line--short"></span>
                <span class="grok-welcome__theme-line grok-welcome__theme-line--accent"></span>
                <span class="grok-welcome__theme-line grok-welcome__theme-line--short"></span>
              </span>
            </div>
            <div class="grok-welcome__theme-footer">
              <div class="grok-welcome__theme-info">
                <span class="grok-welcome__theme-label">{theme.label}</span>
                <span class="grok-welcome__theme-subtitle">{theme.subtitle}</span>
              </div>
              <button
                type="button"
                class="grok-welcome__theme-apply"
                onclick={() => onApplyTheme(theme.id)}
              >
                Apply
              </button>
            </div>
          </article>
        {/each}
      </div>

      <!-- ThemeCompare slider (ported from next-app Compare component) -->
      {#if themePreviews.length >= 2}
        <div class="theme-compare" aria-label="Compare themes">
          <div
            class="theme-compare__viewport"
            role="slider"
            aria-valuenow={Math.round(comparePercent)}
            aria-valuemin={0}
            aria-valuemax={100}
            tabindex={0}
            onmousemove={(e) => {
              if (compareDragging) {
                const rect = e.currentTarget.getBoundingClientRect();
                comparePercent = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
              }
            }}
            onmouseenter={(e) => {
              if (!compareDragging) {
                const rect = e.currentTarget.getBoundingClientRect();
                comparePercent = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
              }
            }}
            onmousedown={(e) => { compareDragging = true; e.preventDefault(); }}
            onmouseup={() => { compareDragging = false; }}
            onmouseleave={() => { if (!compareDragging) comparePercent = 50; else compareDragging = false; }}
            onkeydown={(e) => {
              if (e.key === 'ArrowLeft') comparePercent = Math.max(0, comparePercent - 2);
              if (e.key === 'ArrowRight') comparePercent = Math.min(100, comparePercent + 2);
            }}
          >
            <!-- Second theme (background, always visible) -->
            <div class="theme-compare__layer theme-compare__layer--back"
              style:--grok-theme-frame={themePreviews[1].frame}
              style:--grok-theme-side={themePreviews[1].sidebar}
              style:--grok-theme-editor={themePreviews[1].editor}
              style:--grok-theme-accent={themePreviews[1].accent}
            >
              <span class="grok-welcome__theme-bar"></span>
              <span class="grok-welcome__theme-side"></span>
              <span class="grok-welcome__theme-editor">
                <span class="grok-welcome__theme-line"></span>
                <span class="grok-welcome__theme-line grok-welcome__theme-line--short"></span>
                <span class="grok-welcome__theme-line grok-welcome__theme-line--accent"></span>
              </span>
            </div>
            <!-- First theme (clipped by slider) -->
            <div class="theme-compare__layer theme-compare__layer--front"
              style:clip-path="inset(0 {100 - comparePercent}% 0 0)"
              style:--grok-theme-frame={themePreviews[0].frame}
              style:--grok-theme-side={themePreviews[0].sidebar}
              style:--grok-theme-editor={themePreviews[0].editor}
              style:--grok-theme-accent={themePreviews[0].accent}
            >
              <span class="grok-welcome__theme-bar"></span>
              <span class="grok-welcome__theme-side"></span>
              <span class="grok-welcome__theme-editor">
                <span class="grok-welcome__theme-line"></span>
                <span class="grok-welcome__theme-line grok-welcome__theme-line--short"></span>
                <span class="grok-welcome__theme-line grok-welcome__theme-line--accent"></span>
              </span>
            </div>
            <!-- Slider line + handle -->
            <div class="theme-compare__slider" style:left="{comparePercent}%">
              <div class="theme-compare__handle">
                <svg viewBox="0 0 16 16" width="12" height="12"><path d="M6 3v10M10 3v10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
              </div>
            </div>
            <!-- Labels -->
            <span class="theme-compare__label theme-compare__label--left">{themePreviews[0].label}</span>
            <span class="theme-compare__label theme-compare__label--right">{themePreviews[1].label}</span>
          </div>
        </div>
      {/if}
    </section>

    <p class="welcome-title grok-welcome__tagline">{WELCOME_TAGLINE}</p>

    <section class="grok-welcome__section" aria-labelledby="grok-welcome-recent-heading">
      <div class="grok-welcome__section-head">
        <h2 id="grok-welcome-recent-heading" class="grok-welcome__section-title">Recent workspaces</h2>
      </div>
      {#if effectiveWorkspaces.length > 0}
        <ul class="grok-welcome__workspace-list">
          {#each effectiveWorkspaces as workspace (workspace.path)}
            <li>
              <button
                type="button"
                class="grok-welcome__workspace-row"
                onclick={() => openWorkspace(workspace)}
              >
                <span class="grok-welcome__workspace-icon" aria-hidden="true">
                  <svg viewBox="0 0 16 16">
                    <path d="M2 5h4l1.1 1.2H14v6.3H2V5z" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round" />
                  </svg>
                </span>
                <span class="grok-welcome__workspace-meta">
                  <span class="grok-welcome__workspace-name">{workspace.name}</span>
                  <span class="grok-welcome__workspace-path">{workspace.path}</span>
                </span>
                <span class="grok-welcome__workspace-time">{formatLastOpened(workspace.lastOpened)}</span>
              </button>
            </li>
          {/each}
        </ul>
      {:else}
        <div class="grok-welcome__empty">
          <p class="grok-welcome__empty-copy">No recent workspaces yet. Try one of these to get started:</p>
          <!-- StartButton (adapted from StartButton.svelte cyberpunk grid button) -->
          <button type="button" class="start-btn" onclick={handleStartWorkspace}>
            Start
          </button>
          <div class="grok-welcome__empty-actions">
            {#each emptyExamples as example}
              <button type="button" class="grok-welcome__empty-btn" onclick={() => runQuickAction(example.id)}>
                {example.label}
              </button>
            {/each}
          </div>
        </div>
      {/if}
    </section>

    <section class="grok-welcome__section" aria-labelledby="grok-welcome-agents-heading">
      <div class="grok-welcome__section-head">
        <h2 id="grok-welcome-agents-heading" class="grok-welcome__section-title">Agent presets</h2>
      </div>
      <div class="grok-welcome__agent-row" role="group" aria-label="Agent presets">
        {#each agentPresets as preset}
          <button
            type="button"
            class="grok-welcome__agent-card"
            class:grok-welcome__agent-card--selected={selectedAgentPreset === preset.id}
            aria-pressed={selectedAgentPreset === preset.id}
            onclick={() => selectAgentPreset(preset.id)}
          >
            {#if preset.badge}
              <span class="grok-welcome__agent-badge">{preset.badge}</span>
            {/if}
            <span class="grok-welcome__agent-title">{preset.title}</span>
            <span class="grok-welcome__agent-caption">{preset.caption}</span>
          </button>
        {/each}
      </div>
    </section>

  </div>
</div>

<style>
  /* ── StarToggle (sparkle bookmark from Button.svelte) ── */
  .star-toggle {
    position: absolute;
    top: 0;
    right: -50px;
    z-index: 10;
  }
  .star-toggle__input { display: none; }
  .star-toggle__label {
    --gap: 3px;
    --width: 28px;
    cursor: pointer;
    position: relative;
    display: inline-block;
    padding: 0.3rem;
    width: calc((var(--width) + var(--gap)) * 2);
    height: 30px;
    background-color: #121212;
    border: 1px solid #555;
    border-bottom: 0;
    border-radius: 9999px;
    box-sizing: content-box;
    transition: all 0.3s ease-in-out;
  }
  .star-toggle__label::before {
    content: "";
    position: absolute;
    z-index: -10;
    top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    width: calc(100% + 1rem);
    height: calc(100% + 1rem);
    background-color: #414344;
    border: 1px solid #555;
    border-bottom: 0;
    border-radius: 9999px;
    transition: all 0.3s ease-in-out;
  }
  .star-toggle__label::after {
    content: "";
    position: absolute;
    z-index: -10;
    top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    width: 100%; height: 100%;
    background-image: radial-gradient(circle at 50% -100%, rgb(58,155,252) 0%, rgba(12,12,12,1) 80%);
    border-radius: 9999px;
  }
  .star-toggle__icon {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    width: var(--width);
    height: 30px;
    background-image: radial-gradient(circle at 50% 0%, #666 0%, #414344 100%);
    border: 1px solid #aaa;
    border-bottom: 0;
    border-radius: 9999px;
    box-shadow: inset 0 -0.1rem 0.1rem #54a8fc, inset 0 0 0.3rem 0.5rem transparent;
    transition: transform 0.3s ease-in-out;
    overflow: clip;
  }
  .star-toggle__sparkle {
    position: absolute;
    top: 50%; left: 50%;
    display: block;
    width: calc(var(--sw) * 1px);
    aspect-ratio: 1;
    background-color: #d9d9d9;
    border-radius: 50%;
    transform-origin: 50% 50%;
    rotate: calc(1deg * var(--sd));
    transform: translate(-50%, -50%);
    animation: star-sparkle calc(100s / var(--ss)) linear infinite;
  }
  @keyframes star-sparkle {
    to { width: calc(var(--sw) * 0.5px); transform: translate(2000%, -50%); }
  }
  .star-toggle__star-icon {
    width: 0.75rem;
    fill: #d9d9d9;
  }
  .star-toggle:has(.star-toggle__input:checked) .star-toggle__label {
    background-color: transparent;
    border-color: #3d6970;
    border-bottom: 0;
  }
  .star-toggle:has(.star-toggle__input:checked) .star-toggle__icon {
    overflow: visible;
    background-image: radial-gradient(circle at 50% 0%, #045ab1 0%, #54a8fc 100%);
    border-color: #54a8fc;
    border-bottom: 0;
    transform: translateX(calc((var(--gap) * 2) + 100%)) rotate(-225deg);
  }
  .star-toggle:has(.star-toggle__input:checked) .star-toggle__sparkle {
    z-index: -10;
    width: calc(var(--sw) * 1.5px);
    background-color: #acacac;
  }

  /* ── StartButton (cyberpunk grid from StartButton.svelte) ── */
  .start-btn {
    --main-color: rgb(46, 213, 115);
    --main-bg-color: rgba(46, 213, 116, 0.36);
    --pattern-color: rgba(46, 213, 116, 0.073);
    filter: hue-rotate(0deg);
    cursor: pointer;
    text-transform: uppercase;
    letter-spacing: 0.5rem;
    background:
      radial-gradient(circle, var(--main-bg-color) 0%, rgba(0,0,0,0) 95%),
      linear-gradient(var(--pattern-color) 1px, transparent 1px),
      linear-gradient(to right, var(--pattern-color) 1px, transparent 1px);
    background-size: cover, 15px 15px, 15px 15px;
    background-position: center center, center center, center center;
    border-image: radial-gradient(circle, var(--main-color) 0%, rgba(0,0,0,0) 100%) 1;
    border-width: 1px 0 1px 0;
    color: var(--main-color);
    padding: 0.8rem 2.5rem;
    font-weight: 700;
    font-size: 1.2rem;
    font-family: inherit;
    transition: background-size 0.2s ease-in-out;
    margin-bottom: 12px;
  }
  .start-btn:hover {
    background-size: cover, 10px 10px, 10px 10px;
  }
  .start-btn:active {
    filter: hue-rotate(250deg);
  }

  /* ── ThemeCompare slider (ported from next-app Compare component) ── */
  .theme-compare {
    margin-top: 16px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
  }
  .theme-compare__viewport {
    position: relative;
    width: 100%;
    max-width: 480px;
    height: 180px;
    overflow: hidden;
    border-radius: 12px;
    border: 1px solid rgba(200,150,80,0.15);
    cursor: col-resize;
    background: #111;
    box-shadow: 0 4px 24px rgba(0,0,0,0.4);
  }
  .theme-compare__layer {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: row;
  }
  .theme-compare__layer--back {
    z-index: 1;
  }
  .theme-compare__layer--front {
    z-index: 2;
  }
  .theme-compare__layer .grok-welcome__theme-bar {
    width: 100%;
    height: 10px;
    background: var(--grok-theme-frame);
    flex-shrink: 0;
  }
  .theme-compare__layer .grok-welcome__theme-side {
    width: 28%;
    flex-shrink: 0;
    background: var(--grok-theme-side);
    min-height: 0;
    flex: 1;
  }
  .theme-compare__layer .grok-welcome__theme-editor {
    flex: 1;
    background: var(--grok-theme-editor);
    display: flex;
    flex-direction: column;
    gap: 5px;
    padding: 10px;
  }
  .theme-compare__layer .grok-welcome__theme-line {
    height: 5px;
    width: 70%;
    background: rgba(255,255,255,0.1);
    border-radius: 2px;
  }
  .theme-compare__layer .grok-welcome__theme-line--short {
    width: 45%;
  }
  .theme-compare__layer .grok-welcome__theme-line--accent {
    width: 55%;
    background: var(--grok-theme-accent);
    opacity: 0.5;
  }
  .theme-compare__slider {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 2px;
    z-index: 10;
    background: linear-gradient(to bottom, transparent 5%, #c89650 30%, #c89650 70%, transparent 95%);
    pointer-events: none;
  }
  .theme-compare__handle {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 22px;
    height: 22px;
    border-radius: 6px;
    background: white;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 0 12px rgba(200,150,80,0.4), 0 2px 6px rgba(0,0,0,0.3);
    color: #333;
    pointer-events: auto;
    cursor: col-resize;
  }
  .theme-compare__label {
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.08em;
    color: rgba(224,228,255,0.6);
  }
  .theme-compare__label--left { align-self: flex-start; margin-left: 8px; }
  .theme-compare__label--right { align-self: flex-end; margin-right: 8px; }

  /* ── Launch animation: SuperGrok HEAVY reacts on "Start" ── */
  .welcome-supergrok-hero.launch-react {
    animation: hero-shockwave 0.9s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  }
  .welcome-supergrok-hero.launch-react .welcome-supergrok-word {
    animation: word-flip 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  }
  .welcome-supergrok-hero.launch-react .welcome-supergrok-badge {
    animation: badge-burst 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) 0.1s forwards;
  }

  @keyframes hero-shockwave {
    0% { filter: drop-shadow(0 0 0 transparent); }
    30% { filter: drop-shadow(0 0 60px color-mix(in srgb, var(--grok-accent, #c89650) 45%, transparent))
                     drop-shadow(0 0 120px color-mix(in srgb, var(--grok-accent, #c89650) 20%, transparent)); }
    100% { filter: drop-shadow(0 0 0 transparent); }
  }
  @keyframes word-flip {
    0% { transform: perspective(600px) rotateX(0deg) scale(1); opacity: 1; }
    40% { transform: perspective(600px) rotateX(-15deg) scale(1.06); opacity: 0.8; }
    70% { transform: perspective(600px) rotateX(8deg) scale(0.97); opacity: 1; }
    100% { transform: perspective(600px) rotateX(0deg) scale(1); opacity: 1; }
  }
  @keyframes badge-burst {
    0% { transform: translateY(4px) scale(1); }
    35% { transform: translateY(-6px) scale(1.25); }
    60% { transform: translateY(2px) scale(0.9); }
    100% { transform: translateY(4px) scale(1); }
  }
</style>