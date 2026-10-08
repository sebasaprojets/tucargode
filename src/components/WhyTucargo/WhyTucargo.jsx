import { useRef } from 'react';
import { m } from 'framer-motion';
import SectionHeader from '../ui/SectionHeader';
import SpotlightCard from '../ui/SpotlightCard';
import CountUp from '../ui/CountUp';
import CarouselDots from '../ui/CarouselDots';
import { RevealGroup, RevealItem } from '../ui/Reveal';
import { whyTucargo } from '../../data/content';
import { siteConfig } from '../../config/siteConfig';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { useReduceMotion } from '../../hooks/useMotionPreference';
import './WhyTucargo.css';

// «Experiencia» es la pieza destacada del mosaico (años reales desde la fundación)
const FEATURED = 'Experiencia';
const ordered = [...whyTucargo].sort((a, b) => (a.title === FEATURED ? -1 : b.title === FEATURED ? 1 : 0));
const years = new Date().getFullYear() - siteConfig.foundedYear;

export default function WhyTucargo() {
  const gridRef = useRef(null);
  const reduce = useReduceMotion();
  // En móvil las tarjetas se deslizan en un carrusel
  const carousel = useMediaQuery('(max-width: 639px)');

  return (
    <section className="why section theme-dark noise" aria-labelledby="why-title">
      <div className="container why__inner">
        <SectionHeader
          id="why-title"
          eyebrow="Por qué Tucargo"
          title={'Estamos contigo durante\ntodo el proceso.'}
          lead="Una empresa cercana, con la experiencia y la estructura para mover tu carga con seguridad."
        />
        <RevealGroup innerRef={gridRef} className={`why__grid ${carousel ? 'snap-carousel' : ''}`} stagger={0.08}>
          {ordered.map((w, i) => {
            const Icon = w.icon;
            const featured = w.title === FEATURED;
            return (
              <RevealItem key={w.title} className={`why__cell ${featured ? 'why__cell--featured' : ''}`}>
                <SpotlightCard className={`why__card ${featured ? 'why__card--featured' : ''}`} tilt={featured ? 3 : 5}>
                  <span className="why__index" aria-hidden="true">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <m.span
                    className="why__icon"
                    aria-hidden="true"
                    initial={reduce ? false : { scale: 0.5, rotate: -25, opacity: 0 }}
                    whileInView={{ scale: 1, rotate: 0, opacity: 1 }}
                    viewport={{ once: true, amount: 0.6 }}
                    transition={{ type: 'spring', stiffness: 220, damping: 14, delay: 0.15 + i * 0.06 }}
                  >
                    <Icon size={featured ? 34 : 28} strokeWidth={1.6} />
                  </m.span>
                  {featured && (
                    <p className="why__years">
                      <span className="why__years-num">
                        +<CountUp to={years} duration={1.6} />
                      </span>
                      <span className="why__years-label">
                        años enviando a Venezuela
                        <br />
                        desde {siteConfig.foundedYear}
                      </span>
                    </p>
                  )}
                  <h3>{w.title}</h3>
                  <p>{w.text}</p>
                  {featured && (
                    <span className="why__art" aria-hidden="true">
                      <Icon size={240} strokeWidth={0.6} />
                    </span>
                  )}
                </SpotlightCard>
              </RevealItem>
            );
          })}
        </RevealGroup>
        {carousel && <CarouselDots scrollerRef={gridRef} label="Ver motivo" />}
      </div>
    </section>
  );
}
