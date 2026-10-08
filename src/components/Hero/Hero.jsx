import { useRef } from 'react';
import { m, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Calculator, Plane, Ship, Truck, ArrowDown } from 'lucide-react';
import Button from '../ui/Button';
import Magnetic from '../ui/Magnetic';
import SplitText from '../ui/SplitText';
import HeroScene from '../HeroScene/HeroScene';
import ParticleText from '../ParticleText/ParticleText';
import { shippingModes } from '../../data/shippingRates';
import { siteConfig } from '../../config/siteConfig';
import './Hero.css';
import { useReduceMotion } from '../../hooks/useMotionPreference';

const ease = [0.22, 1, 0.36, 1];

export default function Hero() {
  const ref = useRef(null);
  const titleRef = useRef(null);
  const reduce = useReduceMotion();

  // Cámara: scroll (dolly out) + cursor (parallax en tres planos)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const contentY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 120]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  // El título se deshace en partículas al bajar (completo al 45% del hero)
  const dissolve = useTransform(scrollYProgress, [0.02, 0.45], [0, 1]);

  const air = shippingModes.air;
  const sea = shippingModes.sea;

  return (
    <section
      ref={ref}
      className="hero theme-dark"
      aria-labelledby="hero-title"
    >
      {/* Escena cinematográfica: avión y barco partiendo de Düsseldorf de noche */}
      <HeroScene targetRef={ref} />

      <div className="hero__layout container">
        {/* FOREGROUND — mensaje y CTA */}
        <m.div className="hero__content" style={{ y: contentY, opacity: contentOpacity }}>
          <m.p
            className="hero__eyebrow"
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease, delay: 0.05 }}
          >
            <span className="hero__live" aria-hidden="true" />
            Alemania <ArrowRight size={14} aria-hidden="true" /> Venezuela · desde {siteConfig.foundedYear}
          </m.p>

          <div className="hero__title-wrap">
            <div ref={titleRef}>
              <SplitText
                as="h1"
                id="hero-title"
                className="hero__title"
                text={'De Alemania a Venezuela.\nTu carga, en buenas manos.'}
                animateOnMount
                chars
                delay={0.08}
                stagger={0.045}
              />
            </div>
            <ParticleText targetRef={titleRef} progress={dissolve} wind={[1.1, -0.8]} />
          </div>

          <m.p
            className="hero__lead"
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease, delay: 0.3 }}
          >
            Envíos aéreos y marítimos puerta a puerta, con atención personalizada durante todo el proceso.
          </m.p>

          <m.div
            className="hero__ctas"
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease, delay: 0.42 }}
          >
            <Magnetic>
              <Button href="#contacto" variant="accent" size="lg" iconRight={<ArrowRight size={18} />}>
                Cotiza tu envío
              </Button>
            </Magnetic>
            <Magnetic>
              <Button href="#calculadora" variant="secondary" size="lg" iconLeft={<Calculator size={18} aria-hidden="true" />}>
                Calcula tu envío
              </Button>
            </Magnetic>
          </m.div>

          <m.ul
            className="hero__facts"
            role="list"
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <li>
              <Plane size={16} aria-hidden="true" /> Aéreo desde {air.minBillableKg} kg
            </li>
            <li>
              <Ship size={16} aria-hidden="true" /> Marítimo desde {sea.minBillableKg} kg
            </li>
            <li>
              <Truck size={16} aria-hidden="true" /> Recogida DHL en Alemania
            </li>
          </m.ul>
        </m.div>

      </div>

      <a href="#conexion" className="hero__scroll" aria-label="Seguir bajando">
        <ArrowDown size={16} aria-hidden="true" />
      </a>
    </section>
  );
}
