import { useEffect, useRef } from 'react';

const PLANE_EXTRA = 520; // px que recorre el avión fuera de la pantalla (ver @keyframes hs-flight)
const TAIL = 0.92; // posición de la cola dentro del avión (fracción del ancho)
const TRAIL_Y = 0.46; // altura de la estela dentro del avión (fracción del alto)
const MARGIN = 48; // margen del lienzo alrededor de la palabra
const BUILD_MS = 1100; // tiempo que tarda cada partícula en llegar a su sitio
const HOLD_MS = 4200; // la palabra permanece en el cielo
const FADE_MS = 4200; // y luego se dispersa

const clamp01 = (v) => Math.min(1, Math.max(0, v));
const easeOut = (t) => 1 - (1 - t) ** 3;
const smooth = (t) => t * t * (3 - 2 * t);

/** Punto de humo suave pre-renderizado (drawImage es mucho más barato que gradientes por partícula). */
function makePuff() {
  const c = document.createElement('canvas');
  c.width = c.height = 32;
  const g = c.getContext('2d');
  const grad = g.createRadialGradient(16, 16, 0, 16, 16, 16);
  grad.addColorStop(0, 'rgba(255,255,255,1)');
  grad.addColorStop(0.35, 'rgba(232,246,255,0.75)');
  grad.addColorStop(1, 'rgba(180,225,250,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, 32, 32);
  return c;
}

/**
 * «TUCARGO» construido con el humo del avión (skywriting con partículas).
 * Cada partícula nace en la cola del avión justo cuando pasa por su posición
 * y se expande con el humo hasta formar su parte de la letra. Después la
 * palabra «respira» unos segundos y el viento la dispersa.
 * Sincronizado con el progreso real de la animación CSS del avión.
 */
export default function SkyWriting({ reduce }) {
  const textRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const text = textRef.current;
    const canvas = canvasRef.current;
    const layer = canvas?.parentElement;
    const plane = layer?.querySelector('.hs-plane');
    if (!text || !canvas || !layer || !plane) return undefined;

    const ctx = canvas.getContext('2d');
    const puff = makePuff();
    let raf = 0;
    let visible = true;
    let geo = null;
    let dirty = false;

    // --- Geometría y partículas (solo al iniciar y al redimensionar) ---
    const build = () => {
      const W = layer.clientWidth;
      const pw = plane.offsetWidth;
      const ph = plane.offsetHeight;
      const small = W < 768;
      const tw = text.offsetWidth;
      const th = text.offsetHeight;
      const center = small ? W * 0.5 : W * 0.7;
      const left = Math.max(12, Math.min(W - tw - 12, center - tw / 2));
      const pMid = (W + TAIL * pw - (left + tw / 2)) / (W + PLANE_EXTRA);
      const flightY = 40 - 100 * pMid; // @keyframes hs-flight: de 40px a -60px
      const tilt = -(TAIL - 0.5) * pw * Math.sin((3 * Math.PI) / 180);
      const top = plane.offsetTop + ph * TRAIL_Y + flightY + tilt - th / 2;

      text.style.left = `${left}px`;
      text.style.top = `${top}px`;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const cw = tw + MARGIN * 2;
      const chh = th + MARGIN * 2;
      canvas.width = Math.round(cw * dpr);
      canvas.height = Math.round(chh * dpr);
      canvas.style.width = `${cw}px`;
      canvas.style.height = `${chh}px`;
      // Posicionado con transform: no provoca desplazamientos de layout (CLS)
      canvas.style.transform = `translate3d(${left - MARGIN}px, ${top - MARGIN}px, 0)`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Muestreo de la palabra: cada letra en su posición real (Range por carácter)
      const off = document.createElement('canvas');
      off.width = cw;
      off.height = chh;
      const o = off.getContext('2d', { willReadFrequently: true });
      const cs = getComputedStyle(text);
      o.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
      o.fillStyle = '#fff';
      o.textBaseline = 'alphabetic';
      const node = text.firstChild;
      const box = text.getBoundingClientRect();
      const range = document.createRange();
      const m = o.measureText('TUCARGO');
      const asc = m.fontBoundingBoxAscent ?? parseFloat(cs.fontSize) * 0.9;
      const desc = m.fontBoundingBoxDescent ?? parseFloat(cs.fontSize) * 0.25;
      for (let i = 0; i < node.textContent.length; i++) {
        range.setStart(node, i);
        range.setEnd(node, i + 1);
        const r = range.getBoundingClientRect();
        const baseline = r.top - box.top + MARGIN + (r.height - (asc + desc)) / 2 + asc;
        o.fillText(node.textContent[i], r.left - box.left + MARGIN, baseline);
      }
      const data = o.getImageData(0, 0, cw, chh).data;
      const fontPx = parseFloat(cs.fontSize);
      const step = fontPx < 26 ? 2 : 2.5;
      const cy = MARGIN + th / 2;
      const parts = [];
      for (let yf = 0; yf < chh; yf += step) {
        for (let xf = 0; xf < cw; xf += step) {
          const x = Math.round(xf);
          const y = Math.round(yf);
          if (data[(y * cw + x) * 4 + 3] > 120) {
            const xLayer = left - MARGIN + x;
            parts.push({
              tx: x + (Math.random() - 0.5),
              ty: y + (Math.random() - 0.5),
              // nace en la estela, un poco detrás de la cola
              sx: x + 6 + Math.random() * 16,
              sy: cy + (Math.random() - 0.5) * 6,
              // momento (progreso del vuelo) en que la cola pasa por su x
              p: (W + TAIL * pw - xLayer) / (W + PLANE_EXTRA),
              vx: 0.4 + Math.random() * 1.2,
              vy: -(0.6 + Math.random() * 1.4),
              ph: Math.random() * Math.PI * 2,
              s: step * (1.5 + Math.random() * 1.1),
              puff: Math.random() < 0.18,
            });
          }
        }
      }
      const pStart = Math.min(...parts.map((q) => q.p));
      const pDone = Math.max(...parts.map((q) => q.p));
      geo = { cw, chh, parts, pStart, pDone };
      dirty = true;
      if (reduce) drawStatic();
    };

    const clear = () => {
      if (!geo || !dirty) return;
      ctx.clearRect(0, 0, geo.cw, geo.chh);
      dirty = false;
    };

    const drawStatic = () => {
      ctx.clearRect(0, 0, geo.cw, geo.chh);
      ctx.globalAlpha = 0.85;
      for (const q of geo.parts) ctx.drawImage(puff, q.tx - q.s / 2, q.ty - q.s / 2, q.s, q.s);
      ctx.globalAlpha = 1;
    };

    let anim = null;
    const tick = (now) => {
      if (!visible) return;
      raf = requestAnimationFrame(tick);
      anim = anim || plane.getAnimations?.()[0] || null;
      if (!anim || !geo) return;
      const timing = anim.effect.getComputedTiming();
      const p = timing.progress ?? 0;
      const dur = timing.duration || 20000;
      const msSince = (pj) => (p - pj) * dur;

      const endMs = msSince(geo.pDone) - BUILD_MS - HOLD_MS;
      // Fuera de la ventana activa: nada que dibujar
      if (p < geo.pStart - 0.005 || endMs > FADE_MS) {
        clear();
        return;
      }
      const fade = smooth(clamp01(endMs / FADE_MS));

      ctx.clearRect(0, 0, geo.cw, geo.chh);
      dirty = true;
      for (const q of geo.parts) {
        const a = msSince(q.p);
        if (a < 0) continue;
        const t = clamp01(a / BUILD_MS);
        const e = easeOut(t);
        // turbulencia del humo mientras se forma; leve respiración después
        const turb = (1 - e) * 6;
        const breathe = 0.35 * Math.sin(now * 0.002 + q.ph);
        let x = q.sx + (q.tx - q.sx) * e + Math.sin(a * 0.01 + q.ph) * turb + breathe;
        let y = q.sy + (q.ty - q.sy) * e + Math.cos(a * 0.012 + q.ph) * turb + breathe;
        // dispersión final con el viento
        x += q.vx * fade * 70;
        y += q.vy * fade * 55;
        const alpha = clamp01(a / 260) * (1 - fade) * 0.95;
        if (alpha <= 0.01) continue;
        const size = q.s * (0.55 + 0.45 * e) * (1 + fade * 1.4);
        ctx.globalAlpha = alpha;
        ctx.drawImage(puff, x - size / 2, y - size / 2, size, size);
        // bocanadas de humo que se abren y desaparecen al nacer
        if (q.puff && a < 700) {
          const k = a / 700;
          const ps = q.s * (2 + k * 5);
          ctx.globalAlpha = 0.22 * (1 - k);
          ctx.drawImage(puff, q.sx - ps / 2, q.sy - ps / 2, ps, ps);
        }
      }
      ctx.globalAlpha = 1;
    };

    const ro = new ResizeObserver(() => build());
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      cancelAnimationFrame(raf);
      if (visible && !reduce) raf = requestAnimationFrame(tick);
    });
    const fonts = document.fonts?.ready ?? Promise.resolve();
    fonts.then(() => {
      build();
      ro.observe(layer);
      io.observe(layer);
    });
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
    };
  }, [reduce]);

  return (
    <>
      {/* Texto de referencia (invisible): define tipografía y posición de cada letra */}
      <span ref={textRef} className="hs-skywrite" aria-hidden="true">
        TUCARGO
      </span>
      <canvas ref={canvasRef} className="hs-skywrite__canvas" aria-hidden="true" />
    </>
  );
}
