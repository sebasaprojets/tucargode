import { useRef, useState } from 'react';
import { m, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import SectionHeader from '../ui/SectionHeader';
import { connectionStory } from '../../data/content';
import './Connection.css';

/** «Más que un envío. Una conexión.» — narrativa ligada al scroll. */
export default function Connection() {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 75%', 'end 55%'] });
  const fill = useTransform(scrollYProgress, [0, 1], [reduce ? 1 : 0, 1]);
  const [step, setStep] = useState(reduce ? connectionStory.length - 1 : -1);

  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    if (reduce) return;
    const s = Math.min(connectionStory.length - 1, Math.floor(v * connectionStory.length * 1.2));
    setStep(v <= 0.01 ? -1 : s);
  });

  return (
    <section className="connection section theme-dark" aria-labelledby="connection-title">
      <div className="container" ref={ref}>
        <SectionHeader
          id="connection-title"
          eyebrow="Conectamos Alemania y Venezuela"
          title={'Más que un envío.\nUna conexión.'}
          lead="Detrás de cada caja hay alguien esperando. Por eso cuidamos cada etapa del camino, de Düsseldorf a la puerta de tu familia."
        />
        <ol className="chain" role="list">
          <span className="chain__rail" aria-hidden="true">
            <m.span className="chain__fill" style={{ '--p': fill }} />
          </span>
          {connectionStory.map((s, i) => (
            <li key={s.label} className={`chain__item ${i <= step ? 'is-active' : ''} ${i === connectionStory.length - 1 ? 'is-last' : ''}`}>
              <span className="chain__node" aria-hidden="true">
                <span />
              </span>
              <span className="chain__index">{String(i + 1).padStart(2, '0')}</span>
              <h3 className="chain__label">{s.label}</h3>
              <p className="chain__text">{s.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
