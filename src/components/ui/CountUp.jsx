import { useEffect, useRef, useState } from 'react';
import { animate, useInView } from 'framer-motion';
import { formatInt } from '../../utils/format';
import { useReduceMotion } from '../../hooks/useMotionPreference';

/** Contador animado (patrón «Count Up» de React Bits). */
export default function CountUp({ to, from = 0, duration = 2, format = true, className }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const reduce = useReduceMotion();
  const [value, setValue] = useState(reduce ? to : from);

  useEffect(() => {
    if (!inView || reduce) return undefined;
    const controls = animate(from, to, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setValue(v),
    });
    return () => controls.stop();
  }, [inView, reduce, from, to, duration]);

  const shown = format ? formatInt(value) : String(Math.round(value));
  return (
    <span ref={ref} className={className}>
      <span aria-hidden="true">{shown}</span>
      <span className="visually-hidden">{format ? formatInt(to) : to}</span>
    </span>
  );
}
