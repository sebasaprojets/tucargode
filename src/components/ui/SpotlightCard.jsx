import { useRef } from 'react';
import './SpotlightCard.css';

/**
 * Tarjeta con luz que sigue al cursor (patrón «Spotlight Card» de React Bits).
 * Solo actualiza variables CSS: sin re-render en cada movimiento.
 * tilt: grados máximos de inclinación 3D (0 = sin inclinación).
 */
export default function SpotlightCard({ as: Tag = 'div', className = '', tilt = 0, children, ...rest }) {
  const ref = useRef(null);
  const onMove = (e) => {
    const el = ref.current;
    if (!el || e.pointerType !== 'mouse') return;
    const r = el.getBoundingClientRect();
    const px = e.clientX - r.left;
    const py = e.clientY - r.top;
    el.style.setProperty('--mx', `${px}px`);
    el.style.setProperty('--my', `${py}px`);
    // posición relativa (0–100 %) para reflejos tipo «Glare Hover»
    el.style.setProperty('--gx', `${(px / r.width) * 100}%`);
    if (tilt) {
      // Inclinación 3D suave hacia el cursor (transición lenta en CSS)
      el.style.setProperty('--ry', `${((px / r.width) - 0.5) * tilt}deg`);
      el.style.setProperty('--rx', `${(0.5 - py / r.height) * tilt}deg`);
    }
  };
  const onLeave = () => {
    const el = ref.current;
    if (!el || !tilt) return;
    el.style.setProperty('--rx', '0deg');
    el.style.setProperty('--ry', '0deg');
  };
  return (
    <Tag
      ref={ref}
      className={`spotlight ${tilt ? 'spotlight--tilt' : ''} ${className}`}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      {...rest}
    >
      {children}
    </Tag>
  );
}
