<div class="skills-stage">
  <div class="ambient-grid" aria-hidden="true"></div>
  <div class="ambient-vignette" aria-hidden="true"></div>

  <div class="skills-card glass glass--strong">
    <div class="skills-icon" aria-hidden="true">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <rect x="4" y="4" width="8" height="8" rx="1.5" />
        <rect x="12" y="12" width="8" height="8" rx="1.5" />
        <path d="M12 8h2.5a2.5 2.5 0 0 1 0 5H12" stroke-linecap="round" />
      </svg>
    </div>
    <h1>Skills &amp; Connectors</h1>
    <p class="skills-sub">Work in progress — coming soon.</p>
    <p class="skills-desc">
      Connect external tools, data sources, and skills to your Grok agents. This area is under construction.
    </p>
    <span class="badge-soon">Soon</span>

    <div class="skills-placeholders" aria-hidden="true">
      <span></span><span></span><span></span><span></span>
    </div>
  </div>
</div>

<style>
  .skills-stage {
    position: relative;
    width: 100%;
    height: 100%;
    min-height: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    background: var(--editor-bg);
  }

  .skills-card {
    position: relative;
    z-index: 3;
    max-width: 460px;
    width: calc(100% - 40px);
    padding: 32px;
    border-radius: var(--radius-lg);
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
  }

  .skills-icon {
    color: var(--accent);
    margin-bottom: 4px;
  }

  h1 {
    margin: 0;
    font-size: 24px;
    font-weight: 650;
    letter-spacing: -0.02em;
    color: var(--text);
  }

  .skills-sub {
    margin: 0;
    font-size: 14px;
    color: var(--text-dim);
  }

  .skills-desc {
    margin: 0;
    font-size: 13px;
    line-height: 1.5;
    color: var(--text-mute);
    max-width: 360px;
  }

  .badge-soon {
    margin-top: 6px;
    font-size: 9px;
    font-weight: 600;
    padding: 1px 6px;
    border-radius: var(--radius-pill);
    background: var(--warn-soft);
    color: var(--warn);
  }

  .skills-placeholders {
    display: flex;
    gap: 8px;
    margin-top: 20px;
    opacity: 0.4;
  }

  .skills-placeholders span {
    width: 48px;
    height: 48px;
    border-radius: var(--radius-md);
    background: var(--panel-2);
    border: 1px solid var(--border);
  }
</style>