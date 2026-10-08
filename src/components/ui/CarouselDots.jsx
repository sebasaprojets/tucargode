import { useEffect, useState } from 'react';
import './CarouselDots.css';

/**
 * Indicador de puntos para listas que en móvil se convierten en carrusel
 * deslizable (scroll-snap en CSS). `scrollerRef` apunta al contenedor que se
 * desplaza en horizontal; en pantallas grandes, sin desplazamiento, los
 * puntos se ocultan solos.
 */
export default function CarouselDots({ scrollerRef, label = 'Ir al elemento' }) {
  const [state, setState] = useState({ count: 0, active: 0 });

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return undefined;
    let raf = 0;
    const measure = () => {
      raf = 0;
      const items = [...el.children].filter((c) => c.offsetWidth > 0); // ignora elementos ocultos
      const scrollable = el.scrollWidth > el.clientWidth + 4;
      if (!scrollable || !items.length) {
        setState((s) => (s.count === 0 ? s : { count: 0, active: 0 }));
        return;
      }
      // el elemento más centrado es el activo
      const center = el.scrollLeft + el.clientWidth / 2;
      let active = 0;
      let best = Infinity;
      items.forEach((it, i) => {
        const d = Math.abs(it.offsetLeft + it.offsetWidth / 2 - center);
        if (d < best) {
          best = d;
          active = i;
        }
      });
      setState((s) => (s.count === items.length && s.active === active ? s : { count: items.length, active }));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(measure);
    };
    measure();
    el.addEventListener('scroll', onScroll, { passive: true });
    const ro = new ResizeObserver(onScroll);
    ro.observe(el);
    return () => {
      el.removeEventListener('scroll', onScroll);
      ro.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [scrollerRef]);

  if (state.count < 2) return null;

  const go = (i) => {
    const el = scrollerRef.current;
    const it = [...(el?.children ?? [])].filter((c) => c.offsetWidth > 0)[i];
    if (!it) return;
    el.scrollTo({ left: it.offsetLeft - (el.clientWidth - it.offsetWidth) / 2, behavior: 'smooth' });
  };

  return (
    <div className="cdots" role="group" aria-label="Navegación del carrusel">
      {Array.from({ length: state.count }, (_, i) => (
        <button
          key={i}
          type="button"
          className={`cdots__dot ${i === state.active ? 'is-active' : ''}`}
          aria-label={`${label} ${i + 1}`}
          aria-current={i === state.active ? 'true' : undefined}
          onClick={() => go(i)}
        />
      ))}
    </div>
  );
}
