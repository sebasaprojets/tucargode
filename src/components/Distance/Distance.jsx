import { lazy, Suspense, useRef } from 'react';
import { m, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Calculator, Plane, Ship, House } from 'lucide-react';
import Reveal from '../ui/Reveal';
import SplitText from '../ui/SplitText';
import Button from '../ui/Button';
import Magnetic from '../ui/Magnetic';
import Flag from '../ui/Flag';
import ParticleText, { Chars } from '../ParticleText/ParticleText';
import { formatInt } from '../../utils/format';
import { distanceKm } from '../Globe/globeMath';
import { origin, destinations } from '../../data/destinations';
import { rateZones } from '../../data/shippingRates';
import { siteConfig } from '../../config/siteConfig';
import './Distance.css';
import { useReduceMotion } from '../../hooks/useMotionPreference';

const Globe = lazy(() => import('../Globe/Globe'));

const KM = Math.round(distanceKm(origin.coords, destinations.find((d) => d.id === 'caracas').coords));

/**
 * «Ninguna distancia es suficiente…» — el mundo con la ruta Alemania → Venezuela
 * y la distancia real en línea recta, justo después de la travesía en barco.
 */
export default function Distance() {
  const ref = useRef(null);
  const reduce = useReduceMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'center center'] });
  // Acercamiento lento de «cámara» al entrar en la sección
  const scale = useTransform(scrollYProgress, [0, 1], reduce ? [1, 1] : [0.82, 1]);
  const y = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [80, 0]);
  const glowOpacity = useTransform(scrollYProgress, [0, 1], [0, 1]);

  // «7.965 km» se forma con partículas que se juntan al entrar en pantalla
  const kmRef = useRef(null);
  const { scrollYProgress: kmIn } = useScroll({ target: kmRef, offset: ['start end', 'center 62%'] });
  const assemble = useTransform(kmIn, [0, 1], [1, 0]);

  return (
    <section ref={ref} className="distance theme-dark" aria-labelledby="distance-title">
      <m.div className="distance__glow" style={{ opacity: glowOpacity }} aria-hidden="true" />
      <div className="distance__stars" aria-hidden="true" />

      <div className="container distance__grid">
        <div className="distance__content">
          <Reveal variant="fade" className="distance__route">
            <Flag code="de" size={18} /> Düsseldorf
            <span className="distance__line" aria-hidden="true" />
            <Flag code="ve" size={18} /> Caracas
          </Reveal>

          <div className="distance__km-wrap">
            <div ref={kmRef} className="distance__km">
              <span className="distance__approx">≈</span>
              <span className="distance__num">
                <Chars text={formatInt(KM)} />
              </span>
              <span className="distance__unit">
                <Chars text="km" />
              </span>
            </div>
            <ParticleText
              targetRef={kmRef}
              progress={assemble}
              wind={[-1, 0.5]}
              pad={220}
              colors={(line, el) => (el.closest('.distance__unit') ? '#7FD6F8' : '#D9F3FE')}
            />
          </div>
          <Reveal as="p" variant="fade" delay={0.1} className="distance__caption">
            en línea recta entre Alemania y Venezuela
          </Reveal>

          <SplitText
            as="h2"
            id="distance-title"
            className="distance__title"
            text={'Ninguna distancia es suficiente\npara separar a una familia.'}
          />

          <Reveal as="p" delay={0.15} className="distance__lead">
            Desde {siteConfig.foundedYear} acortamos los kilómetros entre Alemania y Venezuela. Cada caja que enviamos
            lleva mucho más que carga: lleva cuidado, cercanía y la tranquilidad de saber que llegará a casa.
          </Reveal>

          <Reveal className="distance__facts" delay={0.2}>
            <div>
              <Plane size={18} aria-hidden="true" />
              <span>
                <strong>Aéreo</strong> {rateZones.main.transit.air}
              </span>
            </div>
            <div>
              <Ship size={18} aria-hidden="true" />
              <span>
                <strong>Marítimo</strong> {rateZones.main.transit.sea}
              </span>
            </div>
            <div>
              <House size={18} aria-hidden="true" />
              <span>
                <strong>Puerta a puerta</strong> hasta tu familia
              </span>
            </div>
          </Reveal>

          <Reveal className="distance__ctas" delay={0.25}>
            <Magnetic>
              <Button href="#contacto" variant="accent" size="lg" iconRight={<ArrowRight size={18} />}>
                Cotiza tu envío
              </Button>
            </Magnetic>
            <Button href="#calculadora" variant="secondary" size="lg" iconLeft={<Calculator size={18} aria-hidden="true" />}>
              Calcula tu envío
            </Button>
          </Reveal>
        </div>

        <m.div className="distance__globe" style={{ scale, y }}>
          <Suspense fallback={<div className="globe-fallback" aria-hidden="true" />}>
            <Globe showDistance={false} />
          </Suspense>
        </m.div>
      </div>
    </section>
  );
}
