<script lang="ts">
  import { onMount } from "svelte";

  type Phase = "idle" | "typing" | "diff" | "review" | "proceed";

  let phase = $state<Phase>("idle");
  let active = $state(false);

  const lines = [
    { kind: "ctx", text: "Agent proposes updating auth middleware" },
    { kind: "add", text: "+  if (!token) return res.status(401).send();" },
    { kind: "add", text: "+  req.user = verifyToken(token);" },
    { kind: "ctx", text: "Review changes before they run in your terminal." },
  ];

  onMount(() => {
    let timer: ReturnType<typeof setTimeout>;
    const run = () => {
      if (!active) return;
      phase = "typing";
      timer = setTimeout(() => {
        phase = "diff";
        timer = setTimeout(() => {
          phase = "review";
          timer = setTimeout(() => {
            phase = "proceed";
            timer = setTimeout(() => {
              phase = "idle";
              timer = setTimeout(run, 700);
            }, 1400);
          }, 1800);
        }, 1200);
      }, 900);
    };
    active = true;
    run();
    return () => {
      active = false;
      clearTimeout(timer);
    };
  });
</script>

<div class="demo" class:phase-review={phase === "review"} class:phase-proceed={phase === "proceed"}>
  <div class="demo-top">
    <span class="dot"></span>
    <span class="demo-title">Review-driven development</span>
    <span class="demo-badge">Live</span>
  </div>
  <div class="demo-body">
    <div class="chat">
      <div class="bubble agent">
        <div class="bubble-label">Grok Agent</div>
        <p>I'll add token validation to your API route. You review before anything executes.</p>
      </div>
      {#if phase !== "idle" && phase !== "typing"}
        <div class="artifact" class:highlight={phase === "diff" || phase === "review" || phase === "proceed"}>
          <div class="artifact-head">
            <span>middleware.ts</span>
            <span class="chip">+2 lines</span>
          </div>
          <pre>{#each lines as line}<div class:add={line.kind === "add"}>{line.text}</div>{/each}</pre>
        </div>
      {/if}
    </div>
    <div class="actions">
      <button type="button" class="btn review" class:pulse={phase === "review"}>Review</button>
      <button type="button" class="btn proceed" class:pulse={phase === "proceed"}>Proceed</button>
    </div>
  </div>
  <div class="demo-foot">
    <span class:lit={phase === "review"}>1. Agent drafts a change</span>
    <span class:lit={phase === "diff"}>2. You inspect the diff</span>
    <span class:lit={phase === "proceed"}>3. You approve to run</span>
  </div>
</div>

<style>
  .demo {
    display: flex;
    flex-direction: column;
    height: 100%;
    border-radius: 14px;
    border: 1px solid rgba(255, 255, 255, 0.08);
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.03), rgba(255, 255, 255, 0.01));
    overflow: hidden;
  }
  .demo-top {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 14px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    font-size: 12px;
    color: #b4b4c4;
  }
  .dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #4a9eff;
    box-shadow: 0 0 10px rgba(74, 158, 255, 0.6);
    animation: pulse-dot 2s ease-in-out infinite;
  }
  .demo-title { font-weight: 600; color: #e4e4ec; }
  .demo-badge {
    margin-left: auto;
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: #98c379;
    background: rgba(152, 195, 121, 0.12);
    padding: 2px 8px;
    border-radius: 999px;
  }
  .demo-body {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 14px;
    gap: 12px;
    min-height: 0;
  }
  .chat { display: flex; flex-direction: column; gap: 10px; flex: 1; min-height: 0; overflow: auto; }
  .bubble {
    border-radius: 10px;
    padding: 10px 12px;
    font-size: 12px;
    line-height: 1.45;
    color: #d8d8e8;
  }
  .bubble.agent {
    background: rgba(74, 158, 255, 0.1);
    border: 1px solid rgba(74, 158, 255, 0.22);
  }
  .bubble-label {
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: #4a9eff;
    margin-bottom: 4px;
  }
  .artifact {
    border-radius: 10px;
    border: 1px solid rgba(255, 255, 255, 0.08);
    background: #0c0c11;
    transition: border-color 0.3s, box-shadow 0.3s;
  }
  .artifact.highlight {
    border-color: rgba(74, 158, 255, 0.45);
    box-shadow: 0 0 0 1px rgba(74, 158, 255, 0.15);
  }
  .artifact-head {
    display: flex;
    justify-content: space-between;
    padding: 8px 10px;
    font-size: 11px;
    color: #9aa0b8;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  }
  .chip {
    color: #98c379;
    background: rgba(152, 195, 121, 0.12);
    padding: 1px 6px;
    border-radius: 999px;
  }
  pre {
    margin: 0;
    padding: 10px;
    font-family: "Cascadia Code", Consolas, monospace;
    font-size: 11px;
    line-height: 1.5;
    color: #b4b4c4;
    white-space: pre-wrap;
  }
  pre div.add { color: #98c379; }
  .actions { display: flex; gap: 8px; justify-content: flex-end; }
  .btn {
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(255, 255, 255, 0.04);
    color: #e4e4ec;
    border-radius: 8px;
    padding: 6px 14px;
    font-size: 12px;
    cursor: default;
    transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
  }
  .btn.review.pulse {
    border-color: rgba(74, 158, 255, 0.6);
    box-shadow: 0 0 0 3px rgba(74, 158, 255, 0.18);
    transform: translateY(-1px);
  }
  .btn.proceed {
    background: #4a9eff;
    border-color: transparent;
    color: #fff;
  }
  .btn.proceed.pulse {
    box-shadow: 0 0 0 3px rgba(74, 158, 255, 0.25);
    transform: translateY(-1px) scale(1.02);
  }
  .demo-foot {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 6px;
    padding: 10px 14px 12px;
    border-top: 1px solid rgba(255, 255, 255, 0.06);
    font-size: 10px;
    color: #6b7280;
  }
  .demo-foot span.lit { color: #7eb8ff; }
  @keyframes pulse-dot {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.6; transform: scale(0.9); }
  }
</style>