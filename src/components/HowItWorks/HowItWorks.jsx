import { useRef } from 'react';
import { m, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { PackageOpen, Send, Plane, House } from 'lucide-react';
import SectionHeader from '../ui/SectionHeader';
import { RevealGroup, RevealItem } from '../ui/Reveal';
import { howItWorks } from '../../data/content';
import './HowItWorks.css';

const icons = [PackageOpen, Send, Plane, House];

export default function HowItWorks() {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 80%', 'end 60%'] });
  const p = useTransform(scrollYProgress, [0, 1], [reduce ? 1 : 0, 1]);

  return (
    <section className="how section theme-light" aria-labelledby="how-title">
      <div className="container">
        <SectionHeader
          id="how-title"
          eyebrow="Cómo funciona"
          title="Cuatro pasos. Nosotros nos encargamos del resto."
          align="center"
        />
        <div className="how__wrap" ref={ref}>
          <span className="how__rail" aria-hidden="true">
            <m.span className="how__fill" style={{ '--p': p }} />
          </span>
          <RevealGroup as="ol" className="how__steps" role="list" stagger={0.12}>
            {howItWorks.map((s, i) => {
              const Icon = icons[i];
              return (
                <RevealItem as="li" key={s.n} className="how__step">
                  <span className="how__icon" aria-hidden="true">
                    <Icon size={24} strokeWidth={1.7} />
                  </span>
                  <span className="how__n">{s.n}</span>
                  <h3>{s.title}</h3>
                  <p>{s.text}</p>
                </RevealItem>
              );
            })}
          </RevealGroup>
        </div>
      </div>
    </section>
  );
}
