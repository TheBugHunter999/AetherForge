<script lang="ts">
  import { onMount, onDestroy } from "svelte";

  let canvas: HTMLCanvasElement | undefined = $state();
  let animFrame = 0;
  let time = 0;
  let W = 0;
  let H = 0;

  interface Star { x: number; y: number; z: number; size: number; brightness: number; twinkleSpeed: number; twinkleOffset: number; color: string; }
  interface Nebula { x: number; y: number; rx: number; ry: number; rotation: number; colors: string[]; opacity: number; pulseSpeed: number; phase: number; layers: number; }
  interface ShootingStar { x: number; y: number; vx: number; vy: number; life: number; maxLife: number; size: number; color: string; }
  interface DustCloud { x: number; y: number; w: number; h: number; drift: number; phase: number; opacity: number; color: string; }

  let stars: Star[] = [];
  let nebulae: Nebula[] = [];
  let shootingStars: ShootingStar[] = [];
  let dustClouds: DustCloud[] = [];

  const STAR_COLORS = ["#ffffff", "#e8e0ff", "#c8d8ff", "#ffd4a8", "#a8c8ff", "#ffc8e0", "#c8ffd4", "#fff8e0"];

  function initStars() {
    stars = Array.from({ length: 550 }, () => ({
      x: Math.random(), y: Math.random(),
      z: Math.random() * 3 + 0.3,
      size: Math.random() * 2.5 + 0.2,
      brightness: Math.random() * 0.8 + 0.2,
      twinkleSpeed: Math.random() * 0.025 + 0.003,
      twinkleOffset: Math.random() * Math.PI * 2,
      color: STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)],
    }));
  }

  function initNebulae() {
    nebulae = [
      { x: 0.2, y: 0.25, rx: 0.22, ry: 0.14, rotation: 0.4, colors: ["rgba(107,79,240,0.07)", "rgba(76,201,240,0.03)", "rgba(160,108,255,0.01)"], opacity: 0.8, pulseSpeed: 0.002, phase: 0, layers: 3 },
      { x: 0.75, y: 0.7, rx: 0.18, ry: 0.12, rotation: -0.6, colors: ["rgba(255,107,180,0.06)", "rgba(160,108,255,0.03)", "rgba(76,201,240,0.01)"], opacity: 0.7, pulseSpeed: 0.0015, phase: 1.5, layers: 3 },
      { x: 0.5, y: 0.5, rx: 0.25, ry: 0.1, rotation: 0.15, colors: ["rgba(76,201,240,0.04)", "rgba(107,159,255,0.02)", "rgba(160,108,255,0.008)"], opacity: 0.5, pulseSpeed: 0.001, phase: 3.0, layers: 4 },
      { x: 0.85, y: 0.15, rx: 0.15, ry: 0.1, rotation: -0.3, colors: ["rgba(255,208,107,0.04)", "rgba(255,159,67,0.02)", "rgba(160,108,255,0.01)"], opacity: 0.5, pulseSpeed: 0.0012, phase: 4.5, layers: 2 },
      { x: 0.1, y: 0.8, rx: 0.2, ry: 0.13, rotation: 0.7, colors: ["rgba(107,255,160,0.04)", "rgba(76,201,240,0.02)", "rgba(160,108,255,0.008)"], opacity: 0.45, pulseSpeed: 0.0018, phase: 2.0, layers: 3 },
    ];
  }

  function initDustClouds() {
    dustClouds = Array.from({ length: 8 }, (_, i) => ({
      x: Math.random(), y: 0.3 + Math.random() * 0.4,
      w: 0.3 + Math.random() * 0.4, h: 0.08 + Math.random() * 0.12,
      drift: (Math.random() - 0.5) * 0.00005,
      phase: Math.random() * Math.PI * 2,
      opacity: 0.02 + Math.random() * 0.02,
      color: ["rgba(107,79,240,", "rgba(76,201,240,", "rgba(160,108,255,", "rgba(255,107,180,"][i % 4],
    }));
  }

  function drawStar(ctx: CanvasRenderingContext2D, s: Star) {
    const px = s.x * W;
    const py = s.y * H;
    const twinkle = Math.sin(time * s.twinkleSpeed + s.twinkleOffset) * 0.45 + 0.55;
    const alpha = s.brightness * twinkle;
    const size = s.size * (0.5 + s.z * 0.3);

    ctx.save();
    ctx.globalAlpha = alpha;

    // Glow for bright stars
    if (size > 1.5) {
      const glowR = size * 5;
      const glow = ctx.createRadialGradient(px, py, 0, px, py, glowR);
      glow.addColorStop(0, s.color + "a0");
      glow.addColorStop(0.2, s.color + "40");
      glow.addColorStop(0.5, s.color + "10");
      glow.addColorStop(1, "transparent");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(px, py, glowR, 0, Math.PI * 2);
      ctx.fill();

      // Cross flare for very bright stars
      if (size > 2.0) {
        ctx.globalAlpha = alpha * 0.3;
        ctx.strokeStyle = s.color;
        ctx.lineWidth = 0.5;
        const flareLen = size * 4;
        ctx.beginPath();
        ctx.moveTo(px - flareLen, py); ctx.lineTo(px + flareLen, py);
        ctx.moveTo(px, py - flareLen); ctx.lineTo(px, py + flareLen);
        ctx.stroke();
      }
    }

    ctx.fillStyle = s.color;
    ctx.beginPath();
    ctx.arc(px, py, size * 0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawNebula(ctx: CanvasRenderingContext2D, n: Nebula) {
    const cx = n.x * W;
    const cy = n.y * H;
    const rx = n.rx * W;
    const ry = n.ry * H;
    const pulse = Math.sin(time * n.pulseSpeed + n.phase) * 0.15 + 0.85;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(n.rotation);
    ctx.globalAlpha = n.opacity * pulse;

    for (let l = 0; l < n.layers; l++) {
      const layerScale = 1 + l * 0.3;
      const layerOpacity = 1 - l * 0.25;
      const colorIdx = l % n.colors.length;
      const g = ctx.createRadialGradient(l * 10, l * 5, 0, 0, 0, Math.max(rx, ry) * layerScale);
      g.addColorStop(0, n.colors[colorIdx]);
      g.addColorStop(0.6, n.colors[(colorIdx + 1) % n.colors.length]);
      g.addColorStop(1, "transparent");
      ctx.globalAlpha = n.opacity * pulse * layerOpacity;
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.ellipse(l * 8, l * 4, rx * layerScale, ry * layerScale, l * 0.2, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  function drawDustBand(ctx: CanvasRenderingContext2D, d: DustCloud) {
    const drift = Math.sin(time * 0.0003 + d.phase) * 0.02;
    const cx = (d.x + drift) * W;
    const cy = d.y * H;
    const w = d.w * W;
    const h = d.h * H;
    const pulse = Math.sin(time * 0.0008 + d.phase) * 0.3 + 0.7;

    ctx.save();
    ctx.globalAlpha = d.opacity * pulse;
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(w, h) * 0.5);
    g.addColorStop(0, d.color + "0.04)");
    g.addColorStop(0.5, d.color + "0.02)");
    g.addColorStop(1, "transparent");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(cx, cy, w * 0.5, h * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function spawnShootingStar(): ShootingStar {
    const angle = Math.random() * 0.5 + 0.3;
    const speed = Math.random() * 0.005 + 0.003;
    return {
      x: Math.random() * 0.6, y: Math.random() * 0.25,
      vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
      life: 0, maxLife: 60 + Math.random() * 60,
      size: 1 + Math.random() * 2,
      color: ["#ffffff", "#c8d8ff", "#ffd4a8"][Math.floor(Math.random() * 3)],
    };
  }

  function drawShootingStar(ctx: CanvasRenderingContext2D, s: ShootingStar) {
    const progress = s.life / s.maxLife;
    const alpha = progress < 0.15 ? progress / 0.15 : progress > 0.7 ? (1 - progress) / 0.3 : 1;
    const px = s.x * W;
    const py = s.y * H;
    const tailLen = 80 * s.size;

    ctx.save();
    ctx.globalAlpha = alpha * 0.85;
    const g = ctx.createLinearGradient(px, py, px - s.vx * tailLen / 0.004, py - s.vy * tailLen / 0.004);
    g.addColorStop(0, s.color);
    g.addColorStop(0.2, s.color + "80");
    g.addColorStop(1, "transparent");
    ctx.strokeStyle = g;
    ctx.lineWidth = s.size * 1.2;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.lineTo(px - s.vx * tailLen / 0.004, py - s.vy * tailLen / 0.004);
    ctx.stroke();

    // Head glow
    ctx.globalAlpha = alpha;
    const headG = ctx.createRadialGradient(px, py, 0, px, py, s.size * 4);
    headG.addColorStop(0, s.color);
    headG.addColorStop(1, "transparent");
    ctx.fillStyle = headG;
    ctx.beginPath();
    ctx.arc(px, py, s.size * 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function render() {
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    time++;
    ctx.clearRect(0, 0, W, H);

    // Deep space background gradient
    const bg = ctx.createRadialGradient(W * 0.3, H * 0.3, 0, W * 0.5, H * 0.5, Math.max(W, H) * 0.8);
    bg.addColorStop(0, "#0a0820");
    bg.addColorStop(0.4, "#050510");
    bg.addColorStop(0.7, "#030308");
    bg.addColorStop(1, "#020206");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // Dust clouds (furthest back)
    for (const d of dustClouds) drawDustBand(ctx, d);

    // Nebulae
    for (const n of nebulae) drawNebula(ctx, n);

    // Stars
    for (const s of stars) drawStar(ctx, s);

    // Shooting stars
    if (Math.random() < 0.006 && shootingStars.length < 3) shootingStars.push(spawnShootingStar());
    for (let i = shootingStars.length - 1; i >= 0; i--) {
      const s = shootingStars[i];
      s.x += s.vx; s.y += s.vy; s.life++;
      drawShootingStar(ctx, s);
      if (s.life >= s.maxLife) shootingStars.splice(i, 1);
    }

    animFrame = requestAnimationFrame(render);
  }

  function resize() {
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    W = rect.width; H = rect.height;
    canvas.width = W * dpr; canvas.height = H * dpr;
    const ctx = canvas.getContext("2d");
    if (ctx) ctx.scale(dpr, dpr);
  }

  onMount(() => {
    initStars(); initNebulae(); initDustClouds();
    resize();
    animFrame = requestAnimationFrame(render);
    window.addEventListener("resize", resize);
  });

  onDestroy(() => {
    cancelAnimationFrame(animFrame);
    window.removeEventListener("resize", resize);
  });
</script>

<canvas bind:this={canvas} class="cosmic-bg" aria-hidden="true"></canvas>

<style>
  .cosmic-bg {
    position: fixed; inset: 0; width: 100%; height: 100%;
    z-index: 0; pointer-events: none;
  }
</style>
