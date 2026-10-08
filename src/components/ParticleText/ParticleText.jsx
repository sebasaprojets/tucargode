import { useEffect, useRef } from 'react';
import { useMotionValueEvent } from 'framer-motion';
import { useReduceMotion } from '../../hooks/useMotionPreference';
import './ParticleText.css';

// Reparto del progreso: el frente recorre las letras en SWEEP; cada letra tarda DURATION en deshacerse
const SWEEP = 0.6;
const DURATION = 0.32;
const LETTER_FADE = 0.3; // fracción de DURATION en la que la letra HTML se apaga
const JITTER = 0.05; // retraso aleatorio de cada partícula dentro de su letra

const clamp01 = (v) => Math.min(1, Math.max(0, v));
const smooth = (t) => t * t * (3 - 2 * t);

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
 * Las letras se van apagando de derecha a izquierda y cada una estalla en sus
 * propias partículas; con el progreso invertido se forman de izquierda a derecha.
 * Solo dibuja cuando cambia el progreso y solo las letras en transición.
 */
export default function ParticleText({ targetRef, progress, wind = [1, -0.6], gap, colors, threshold = 0.01, pad = 260 }) {
  const canvasRef = useRef(null);
  const state = useRef({ letters: null, w: 0, h: 0, last: -1, drawn: false });
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
      canvas.style.left = `${-pad}px`;
      canvas.style.top = `${-pad}px`;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      const ctx = canvas.getContext('2d');
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const step = gap ?? (window.innerWidth < 768 ? 3 : 2.5);
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
                dx: (wind[0] + (Math.random() - 0.5) * 1.4) * (90 + seed * 220),
                dy: (wind[1] + (Math.random() - 0.5) * 1.4) * (90 + seed * 220),
                j: Math.random() * JITTER,
                s: step * (0.6 + Math.random() * 0.5),
              });
            }
          }
        }
        letters.push({ el, x: lx + r.width / 2, color, parts, opacity: -1 });
      }
      // Orden del barrido: de derecha a izquierda (las dos líneas a la vez)
      let minX = Infinity;
      let maxX = -Infinity;
      for (const l of letters) {
        minX = Math.min(minX, l.x);
        maxX = Math.max(maxX, l.x);
      }
      const span = Math.max(1, maxX - minX);
      for (const l of letters) l.delay = (1 - (l.x - minX) / span) * SWEEP + Math.random() * 0.02;

      // Restaura las letras del montaje anterior (por si cambió el tamaño)
      for (const l of state.current.letters ?? []) l.el.style.opacity = '';
      state.current = { letters, w, h, ctx, last: -1, drawn: false };
      draw(progress.get());
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
      for (const l of state.current.letters ?? []) l.el.style.opacity = '';
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduce, targetRef]);

  const draw = (p) => {
    const st = state.current;
    if (!st.letters) return;
    const q = p <= threshold ? 0 : Math.round(p * 500) / 500;
    if (q === st.last) return;
    st.last = q;
    const { ctx } = st;
    if (st.drawn) {
      ctx.clearRect(0, 0, st.w, st.h);
      st.drawn = false;
    }
    for (const l of st.letters) {
      const t = (q - l.delay) / DURATION;
      // La letra HTML se apaga justo cuando empieza a convertirse en partículas
      const op = q === 0 ? 1 : 1 - smooth(clamp01(t / LETTER_FADE));
      if (op !== l.opacity) {
        l.opacity = op;
        l.el.style.opacity = op === 1 ? '' : op.toFixed(3);
      }
      if (q === 0 || t <= 0 || t >= 1 + JITTER / DURATION) continue;
      ctx.fillStyle = l.color;
      for (const pt of l.parts) {
        const k = clamp01(t - pt.j / DURATION);
        if (k <= 0 || k >= 1) continue;
        const e = smooth(k);
        // Las partículas aparecen a medida que la letra se apaga y se van con el viento
        const alpha = Math.min(1, k / LETTER_FADE) * (1 - e);
        if (alpha <= 0.02) continue;
        ctx.globalAlpha = alpha;
        const size = pt.s * (1 - e * 0.45);
        ctx.fillRect(pt.x + pt.dx * e, pt.y + pt.dy * e, size, size);
        st.drawn = true;
      }
    }
    ctx.globalAlpha = 1;
  };

  useMotionValueEvent(progress, 'change', (v) => {
    // Se dibuja en el mismo cuadro en que cambia el scroll (sin desfase)
    if (!reduce) draw(v);
  });

  if (reduce) return null;
  return <canvas ref={canvasRef} className="ptext" aria-hidden="true" />;
}
