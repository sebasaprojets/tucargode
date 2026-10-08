import { m, useScroll, useSpring } from 'framer-motion';
import './ScrollProgress.css';
import { useReduceMotion } from '../../hooks/useMotionPreference';

/** Barra fina de progreso de lectura (solo transform: no provoca reflow). */
export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const reduce = useReduceMotion();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 28, restDelta: 0.001 });
  return <m.div className="scroll-progress" style={{ scaleX: reduce ? scrollYProgress : scaleX }} aria-hidden="true" />;
}
