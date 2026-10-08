import { useRef } from 'react';
import { m, useMotionValue, useSpring } from 'framer-motion';
import { useCanHover } from '../../hooks/useMediaQuery';
import { useReduceMotion } from '../../hooks/useMotionPreference';

/**
 * Efecto magnético (patrón «Magnet» de React Bits): el elemento sigue
 * suavemente al cursor cuando está cerca. Solo con ratón y sin reduced-motion.
 */
export default function Magnetic({ children, strength = 0.28, className = '' }) {
  const ref = useRef(null);
  const canHover = useCanHover();
  const reduce = useReduceMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 120, damping: 14, mass: 0.7 });
  const sy = useSpring(y, { stiffness: 120, damping: 14, mass: 0.7 });

  if (!canHover || reduce) return <span className={className} style={{ display: 'inline-flex' }}>{children}</span>;

  const onMove = (e) => {
    const r = ref.current.getBoundingClientRect();
    x.set((e.clientX - (r.left + r.width / 2)) * strength);
    y.set((e.clientY - (r.top + r.height / 2)) * strength);
  };
  const reset = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <m.span
      ref={ref}
      className={className}
      style={{ display: 'inline-flex', x: sx, y: sy }}
      onPointerMove={onMove}
      onPointerLeave={reset}
    >
      {children}
    </m.span>
  );
}
