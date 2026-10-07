import { useEffect, useRef } from 'react';
import { useReducedMotion } from 'framer-motion';

/**
 * Partículas ambientales en canvas 2D (inspirado en «Particles» de React Bits).
 * - Se pausa fuera de viewport y con la pestaña oculta.
 * - Densidad adaptada al tamaño de pantalla y a dispositivos modestos.
 * - Con prefers-reduced-motion se dibuja un único frame estático.
 */
export default function Particles({ className, density = 0.00009, color = '139,189,244', maxCount = 140 }) {
  const ref = useRef(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext('2d');
    const lowPower = (navigator.hardwareConcurrency || 8) <= 4;
    const dpr = Math.min(window.devicePixelRatio || 1, lowPower ? 1 : 1.75);
    let w = 0;
    let h = 0;
    let particles = [];
    let raf = 0;
    let running = true;
    let visible = true;
    const pointer = { x: -9999, y: -9999 };

    const seed = () => {
      const count = Math.min(maxCount, Math.round(w * h * density * (lowPower ? 0.5 : 1)));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.3 + 0.3,
        vx: (Math.random() - 0.5) * 0.08,
        vy: -(Math.random() * 0.12 + 0.02),
        a: Math.random() * 0.55 + 0.15,
        tw: Math.random() * Math.PI * 2,
      }));
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
      draw(0);
    };

    const draw = (t) => {
      ctx.clearRect(0, 0, w, h);
      for (const p of particles) {
        const dx = p.x - pointer.x;
        const dy = p.y - pointer.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < 14000) {
          p.x += dx * 0.004;
          p.y += dy * 0.004;
        }
        const alpha = p.a * (0.75 + 0.25 * Math.sin(t * 0.001 + p.tw));
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${color},${alpha})`;
        ctx.fill();
      }
    };

    const step = (t) => {
      if (!running) return;
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.y < -4) {
          p.y = h + 4;
          p.x = Math.random() * w;
        }
        if (p.x < -4) p.x = w + 4;
        if (p.x > w + 4) p.x = -4;
      }
      draw(t);
      raf = requestAnimationFrame(step);
    };

    const start = () => {
      if (reduce || !visible || document.hidden) return;
      cancelAnimationFrame(raf);
      running = true;
      raf = requestAnimationFrame(step);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) start();
      else stop();
    });
    io.observe(canvas);
    const onVis = () => (document.hidden ? stop() : start());
    document.addEventListener('visibilitychange', onVis);
    const onPointer = (e) => {
      const r = canvas.getBoundingClientRect();
      pointer.x = e.clientX - r.left;
      pointer.y = e.clientY - r.top;
    };
    window.addEventListener('pointermove', onPointer, { passive: true });

    resize();
    start();
    return () => {
      stop();
      ro.disconnect();
      io.disconnect();
      document.removeEventListener('visibilitychange', onVis);
      window.removeEventListener('pointermove', onPointer);
    };
  }, [reduce, density, color, maxCount]);

  return <canvas ref={ref} className={className} aria-hidden="true" />;
}
