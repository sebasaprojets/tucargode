import { useEffect, useRef } from 'react';
import { useMotionValueEvent } from 'framer-motion';
import { useReduceMotion } from '../../hooks/useMotionPreference';
import './ParticleText.css';

// El scroll decide QUÉ letras están deshechas; la animación de cada letra corre en el
// tiempo (no depende de la velocidad de la rueda), así siempre es fluida.
const SWEEP = 0.9; // tramo del progreso que recorre el frente de letras
const OUT_MS = 1500; // una letra se deshace en partículas
const IN_MS = 1100; // una letra se vuelve a formar
const LETTER_FADE = 0.22; // fracción inicial en la que la letra HTML se apaga
const JITTER = 0.18; // desfase de cada partícula dentro de su letra

const clamp01 = (v) => Math.min(1, Math.max(0, v));
const smooth = (t) => t * t * (3 - 2 * t);
const easeOut = (t) => 1 - (1 - t) ** 3;

/** Texto partido en letras (`.ch`) para que ParticleText pueda deshacerlas una a una. */
export function Chars({ text }) {
  return [...text].map((c, i) => (
    <span key={i} className="ch">
      {c}
    </span>
  ));
}

/**
 * Letras que se deshacen (o se forman) en partículas, una a una (patrón de React Bits).
 *
 * Busca las letras `.ch` dentro de `targetRef`, dibuja cada una en un canvas con
 * su tipografía y posición reales y la muestrea en partículas. `progress`
 * (MotionValue 0→1) controla el efecto:
 *   0 = texto HTML entero (nítido y accesible)
 *   1 = todas las letras convertidas en partículas y dispersas por el «viento».
 * Al pasar el frente, cada letra se apaga y sus partículas se dispersan con una
 * animación propia en el tiempo (fluida aunque el scroll se detenga); al volver,
 * las partículas regresan y la letra se forma de nuevo. Solo hay bucle de dibujo
 * mientras alguna letra está en transición.
 */
export default function ParticleText({ targetRef, progress, wind = [1, -0.6], gap, colors, pad = 260 }) {
  const canvasRef = useRef(null);
  const state = useRef({ letters: null, raf: 0 });
  const reduce = useReduceMotion();

  useEffect(() => {
    if (reduce) return undefined;
    const canvas = canvasRef.current;
    const target = targetRef.current;
    if (!canvas || !target) return undefined;
    let cancelled = false;

    const build = () => {
      if (cancelled) return;
      const els = [...target.querySelectorAll('.ch')].filter((el) => el.textContent.trim());
      if (!els.length) return;
      const box = canvas.parentElement.getBoundingClientRect();
      // El lienzo se extiende `pad` px alrededor del bloque para que las partículas vuelen sin cortarse
      const hostLeft = box.left - pad;
      const hostTop = box.top - pad;
      const w = Math.ceil(box.width + pad * 2);
      const h = Math.ceil(box.height + pad * 2);
      // Desplazado con transform (no cuenta como cambio de layout / CLS)
      canvas.style.transform = `translate3d(${-pad}px, ${-pad}px, 0)`;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      const ctx = canvas.getContext('2d');
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const step = gap ?? 3;
      const off = document.createElement('canvas');
      off.width = w;
      off.height = h;
      const o = off.getContext('2d', { willReadFrequently: true });
      o.textBaseline = 'alphabetic';

      // Cada letra: se dibuja sola, se muestrea su recuadro y se borra
      const letters = [];
      for (const el of els) {
        const r = el.getBoundingClientRect();
        if (r.width < 1) continue;
        const cs = getComputedStyle(el);
        const fontSize = parseFloat(cs.fontSize);
        o.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
        const metrics = o.measureText(el.textContent);
        const asc = metrics.fontBoundingBoxAscent ?? fontSize * 0.9;
        const desc = metrics.fontBoundingBoxDescent ?? fontSize * 0.25;
        const lx = r.left - hostLeft;
        const baseline = r.top - hostTop + (r.height - (asc + desc)) / 2 + asc;
        const color = colors?.(el.closest('.split-line') || el, el) ?? cs.color;
        o.fillStyle = '#fff';
        o.fillText(el.textContent, lx, baseline);
        const bx = Math.max(0, Math.floor(lx - fontSize * 0.3));
        const by = Math.max(0, Math.floor(baseline - asc - 2));
        const bw = Math.min(w - bx, Math.ceil(r.width + fontSize * 0.6));
        const bh = Math.min(h - by, Math.ceil(asc + desc + 4));
        if (bw <= 0 || bh <= 0) continue;
        const data = o.getImageData(bx, by, bw, bh).data;
        o.clearRect(bx, by, bw, bh);
        const parts = [];
        for (let y = 0; y < bh; y += step) {
          for (let x = 0; x < bw; x += step) {
            if (data[(Math.floor(y) * bw + Math.floor(x)) * 4 + 3] > 128) {
              const seed = Math.random();
              parts.push({
                x: bx + x,
                y: by + y,
                dx: (wind[0] + (Math.random() - 0.5) * 1.4) * (70 + seed * 170),
                dy: (wind[1] + (Math.random() - 0.5) * 1.4) * (70 + seed * 170),
                j: Math.random() * JITTER,
                ph: Math.random() * Math.PI * 2,
                s: step * (0.6 + Math.random() * 0.5),
              });
            }
          }
        }
        letters.push({ el, x: lx + r.width / 2, color, parts, a: 0, target: 0, opacity: -1 });
      }
      // Orden del barrido: de derecha a izquierda (las dos líneas a la vez)
      let minX = Infinity;
      let maxX = -Infinity;
      for (const l of letters) {
        minX = Math.min(minX, l.x);
        maxX = Math.max(maxX, l.x);
      }
      const span = Math.max(1, maxX - minX);
      for (const l of letters) l.delay = 0.02 + (1 - (l.x - minX) / span) * SWEEP + Math.random() * 0.025;

      // Restaura las letras del montaje anterior (por si cambió el tamaño)
      for (const l of state.current.letters ?? []) l.el.style.opacity = '';
      cancelAnimationFrame(state.current.raf);
      state.current = { letters, w, h, ctx, drawn: false, raf: 0, prev: 0 };
      // Estado inicial sin animación (p. ej. si se recarga a media página)
      setTargets(progress.get(), true);
    };

    const fontsReady = document.fonts?.ready ?? Promise.resolve();
    // Espera a que la animación de entrada del texto termine antes de medir
    const t = setTimeout(() => fontsReady.then(build), 1600);
    let rt = 0;
    const ro = new ResizeObserver(() => {
      clearTimeout(rt);
      rt = setTimeout(build, 200);
    });
    ro.observe(target);
    return () => {
      cancelled = true;
      clearTimeout(t);
      clearTimeout(rt);
      ro.disconnect();
      cancelAnimationFrame(state.current.raf);
      for (const l of state.current.letters ?? []) l.el.style.opacity = '';
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduce, targetRef]);

  // El scroll fija el objetivo de cada letra: 0 = letra entera, 1 = deshecha
  const setTargets = (p, instant = false) => {
    const st = state.current;
    if (!st.letters) return;
    let changed = instant;
    for (const l of st.letters) {
      const target = p > l.delay ? 1 : 0;
      if (target !== l.target) {
        l.target = target;
        changed = true;
      }
      if (instant) l.a = target;
    }
    if (instant) render();
    if (changed && !st.raf) {
      st.prev = performance.now();
      st.raf = requestAnimationFrame(tick);
    }
  };

  // Bucle por tiempo: solo corre mientras alguna letra está en transición
  const tick = (now) => {
    const st = state.current;
    const dt = Math.min(64, now - st.prev);
    st.prev = now;
    let moving = false;
    for (const l of st.letters) {
      if (l.a === l.target) continue;
      l.a = l.target > l.a ? Math.min(1, l.a + dt / OUT_MS) : Math.max(0, l.a - dt / IN_MS);
      if (l.a !== l.target) moving = true;
    }
    render(now);
    st.raf = moving ? requestAnimationFrame(tick) : 0;
  };

  const render = (now = 0) => {
    const st = state.current;
    const { ctx } = st;
    if (st.drawn) {
      ctx.clearRect(0, 0, st.w, st.h);
      st.drawn = false;
    }
    for (const l of st.letters) {
      // La letra HTML se apaga mientras sus partículas se sueltan
      const op = 1 - smooth(clamp01(l.a / LETTER_FADE));
      if (op !== l.opacity) {
        l.opacity = op;
        l.el.style.opacity = op === 1 ? '' : op.toFixed(3);
      }
      if (l.a <= 0 || l.a >= 1) continue;
      ctx.fillStyle = l.color;
      for (const pt of l.parts) {
        const k = clamp01((l.a - pt.j) / (1 - JITTER));
        if (k <= 0 || k >= 1) continue;
        const e = easeOut(k);
        // aparece con la letra, deriva con el viento y se desvanece poco a poco
        const alpha = Math.min(1, k / 0.08) * (1 - k) ** 1.6;
        if (alpha <= 0.02) continue;
        const sway = Math.sin(k * 5 + pt.ph + now * 0.0015) * 5 * k;
        ctx.globalAlpha = alpha;
        const size = pt.s * (1 - k * 0.5);
        ctx.fillRect(pt.x + pt.dx * e + sway, pt.y + pt.dy * e + sway * 0.6, size, size);
        st.drawn = true;
      }
    }
    ctx.globalAlpha = 1;
  };

  useMotionValueEvent(progress, 'change', (v) => {
    if (!reduce) setTargets(v);
  });

  if (reduce) return null;
  return <canvas ref={canvasRef} className="ptext" aria-hidden="true" />;
}
