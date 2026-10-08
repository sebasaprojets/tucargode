import { lazy, Suspense, useRef } from 'react';
import { m, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion';
import { ArrowRight, Calculator, Plane, Ship, Truck, ArrowDown } from 'lucide-react';
import Button from '../ui/Button';
import Magnetic from '../ui/Magnetic';
import SplitText from '../ui/SplitText';
import Particles from '../ui/Particles';
import { useIsMobile, useCanHover } from '../../hooks/useMediaQuery';

// El globo (canvas + datos del mapa) va en un chunk propio: el texto del hero pinta primero.
const Globe = lazy(() => import('../Globe/Globe'));
import { shippingModes, rateZones } from '../../data/shippingRates';
import { siteConfig } from '../../config/siteConfig';
import './Hero.css';

const ease = [0.22, 1, 0.36, 1];

export default function Hero() {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const isMobile = useIsMobile();
  const canHover = useCanHover();

  // Cámara: scroll (dolly out) + cursor (parallax en tres planos)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const contentY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 120]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const sceneScale = useTransform(scrollYProgress, [0, 1], [1, reduce ? 1 : 1.12]);
  const bgY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 200]);

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 40, damping: 18 });
  const sy = useSpring(my, { stiffness: 40, damping: 18 });
  const bgX = useTransform(sx, (v) => v * -12);
  const bgYm = useTransform(sy, (v) => v * -8);
  const fgX = useTransform(sx, (v) => v * 32);
  const fgY = useTransform(sy, (v) => v * 22);

  const onPointerMove = (e) => {
    if (reduce || !canHover) return;
    const r = ref.current.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };

  const air = shippingModes.air;
  const sea = shippingModes.sea;

  return (
    <section
      ref={ref}
      className="hero theme-dark noise"
      aria-labelledby="hero-title"
      onPointerMove={onPointerMove}
    >
      {/* BACKGROUND — cielo, horizonte, atmósfera */}
      <m.div className="hero__bg" style={{ x: bgX, y: bgY }} aria-hidden="true">
        <m.div className="hero__bg-inner" style={{ y: bgYm }}>
          <div className="hero__aurora hero__aurora--blue" />
          <div className="hero__aurora hero__aurora--red" />
          <div className="hero__grid" />
          <div className="hero__horizon" />
        </m.div>
      </m.div>
      <Particles className="hero__particles" />

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

          <SplitText
            as="h1"
            id="hero-title"
            className="hero__title"
            text={'De Alemania a Venezuela.\nTu carga, en buenas manos.'}
            animateOnMount
            delay={0.08}
            stagger={0.045}
          />

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

        {/* MIDDLE-GROUND — el mundo */}
        <m.div
          className="hero__scene"
          style={isMobile ? undefined : { scale: sceneScale }}
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, ease, delay: 0.2 }}
        >
          <Suspense fallback={<div className="globe-fallback" aria-hidden="true" />}>
            <Globe />
          </Suspense>

          {!isMobile && (
            <m.div
              className="hero__card"
              style={{ x: fgX, y: fgY }}
              initial={reduce ? false : { opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease, delay: 3.9 }}
            >
              <p className="hero__card-title">
                <span className="hero__live" aria-hidden="true" /> Ruta DUS → VE
              </p>
              <dl>
                <div>
                  <dt>
                    <Plane size={14} aria-hidden="true" /> Aéreo
                  </dt>
                  <dd>{rateZones.main.transit.air}</dd>
                </div>
                <div>
                  <dt>
                    <Ship size={14} aria-hidden="true" /> Marítimo
                  </dt>
                  <dd>{rateZones.main.transit.sea}</dd>
                </div>
              </dl>
              <p className="hero__card-note">Ciudades principales · desde la salida</p>
            </m.div>
          )}
        </m.div>
      </div>

      <a href="#conexion" className="hero__scroll" aria-label="Seguir bajando">
        <ArrowDown size={16} aria-hidden="true" />
      </a>
    </section>
  );
}
