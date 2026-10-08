import { useEffect, useRef } from 'react';

const PLANE_EXTRA = 520; // px que recorre el avión fuera de la pantalla (ver @keyframes hs-flight)
const TAIL = 0.92; // posición de la cola dentro del avión (fracción del ancho)
const TRAIL_Y = 0.46; // altura de la estela dentro del avión (fracción del alto)

const smooth = (a, b, x) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/**
 * «TUCARGO» escrito con humo en el cielo (skywriting).
 * Lee el tiempo de la animación CSS del avión (sin medir layout en cada cuadro)
 * y revela las letras justo detrás de la cola; luego el humo se dispersa.
 */
export default function SkyWriting({ reduce }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    const layer = el?.parentElement;
    const plane = layer?.querySelector('.hs-plane');
    if (!el || !layer || !plane) return undefined;

    let raf = 0;
    let visible = true;
    let geo = null;

    // Geometría (solo al iniciar y al redimensionar)
    const measure = () => {
      const W = layer.clientWidth;
      const pw = plane.offsetWidth;
      const ph = plane.offsetHeight;
      const small = W < 768;
      const tw = el.offsetWidth;
      const th = el.offsetHeight;
      const center = small ? W * 0.5 : W * 0.7;
      const left = Math.max(12, Math.min(W - tw - 12, center - tw / 2));
      // Momento en que la cola cruza el centro del texto → altura de la estela en ese instante
      const pMid = (W + TAIL * pw - (left + tw / 2)) / (W + PLANE_EXTRA);
      const flightY = 40 - 100 * pMid; // @keyframes hs-flight: de 40px a -60px
      const tilt = -(TAIL - 0.5) * pw * Math.sin((3 * Math.PI) / 180);
      const top = plane.offsetTop + ph * TRAIL_Y + flightY + tilt - th / 2;
      el.style.left = `${left}px`;
      el.style.top = `${top}px`;
      geo = { W, pw, left, tw };
    };

    if (reduce) {
      measure();
      el.style.opacity = '0.85';
      el.style.setProperty('--reveal', '1');
      return undefined;
    }

    let anim = null;
    const tick = () => {
      if (!visible) return;
      anim = anim || plane.getAnimations?.()[0] || null;
      if (anim && geo && anim.effect) {
        // Progreso real del ciclo (incluye el retardo negativo de la animación)
        const p = anim.effect.getComputedTiming().progress ?? 0;
        const tailX = geo.W - (geo.W + PLANE_EXTRA) * p + TAIL * geo.pw;
        // Revelado de derecha a izquierda siguiendo la cola
        const reveal = Math.min(1, Math.max(0, (geo.left + geo.tw - tailX) / geo.tw));
        // Tras escribirse, permanece y luego se dispersa
        const pDone = (geo.W + TAIL * geo.pw - geo.left) / (geo.W + PLANE_EXTRA);
        // ~4 s visible y ~4 s disipándose, en cualquier dispositivo
        const dur = anim.effect.getComputedTiming().duration || 20000;
        const hold = 4000 / dur;
        const fade = smooth(pDone + hold, pDone + hold * 2, p);
        el.style.setProperty('--reveal', reveal.toFixed(3));
        el.style.setProperty('--fade', fade.toFixed(3));
        el.style.opacity = reveal > 0 ? String(1 - fade) : '0';
      }
      raf = requestAnimationFrame(tick);
    };

    const ro = new ResizeObserver(measure);
    ro.observe(layer);
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      cancelAnimationFrame(raf);
      if (visible) raf = requestAnimationFrame(tick);
    });
    io.observe(layer);
    const fonts = document.fonts?.ready ?? Promise.resolve();
    fonts.then(() => {
      measure();
      raf = requestAnimationFrame(tick);
    });
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
    };
  }, [reduce]);

  return (
    <div ref={ref} className="hs-skywrite" aria-hidden="true">
      <svg className="hs-skywrite__defs" width="0" height="0" focusable="false">
        <filter id="hsSmoke" x="-10%" y="-40%" width="120%" height="180%">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="7" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="5" xChannelSelector="R" yChannelSelector="G" result="d" />
          <feGaussianBlur in="d" stdDeviation="0.6" />
        </filter>
      </svg>
      <span className="hs-skywrite__text">TUCARGO</span>
    </div>
  );
}
