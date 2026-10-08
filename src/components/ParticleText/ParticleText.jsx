import { useEffect, useRef } from 'react';
import { useMotionValueEvent } from 'framer-motion';
import './ParticleText.css';
import { useReduceMotion } from '../../hooks/useMotionPreference';

/**
 * Texto que se convierte en partículas (patrón de React Bits).
 *
 * Lee la posición real de cada palabra del elemento `targetRef` (o del bloque
 * entero), la redibuja en un canvas con la misma tipografía y la muestrea en
 * partículas. `progress` (MotionValue 0→1) controla la dispersión:
 *   0 = texto entero (se ve el texto HTML real, nítido y accesible)
 *   1 = partículas dispersas por el «viento» y desvanecidas.
 * Solo dibuja cuando cambia el progreso: no hay bucle continuo.
 *
 * mode="dissolve": el texto se deshace al avanzar (hero).
 * mode="assemble": las partículas se juntan al entrar (usar progress invertido).
 */
export default function ParticleText({ targetRef, progress, wind = [1, -0.6], gap, colors, threshold = 0.02, pad = 260 }) {
  const canvasRef = useRef(null);
  const state = useRef({ particles: null, w: 0, h: 0, dpr: 1, last: -1 });
  const reduce = useReduceMotion();

  // Construye las partículas a partir del texto real (tras cargar las fuentes)
  useEffect(() => {
    if (reduce) return undefined;
    const canvas = canvasRef.current;
    const target = targetRef.current;
    if (!canvas || !target) return undefined;
    let cancelled = false;

    const build = () => {
      if (cancelled) return;
      const box = canvas.parentElement.getBoundingClientRect();
      // El lienzo se extiende `pad` px alrededor del bloque para que las partículas vuelen sin cortarse
      const host = { left: box.left - pad, top: box.top - pad, width: box.width + pad * 2, height: box.height + pad * 2 };
      canvas.style.left = `${-pad}px`;
      canvas.style.top = `${-pad}px`;
      const small = window.innerWidth < 768;
      const step = gap ?? (small ? 4 : 3);
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.ceil(host.width);
      const h = Math.ceil(host.height);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;

      // Lienzo de muestreo a resolución 1x
      const off = document.createElement('canvas');
      off.width = w;
      off.height = h;
      const o = off.getContext('2d', { willReadFrequently: true });

      // Palabras: cualquier nodo de texto hoja dentro del objetivo
      const walker = document.createTreeWalker(target, NodeFilter.SHOW_TEXT);
      const range = document.createRange();
      let node;
      while ((node = walker.nextNode())) {
        const text = node.textContent;
        if (!text.trim()) continue;
        const el = node.parentElement;
        if (el.closest('.visually-hidden')) continue;
        const cs = getComputedStyle(el);
        const fontSize = parseFloat(cs.fontSize);
        o.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
        o.textBaseline = 'alphabetic';
        const lineEl = el.closest('.split-line') || el;
        const color = colors?.(lineEl, el) ?? cs.color;
        // Dibuja palabra por palabra en su posición real
        const parts = text.split(/(\s+)/);
        let offset = 0;
        for (const part of parts) {
          if (part.trim()) {
            range.setStart(node, offset);
            range.setEnd(node, offset + part.length);
            const r = range.getBoundingClientRect();
            if (r.width < 2) {
              offset += part.length;
              continue;
            }
            const metrics = o.measureText(part);
            const asc = metrics.fontBoundingBoxAscent ?? fontSize * 0.9;
            const desc = metrics.fontBoundingBoxDescent ?? fontSize * 0.25;
            const baseline = r.top - host.top + (r.height - (asc + desc)) / 2 + asc;
            o.fillStyle = color;
            o.fillText(part, r.left - host.left, baseline);
          }
          offset += part.length;
        }
      }

      const data = o.getImageData(0, 0, w, h).data;
      const parts = [];
      for (let y = 0; y < h; y += step) {
        for (let x = 0; x < w; x += step) {
          const i = (y * w + x) * 4;
          if (data[i + 3] > 128) {
            const seed = Math.random();
            parts.push({
              x,
              y,
              c: `rgb(${data[i]},${data[i + 1]},${data[i + 2]})`,
              // dirección: viento + dispersión aleatoria; retardo por posición (efecto barrido)
              dx: (wind[0] + (Math.random() - 0.5) * 1.6) * (120 + seed * 260),
              dy: (wind[1] + (Math.random() - 0.5) * 1.6) * (120 + seed * 260),
              delay: (x / w) * 0.35 + Math.random() * 0.15,
              s: step * (0.55 + Math.random() * 0.5),
            });
          }
        }
      }
      // Agrupa por color para minimizar cambios de fillStyle
      parts.sort((a, b) => (a.c < b.c ? -1 : 1));
      state.current = { particles: parts, w, h, dpr, last: -1 };
      draw(progress.get());
    };

    const fontsReady = document.fonts?.ready ?? Promise.resolve();
    // Espera a que la animación de entrada del texto termine antes de medir
    const t = setTimeout(() => fontsReady.then(build), 1600);
    const ro = new ResizeObserver(() => {
      clearTimeout(rt);
      rt = setTimeout(build, 200);
    });
    let rt = 0;
    ro.observe(target);
    return () => {
      cancelled = true;
      clearTimeout(t);
      clearTimeout(rt);
      ro.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduce, targetRef]);

  const draw = (p) => {
    const canvas = canvasRef.current;
    const st = state.current;
    if (!canvas || !st.particles) return;
    const q = Math.round(p * 400) / 400;
    if (q === st.last) return;
    st.last = q;
    const ctx = canvas.getContext('2d');
    ctx.setTransform(st.dpr, 0, 0, st.dpr, 0, 0);
    ctx.clearRect(0, 0, st.w, st.h);
    // Texto HTML visible mientras no hay dispersión; el canvas toma el relevo
    const active = q > threshold;
    canvas.style.opacity = active ? '1' : '0';
    if (targetRef.current) targetRef.current.style.opacity = active ? '0' : '';
    if (!active) return;
    let color = '';
    for (const pt of st.particles) {
      const local = Math.min(1, Math.max(0, (q - pt.delay * 0.6) / (1 - pt.delay * 0.6)));
      if (local >= 1) continue;
      const e = local * local * (3 - 2 * local); // suavizado
      const alpha = 1 - e;
      if (alpha <= 0.02) continue;
      if (pt.c !== color) {
        color = pt.c;
        ctx.fillStyle = color;
      }
      ctx.globalAlpha = alpha;
      const size = pt.s * (1 - e * 0.5);
      ctx.fillRect(pt.x + pt.dx * e, pt.y + pt.dy * e, size, size);
    }
    ctx.globalAlpha = 1;
  };

  useMotionValueEvent(progress, 'change', (v) => {
    if (!reduce) requestAnimationFrame(() => draw(v));
  });

  if (reduce) return null;
  return <canvas ref={canvasRef} className="ptext" aria-hidden="true" />;
}
