import { useEffect, useRef, useState } from 'react';
import { animate } from 'framer-motion';
import { useReduceMotion } from '../../hooks/useMotionPreference';

/**
 * Número que «corre» desde el valor anterior hasta el nuevo
 * (patrón «Number Ticker» de Magic UI / 21st.dev).
 * El texto final queda accesible; los pasos intermedios son solo visuales.
 */
export default function NumberTicker({ value, format = (v) => String(v), duration = 0.7, className }) {
  const [shown, setShown] = useState(value);
  const from = useRef(value);
  const reduce = useReduceMotion();

  useEffect(() => {
    if (reduce) {
      setShown(value);
      from.current = value;
      return undefined;
    }
    const controls = animate(from.current, value, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => {
        from.current = v;
        setShown(v);
      },
    });
    return () => controls.stop();
  }, [value, duration, reduce]);

  return (
    <span className={className}>
      <span aria-hidden="true">{format(shown)}</span>
      <span className="visually-hidden">{format(value)}</span>
    </span>
  );
}
