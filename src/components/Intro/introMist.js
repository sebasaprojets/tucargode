import { INTRO } from './introConfig';

/**
 * Niebla de la intro (canvas 2D): grandes bancos de niebla muy suaves y motas
 * de luz que flotan despacio. Cada elemento tiene profundidad (z) para el
 * parallax del ratón. `fx.alpha` lo anima GSAP desde la línea de tiempo.
 */
function makeSprite(hex) {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d');
  const n = parseInt(hex.slice(1), 16);
  const rgb = `${(n >> 16) & 255},${(n >> 8) & 255},${n & 255}`;
  const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grad.addColorStop(0, `rgba(${rgb},1)`);
  grad.addColorStop(0.5, `rgba(${rgb},0.35)`);
  grad.addColorStop(1, `rgba(${rgb},0)`);
  g.fillStyle = grad;
  g.fillRect(0, 0, 128, 128);
  return c;
}

const rand = (a, b) => a + Math.random() * (b - a);

export function createIntroMist(canvas, { mobile = false } = {}) {
  const ctx = canvas.getContext('2d');
  const sprite = makeSprite(INTRO.colors.mist);
  const cfg = mobile ? INTRO.mist.mobile : INTRO.mist.desktop;
  const fx = { alpha: 1 };
  const par = { x: 0, y: 0, tx: 0, ty: 0 };
  let W = 0;
  let H = 0;
  let raf = 0;
  let last = 0;
  let items = [];

  const spawn = () => {
    items = [];
    for (let i = 0; i < cfg.blobs; i++) {
      const z = Math.random();
      items.push({
        x: Math.random() * W,
        y: rand(0.15, 1) * H,
        r: rand(120, 320) * (mobile ? 0.7 : 1),
        vx: rand(4, 14) * (Math.random() < 0.5 ? -1 : 1),
        vy: rand(-2, 2),
        a: rand(0.035, 0.085),
        z: 0.2 + z * 0.5,
        ph: Math.random() * Math.PI * 2,
      });
    }
    for (let i = 0; i < cfg.motes; i++) {
      const z = Math.random();
      items.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: rand(1, 2.6) * (0.6 + z),
        vx: rand(-5, 5),
        vy: rand(-10, -3) * (0.5 + z),
        a: rand(0.25, 0.6),
        z: 0.4 + z,
        ph: Math.random() * Math.PI * 2,
        mote: true,
      });
    }
  };

  const resize = () => {
    W = window.innerWidth;
    H = window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, mobile ? 1 : 1.5);
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    canvas.style.width = `${W}px`;
    canvas.style.height = `${H}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (!items.length) spawn();
  };

  const frame = (now) => {
    raf = requestAnimationFrame(frame);
    const dt = Math.min(0.05, (now - (last || now)) / 1000);
    last = now;
    par.x += (par.tx - par.x) * Math.min(1, dt * 1.5);
    par.y += (par.ty - par.y) * Math.min(1, dt * 1.5);
    ctx.clearRect(0, 0, W, H);
    if (fx.alpha <= 0.01) return;
    for (const it of items) {
      it.x += it.vx * dt;
      it.y += it.vy * dt;
      const m = it.r + 20;
      if (it.x < -m) it.x = W + m;
      else if (it.x > W + m) it.x = -m;
      if (it.y < -m) it.y = H + m;
      else if (it.y > H + m) it.y = -m;
      const x = it.x + par.x * 40 * it.z;
      const y = it.y + par.y * 24 * it.z;
      const breathe = 0.8 + 0.2 * Math.sin(now * 0.0006 + it.ph);
      ctx.globalAlpha = it.a * breathe * fx.alpha;
      const s = it.mote ? it.r * 4 : it.r * 2;
      ctx.drawImage(sprite, x - s / 2, y - s / 2, s, s);
    }
    ctx.globalAlpha = 1;
  };

  resize();
  window.addEventListener('resize', resize);
  raf = requestAnimationFrame(frame);

  return {
    fx,
    /** nx, ny en [-1, 1] */
    setParallax(nx, ny) {
      par.tx = -nx;
      par.ty = -ny;
    },
    destroy() {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    },
  };
}
