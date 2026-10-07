import { motion, useReducedMotion } from 'framer-motion';

/**
 * Animación de texto palabra por palabra (patrón «Split Text» de React Bits).
 * Mantiene el texto completo accesible para lectores de pantalla.
 */
export default function SplitText({ text, as = 'span', id, className, delay = 0, stagger = 0.045, animateOnMount = false }) {
  const reduce = useReducedMotion();
  const Tag = as;
  const lines = text.split('\n');

  if (reduce) {
    return (
      <Tag id={id} className={className}>
        {lines.map((line, i) => (
          <span key={i} className="split-line">
            {line}
          </span>
        ))}
      </Tag>
    );
  }

  let index = 0;
  const trigger = animateOnMount
    ? { initial: 'hidden', animate: 'show' }
    : { initial: 'hidden', whileInView: 'show', viewport: { once: true, amount: 0.5 } };

  return (
    <Tag id={id} className={className} aria-label={text.replace(/\n/g, ' ')}>
      <motion.span aria-hidden="true" style={{ display: 'block' }} {...trigger}>
        {lines.map((line, li) => (
          <span key={li} className="split-line" style={{ display: 'block' }}>
            {line.split(' ').map((word, wi) => {
              const i = index++;
              return (
                <span key={wi} style={{ display: 'inline-block', overflow: 'hidden', verticalAlign: 'top', paddingBottom: '0.08em', marginBottom: '-0.08em' }}>
                  <motion.span
                    style={{ display: 'inline-block', willChange: 'transform' }}
                    variants={{
                      hidden: { y: '105%', opacity: 0 },
                      show: { y: '0%', opacity: 1 },
                    }}
                    transition={{ duration: 0.9, delay: delay + i * stagger, ease: [0.22, 1, 0.36, 1] }}
                  >
                    {word}
                  </motion.span>
                  {wi < line.split(' ').length - 1 ? ' ' : ''}
                </span>
              );
            })}
          </span>
        ))}
      </motion.span>
    </Tag>
  );
}
