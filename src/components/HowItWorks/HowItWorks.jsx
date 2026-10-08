import { useEffect, useRef, useState } from 'react';
import { m, useMotionValueEvent, useScroll, useTransform } from 'framer-motion';
import { PackageOpen, Send, Plane, House, Ship } from 'lucide-react';
import SectionHeader from '../ui/SectionHeader';
import { howItWorks } from '../../data/content';
import { useReduceMotion } from '../../hooks/useMotionPreference';
import './HowItWorks.css';

const icons = [PackageOpen, Send, Plane, House];

/**
 * «Cómo funciona» como línea de tiempo que se dibuja al hacer scroll
 * (patrón «Scroll Timeline» de 21st.dev): la línea se llena, un barquito la
 * recorre y cada paso se enciende cuando el barco llega a él.
 */
export default function HowItWorks() {
  const wrapRef = useRef(null);
  const railRef = useRef(null);
  const nodeRefs = useRef([]);
  const reduce = useReduceMotion();
  const [rail, setRail] = useState({ top: 0, height: 0, marks: [] });
  const [lit, setLit] = useState(reduce ? howItWorks.length : 0);

  // Mide la línea: va del centro del primer paso al centro del último
  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return undefined;
    const measure = () => {
      const base = wrap.getBoundingClientRect().top;
      const centers = nodeRefs.current.map((n) => {
        const r = n.getBoundingClientRect();
        return r.top + r.height / 2 - base;
      });
      const top = centers[0];
      const height = Math.max(1, centers[centers.length - 1] - top);
      setRail({ top, height, marks: centers.map((c) => (c - top) / height) });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(wrap);
    return () => ro.disconnect();
  }, []);

  // El barco va siempre a la altura del 60 % de la pantalla mientras recorre la línea
  const { scrollYProgress } = useScroll({ target: railRef, offset: ['start 60%', 'end 60%'] });
  const p = useTransform(scrollYProgress, (v) => (reduce ? 1 : v));
  const boatY = useTransform(p, (v) => v * rail.height);

  const update = (v) => {
    const n = v > 0 ? rail.marks.filter((f) => v >= f - 0.015).length : 0;
    setLit((cur) => (cur === n ? cur : n));
  };
  useMotionValueEvent(p, 'change', update);
  useEffect(() => update(p.get()), [rail]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <section className="how section theme-light" aria-labelledby="how-title">
      <div className="container">
        <SectionHeader
          id="how-title"
          eyebrow="Cómo funciona"
          title="Cuatro pasos. Nosotros nos encargamos del resto."
          align="center"
        />
        <div className="how__timeline" ref={wrapRef}>
          <div ref={railRef} className="how__rail" style={{ top: rail.top, height: rail.height }} aria-hidden="true">
            <m.span className="how__fill" style={{ scaleY: p }} />
            {!reduce && (
              <m.span className="how__boat" style={{ y: boatY }}>
                <Ship size={18} strokeWidth={2} />
              </m.span>
            )}
          </div>
          <ol className="how__steps" role="list">
            {howItWorks.map((s, i) => {
              const Icon = icons[i];
              return (
                <li key={s.n} className={`how__step ${i % 2 ? 'is-right' : 'is-left'} ${i < lit ? 'is-lit' : ''}`}>
                  <span className="how__node" ref={(el) => (nodeRefs.current[i] = el)} aria-hidden="true">
                    <Icon size={22} strokeWidth={1.8} />
                  </span>
                  <div className="how__card">
                    <span className="how__n">Paso {s.n}</span>
                    <h3>{s.title}</h3>
                    <p>{s.text}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
