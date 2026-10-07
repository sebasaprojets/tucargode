import { useRef } from 'react';
import './SpotlightCard.css';

/**
 * Tarjeta con luz que sigue al cursor (patrón «Spotlight Card» de React Bits).
 * Solo actualiza variables CSS: sin re-render en cada movimiento.
 */
export default function SpotlightCard({ as: Tag = 'div', className = '', children, ...rest }) {
  const ref = useRef(null);
  const onMove = (e) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--mx', `${e.clientX - r.left}px`);
    el.style.setProperty('--my', `${e.clientY - r.top}px`);
  };
  return (
    <Tag ref={ref} className={`spotlight ${className}`} onPointerMove={onMove} {...rest}>
      {children}
    </Tag>
  );
}
