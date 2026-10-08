import { m } from 'framer-motion';
import { useReduceMotion } from '../../hooks/useMotionPreference';

const variants = {
  up: { hidden: { opacity: 0, y: 28 }, show: { opacity: 1, y: 0 } },
  fade: { hidden: { opacity: 0 }, show: { opacity: 1 } },
  scale: { hidden: { opacity: 0, scale: 0.96 }, show: { opacity: 1, scale: 1 } },
  blur: { hidden: { opacity: 0, y: 16, filter: 'blur(8px)' }, show: { opacity: 1, y: 0, filter: 'blur(0px)' } },
  left: { hidden: { opacity: 0, x: -28 }, show: { opacity: 1, x: 0 } },
  right: { hidden: { opacity: 0, x: 28 }, show: { opacity: 1, x: 0 } },
  clip: {
    hidden: { opacity: 0, clipPath: 'inset(12% 6% 12% 6% round 28px)' },
    show: { opacity: 1, clipPath: 'inset(0% 0% 0% 0% round 28px)' },
  },
};

/** Revelado progresivo al entrar en viewport. Respeta prefers-reduced-motion. */
export default function Reveal({
  as = 'div',
  variant = 'up',
  delay = 0,
  duration = 0.8,
  amount = 0.2,
  className,
  children,
  ...rest
}) {
  const reduce = useReduceMotion();
  const Comp = m[as] ?? m.div;
  if (reduce) {
    const Static = as;
    return (
      <Static className={className} {...rest}>
        {children}
      </Static>
    );
  }
  return (
    <Comp
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount }}
      variants={variants[variant]}
      transition={{ duration, delay, ease: [0.22, 1, 0.36, 1] }}
      {...rest}
    >
      {children}
    </Comp>
  );
}

/** Contenedor con stagger para hijos <RevealItem>. */
export function RevealGroup({ as = 'div', stagger = 0.08, delay = 0, amount = 0.15, className, children, ...rest }) {
  const reduce = useReduceMotion();
  const Comp = m[as] ?? m.div;
  return (
    <Comp
      className={className}
      initial={reduce ? false : 'hidden'}
      whileInView="show"
      viewport={{ once: true, amount }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: stagger, delayChildren: delay } } }}
      {...rest}
    >
      {children}
    </Comp>
  );
}

export function RevealItem({ as = 'div', variant = 'up', className, children, ...rest }) {
  const Comp = m[as] ?? m.div;
  return (
    <Comp
      className={className}
      variants={variants[variant]}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      {...rest}
    >
      {children}
    </Comp>
  );
}
