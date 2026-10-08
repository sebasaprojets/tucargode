import { INTRO } from './introConfig';

/**
 * Motor de partículas de la intro (canvas 2D, sin dependencias).
 * - Polvo flotando en cámara lenta, iluminado por un haz de luz volumétrico.
 * - Profundidad (z): cada partícula se mueve con el parallax según su distancia.
 * - Repulsión: se apartan del cursor y vuelven despacio a su sitio.
 * - Explosiones: salen del logo y caen en cámara lenta.
 * - `fx` lo anima GSAP desde la línea de tiempo: haz (beam), escala de tiempo
 *   (bullet time) y estelas de movimiento (trails).
 */
const rand = (a, b) => a + Math.random() * (b - a);

function hexToRgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/** Punto de luz pre-renderizado: drawImage es mucho más barato que un gradiente por partícula. */
function makeSprite(hex) {
  const c = document.createElement('canvas');
  c.width = c.height = 32;
  const g = c.getContext('2d');
  const [r, gg, b] = hexToRgb(hex);
  const grad = g.createRadialGradient(16, 16, 0, 16, 16, 16);
  grad.addColorStop(0, 'rgba(255,255,255,1)');
  grad.addColorStop(0.22, `rgba(${r},${gg},${b},0.9)`);
  grad.addColorStop(1, `rgba(${r},${gg},${b},0)`);
  g.fillStyle = grad;
  g.fillRect(0, 0, 32, 32);
  return c;
}

export function createIntroEngine(canvas, { mobile = false } = {}) {
  const ctx = canvas.getContext('2d');
  const P = INTRO.particles;
  const C = INTRO.colors;
  const fx = { beam: 0, timeScale: 1, trails: 0 };
  const sprites = { dust: makeSprite(C.dust), sea: makeSprite(C.sea), spark: makeSprite(C.spark) };
  const pointer = { x: -9999, y: -9999, on: false };
  const par = { x: 0, y: 0 };
  const parTarget = { x: 0, y: 0 };
  const origin = { x: 0, y: 0 };
  const dust = [];
  const bursts = [];
  let W = 0;
  let H = 0;
  let dpr = 1;
  let beam = null;
  let raf = 0;
  let last = 0;
  let alive = true;

  // ---- Haz de luz volumétrico (se pre-renderiza a media resolución) ----
  const renderBeam = () => {
    const s = 0.5;
    const c = document.createElement('canvas');
    c.width = Math.max(1, Math.round(W * s));
    c.height = Math.max(1, Math.round(H * s));
    const g = c.getContext('2d');
    const [r, gg, b] = hexToRgb(C.light);
    g.scale(s, s);
    g.filter = 'blur(28px)';
    const cx = W * 0.5;
    const top = Math.min(90, W * 0.06);
    const bottom = Math.max(W * 0.34, 260);
    const grad = g.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, `rgba(${r},${gg},${b},0.55)`);
    grad.addColorStop(0.45, `rgba(${r},${gg},${b},0.16)`);
    grad.addColorStop(1, `rgba(${r},${gg},${b},0)`);
    g.fillStyle = grad;
    g.beginPath();
    g.moveTo(cx - top, -40);
    g.lineTo(cx + top, -40);
    g.lineTo(cx + bottom, H);
    g.lineTo(cx - bottom, H);
    g.closePath();
    g.fill();
    // núcleo más intenso y foco en el origen
    g.filter = 'blur(14px)';
    g.fillStyle = `rgba(${r},${gg},${b},0.22)`;
    g.beginPath();
    g.moveTo(cx - top * 0.35, -40);
    g.lineTo(cx + top * 0.35, -40);
    g.lineTo(cx + bottom * 0.35, H * 0.9);
    g.lineTo(cx - bottom * 0.35, H * 0.9);
    g.closePath();
    g.fill();
    g.filter = 'none';
    const spot = g.createRadialGradient(cx, 0, 0, cx, 0, 220);
    spot.addColorStop(0, 'rgba(255,255,255,0.5)');
    spot.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = spot;
    g.fillRect(cx - 220, -220, 440, 440);
    beam = { c, top, bottom, cx };
  };

  // Intensidad del haz en un punto (para iluminar el polvo que lo atraviesa)
  const beamAt = (x, y) => {
    if (!beam) return 0;
    const half = beam.top + (beam.bottom - beam.top) * Math.max(0, y / H);
    const d = Math.abs(x - beam.cx) / half;
    if (d >= 1) return 0;
    return (1 - d) ** 1.4 * (1 - 0.55 * (y / H));
  };

  const spawnDust = (n) => {
    for (let i = 0; i < n; i++) {
      const z = Math.random() ** 1.6; // más partículas lejanas que cercanas
      dust.push({
        ax: Math.random() * W,
        ay: Math.random() * H,
        ox: 0,
        oy: 0,
        vx: rand(-7, 7) * (0.4 + z),
        vy: rand(-9, 3) * (0.4 + z),
        z,
        s: rand(1.2, 3.2) * (0.55 + z * 1.5),
        ph: Math.random() * Math.PI * 2,
        sprite: Math.random() < 0.18 ? sprites.sea : sprites.dust,
      });
    }
  };

  const resize = () => {
    const nw = window.innerWidth;
    const nh = window.innerHeight;
    if (W && H) {
      for (const d of dust) {
        d.ax *= nw / W;
        d.ay *= nh / H;
      }
    }
    W = nw;
    H = nh;
    dpr = Math.min(window.devicePixelRatio || 1, mobile ? 1 : 1.5);
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    canvas.style.width = `${W}px`;
    canvas.style.height = `${H}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    renderBeam();
  };

  const frame = (now) => {
    if (!alive) return;
    raf = requestAnimationFrame(frame);
    const real = Math.min(0.05, (now - (last || now)) / 1000);
    last = now;
    const dt = real * fx.timeScale;

    // parallax suavizado
    par.x += (parTarget.x - par.x) * Math.min(1, real * 4);
    par.y += (parTarget.y - par.y) * Math.min(1, real * 4);
    const PX = P.parallax;

    // Estelas (motion blur del bullet time) o borrado normal. Con estelas, lo que se
    // dibuja se acumula: `gain` compensa para que el brillo medio no cambie.
    let gain = 1;
    if (fx.trails > 0.01) {
      const fade = 1 - fx.trails * 0.82;
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = `rgba(0,0,0,${fade})`;
      ctx.fillRect(0, 0, W, H);
      gain = fade;
    } else {
      ctx.clearRect(0, 0, W, H);
    }
    const pGain = Math.min(1, gain * 1.8);
    ctx.globalCompositeOperation = 'lighter';

    if (fx.beam > 0.01 && beam) {
      ctx.globalAlpha = fx.beam * gain * (0.9 + 0.1 * Math.sin(now * 0.0021) * Math.sin(now * 0.0013));
      ctx.drawImage(beam.c, 0, 0, W, H);
    }

    // ---- Polvo ----
    const R = P.repelRadius;
    const k = 1 - Math.exp(-dt * 1.6); // regreso lento a su sitio
    for (const d of dust) {
      d.ax += d.vx * dt;
      d.ay += d.vy * dt;
      if (d.ax < -20) d.ax = W + 20;
      else if (d.ax > W + 20) d.ax = -20;
      if (d.ay < -20) d.ay = H + 20;
      else if (d.ay > H + 20) d.ay = -20;
      let x = d.ax + d.ox + par.x * PX * (0.3 + d.z);
      let y = d.ay + d.oy + par.y * PX * (0.3 + d.z);
      if (pointer.on) {
        const dx = x - pointer.x;
        const dy = y - pointer.y;
        const dist = Math.hypot(dx, dy);
        if (dist < R && dist > 0.1) {
          const f = (1 - dist / R) ** 2 * P.repelForce * 520 * real * (0.5 + d.z);
          d.ox += (dx / dist) * f;
          d.oy += (dy / dist) * f;
        }
      }
      d.ox -= d.ox * k;
      d.oy -= d.oy * k;
      x = d.ax + d.ox + par.x * PX * (0.3 + d.z);
      y = d.ay + d.oy + par.y * PX * (0.3 + d.z);
      const lit = beamAt(x, y) * fx.beam;
      const tw = 0.75 + 0.25 * Math.sin(now * 0.0012 + d.ph);
      const a = (0.1 + 0.28 * d.z + lit * 0.95) * tw;
      if (a < 0.02) continue;
      const size = d.s * (1 + lit * 0.8);
      ctx.globalAlpha = Math.min(1, a) * pGain;
      ctx.drawImage(d.sprite, x - size, y - size, size * 2, size * 2);
    }

    // ---- Explosiones (cámara lenta) ----
    const bdt = dt * P.burstSlowMo;
    for (let i = bursts.length - 1; i >= 0; i--) {
      const b = bursts[i];
      b.age += bdt;
      if (b.age >= b.life) {
        bursts.splice(i, 1);
        continue;
      }
      const drag = Math.exp(-bdt * 1.1);
      b.vx *= drag;
      b.vy = b.vy * drag + P.gravity * bdt * (0.6 + b.z);
      b.x += b.vx * bdt;
      b.y += b.vy * bdt;
      const t = b.age / b.life;
      const a = (t < 0.05 ? t / 0.05 : 1) * (1 - t) ** 1.3;
      const x = b.x + par.x * PX * (0.3 + b.z);
      const y = b.y + par.y * PX * (0.3 + b.z);
      const size = b.s * (1 - t * 0.4);
      ctx.globalAlpha = a * pGain;
      ctx.drawImage(b.sprite, x - size, y - size, size * 2, size * 2);
    }

    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
  };

  resize();
  spawnDust(mobile ? P.dust.mobile : P.dust.desktop);
  window.addEventListener('resize', resize);
  raf = requestAnimationFrame(frame);

  return {
    fx,
    setPointer(x, y) {
      pointer.x = x;
      pointer.y = y;
      pointer.on = true;
    },
    clearPointer() {
      pointer.on = false;
    },
    /** nx, ny en [-1, 1] (ratón o giroscopio) */
    setParallax(nx, ny) {
      parTarget.x = -nx;
      parTarget.y = -ny;
    },
    setOrigin(x, y) {
      origin.x = x;
      origin.y = y;
    },
    /** Explosión desde (x, y); por defecto desde el centro del logo. */
    burst(count, { x = origin.x, y = origin.y, power = 1, radius = 40 } = {}) {
      const room = Math.max(0, P.max - dust.length - bursts.length);
      const n = Math.min(count, room);
      for (let i = 0; i < n; i++) {
        const ang = Math.random() * Math.PI * 2;
        const sp = power * (90 + Math.random() ** 0.6 * 520);
        const r0 = Math.random() * radius;
        const z = Math.random();
        const roll = Math.random();
        bursts.push({
          x: x + Math.cos(ang) * r0,
          y: y + Math.sin(ang) * r0,
          vx: Math.cos(ang) * sp,
          vy: Math.sin(ang) * sp - 60 * power,
          z,
          s: rand(1.4, 3.6) * (0.6 + z),
          age: 0,
          life: rand(2.6, 4.6),
          sprite: roll < 0.08 ? sprites.spark : roll < 0.45 ? sprites.sea : sprites.dust,
        });
      }
    },
    destroy() {
      alive = false;
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    },
  };
}
