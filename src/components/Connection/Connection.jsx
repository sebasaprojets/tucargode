import { useEffect, useRef, useState } from 'react';
import {
  m,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import SectionHeader from '../ui/SectionHeader';
import Button from '../ui/Button';
import CinematicVideo from '../CinematicVideo/CinematicVideo';
import { connectionStory } from '../../data/content';
import { siteConfig } from '../../config/siteConfig';
import { useIsMobile } from '../../hooks/useMediaQuery';
import {
  HORIZON,
  Ship,
  Wake,
  DusseldorfSkyline,
  VenezuelaCoast,
  Cloud,
  WaveBand,
  Birds,
  PLANE_PATH,
} from './VoyageArt';
import './Connection.css';

const STEPS = connectionStory.length;
// Cada etapa ocupa una franja del recorrido; se solapan un poco para un fundido suave
const range = (i) => [i / STEPS, (i + 1) / STEPS];

function Caption({ p, i, step, last }) {
  const [a, b] = range(i);
  const fade = 0.05;
  const opacity = useTransform(
    p,
    i === 0 ? [0, b - fade, b] : last ? [a - fade, a, 1] : [a - fade, a, b - fade, b],
    i === 0 ? [1, 1, 0] : last ? [0, 1, 1] : [0, 1, 1, 0],
  );
  const y = useTransform(p, [a - fade, a, b], [30, 0, last ? 0 : -24]);
  return (
    <m.div className="voyage__caption" style={{ opacity, y }} aria-hidden={undefined}>
      <span className="voyage__index">
        {String(i + 1).padStart(2, '0')} / {String(STEPS).padStart(2, '0')}
      </span>
      <h3 className="voyage__title">{step.label}</h3>
      <p className="voyage__text">{step.text}</p>
      {last && (
        <Button href="#contacto" variant="accent" iconRight={<ArrowRight size={18} />} className="voyage__cta">
          Cotiza tu envío
        </Button>
      )}
    </m.div>
  );
}

/**
 * «Más que un envío. Una conexión.» — travesía cinematográfica guiada por el scroll.
 * La escena queda fija (sticky) mientras el usuario avanza: amanece en Düsseldorf,
 * el barco cruza el Atlántico y atardece en la costa venezolana.
 */
export default function Connection() {
  const wrapRef = useRef(null);
  const sceneRef = useRef(null);
  const reduce = useReducedMotion();
  const video = siteConfig.media.voyage;
  const hasVideo = Boolean(video.mp4 || video.webm);
  const isMobile = useIsMobile();

  const { scrollYProgress } = useScroll({ target: wrapRef, offset: ['start start', 'end end'] });
  // Movimiento lento y con inercia: el progreso sigue al scroll con un muelle suave
  const smooth = useSpring(scrollYProgress, { stiffness: 45, damping: 22, mass: 0.8 });
  // Con «reducir movimiento» la escena sigue al scroll (movimiento controlado por el usuario),
  // sin muelle ni animaciones automáticas
  const p = reduce ? scrollYProgress : smooth;

  // Cielo: amanecer → mediodía → atardecer → anochecer
  const skyTop = useTransform(p, [0, 0.35, 0.68, 1], ['#9BDDF8', '#62C6F1', '#3B6FA6', '#14305A']);
  const skyBottom = useTransform(p, [0, 0.35, 0.68, 1], ['#E1F5FE', '#ECF9FE', '#FBD0A0', '#F09A72']);
  const sunX = useTransform(p, [0, 0.4, 0.75, 1], [430, 820, 1180, 1270]);
  const sunY = useTransform(p, [0, 0.4, 0.75, 1], [250, 150, 380, 590]);
  const sunColor = useTransform(p, [0, 0.5, 1], ['#FFF4CF', '#FFF9E8', '#FFB27A']);
  const stars = useTransform(p, [0.82, 1], [0, 0.85]);
  const glow = useTransform(p, [0.55, 0.85, 1], [0, 0.45, 0.6]);

  // Mundo en movimiento (el barco queda casi centrado: funciona en cualquier proporción de pantalla)
  const dusX = useTransform(p, [0, 0.42], isMobile ? [0, -1250] : [-40, -1300]);
  const veX = useTransform(p, [0.55, 0.95], [1300, 0]);
  const cloudsFar = useTransform(p, [0, 1], [0, -420]);
  const cloudsNear = useTransform(p, [0, 1], [120, -900]);
  // En escritorio el barco cruza la pantalla: sale del puerto de Düsseldorf y llega a la costa venezolana
  const shipX = useTransform(p, [0, 1], isMobile ? [-40, 40] : [-330, 480]);
  const planeX = useTransform(p, [0.3, 0.7], [-300, 1900]);
  const planeY = useTransform(p, [0.3, 0.7], [210, 120]);
  const birdsA = useTransform(p, [0, 0.3], [0, -500]);
  const birdsB = useTransform(p, [0.7, 1], [600, 0]);
  const captionColor = useTransform(p, [0.5, 0.62], ['#04213A', '#FFFFFF']);
  const railFill = useTransform(p, [0, 1], [0, 1]);

  const [active, setActive] = useState(0);
  useMotionValueEvent(p, 'change', (v) => {
    const i = Math.min(STEPS - 1, Math.max(0, Math.floor(v * STEPS)));
    setActive((cur) => (cur === i ? cur : i));
  });

  // Pausa las animaciones CSS (olas, balanceo, nubes) fuera de pantalla
  const [onScreen, setOnScreen] = useState(false);
  useEffect(() => {
    const el = sceneRef.current;
    if (!el) return undefined;
    const io = new IntersectionObserver(([e]) => setOnScreen(e.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section className="connection theme-dark" aria-labelledby="connection-title">
      <div className="container connection__intro">
        <SectionHeader
          id="connection-title"
          eyebrow="Conectamos Alemania y Venezuela"
          title={'Más que un envío.\nUna conexión.'}
          lead="Detrás de cada caja hay alguien esperando. Acompaña la travesía de tu carga, de Düsseldorf a la puerta de tu familia."
        />
      </div>

      <div ref={wrapRef} className="voyage">
        <div ref={sceneRef} className={`voyage__sticky ${onScreen ? '' : 'is-paused'}`}>
          {hasVideo ? (
            <CinematicVideo {...video} className="voyage__video" />
          ) : (
            <svg
              className="voyage__svg"
              viewBox="0 0 1600 900"
              preserveAspectRatio="xMidYMax slice"
              role="img"
              aria-label="Ilustración: un barco de carga de Tucargo cruza el Atlántico desde Düsseldorf hasta la costa de Venezuela"
            >
              <defs>
                <linearGradient id="voySky" x1="0" y1="0" x2="0" y2="1">
                  <m.stop offset="0" style={{ stopColor: skyTop }} />
                  <m.stop offset="1" style={{ stopColor: skyBottom }} />
                </linearGradient>
                <radialGradient id="voySun">
                  <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.9" />
                  <stop offset="0.35" stopColor="#FFE9B8" stopOpacity="0.55" />
                  <stop offset="1" stopColor="#FFE9B8" stopOpacity="0" />
                </radialGradient>
                <radialGradient id="voyGlow" cx="0.5" cy="0" r="0.6">
                  <stop offset="0" stopColor="#FFB27A" stopOpacity="1" />
                  <stop offset="1" stopColor="#FFB27A" stopOpacity="0" />
                </radialGradient>
              </defs>

              {/* Cielo */}
              <rect width="1600" height={HORIZON + 10} fill="url(#voySky)" />
              <m.g style={{ opacity: stars }} fill="#FFFFFF">
                {[
                  [120, 80], [260, 150], [420, 60], [560, 120], [700, 40], [880, 100], [1040, 60], [1200, 130],
                  [1340, 70], [1480, 140], [980, 180], [320, 230],
                ].map(([x, y]) => (
                  <circle key={`${x}-${y}`} cx={x} cy={y} r="1.8" />
                ))}
              </m.g>

              {/* Sol */}
              <m.g style={{ x: sunX, y: sunY }}>
                <circle r="150" fill="url(#voySun)" />
                <m.circle r="46" style={{ fill: sunColor }} />
              </m.g>

              {/* Nubes lejanas y cercanas (deriva lenta + parallax) */}
              <m.g style={{ x: cloudsFar }} className="voyage__drift voyage__drift--slow">
                <Cloud x={300} y={190} s={0.8} o={0.75} />
                <Cloud x={900} y={140} s={0.6} o={0.7} />
                <Cloud x={1400} y={230} s={0.9} o={0.75} />
                <Cloud x={1900} y={170} s={0.7} o={0.7} />
              </m.g>

              {/* Avión cruzando a media travesía */}
              <m.g style={{ x: planeX, y: planeY }}>
                <path d="M-260 0 H-12" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
                <path d={PLANE_PATH} fill="#FFFFFF" transform="scale(2.6)" />
              </m.g>

              {/* Tierra: Düsseldorf se aleja, Venezuela llega */}
              <m.g style={{ x: dusX }}>
                <DusseldorfSkyline color="#0A3E68" />
              </m.g>
              <m.g style={{ x: veX }}>
                <VenezuelaCoast />
              </m.g>

              {/* Mar en tres capas con los azules del logo */}
              <g className="voyage__wave voyage__wave--back">
                <WaveBand y={HORIZON} amp={8} len={160} color="#019DD8" />
              </g>
              <m.ellipse cx="1240" cy={HORIZON + 30} rx="420" ry="90" fill="url(#voyGlow)" style={{ opacity: glow }} />

              <m.g style={{ x: birdsA }}>
                <Birds x={760} y={420} />
              </m.g>
              <m.g style={{ x: birdsB }}>
                <Birds x={1020} y={400} />
              </m.g>

              {/* Barco del logo, con balanceo lento */}
              <m.g style={{ x: shipX }}>
                <g transform={`translate(800 ${HORIZON + 34}) scale(${isMobile ? 0.8 : 1})`}>
                  <g className="voyage__bob">
                    <Wake />
                    <Ship />
                  </g>
                </g>
              </m.g>

              <g className="voyage__wave voyage__wave--mid">
                <WaveBand y={HORIZON + 52} amp={10} len={200} color="#01A9EC" />
              </g>
              <g className="voyage__wave voyage__wave--front">
                <WaveBand y={HORIZON + 120} amp={14} len={320} color="#01B9FF" />
              </g>

              <m.g style={{ x: cloudsNear }} className="voyage__drift">
                <Cloud x={1250} y={300} s={1.1} o={0.5} />
              </m.g>
            </svg>
          )}

          <div className="voyage__shade" aria-hidden="true" />

          {/* Textos de cada etapa */}
          <m.div className="voyage__captions container" style={{ color: hasVideo ? '#FFFFFF' : captionColor }}>
            {connectionStory.map((step, i) =>
              <Caption key={step.label} p={p} i={i} step={step} last={i === STEPS - 1} />,
            )}
          </m.div>

          {/* Raíl de progreso */}
          <div className="voyage__rail container" aria-hidden="true">
            <div className="voyage__rail-track">
              <m.span className="voyage__rail-fill" style={{ scaleX: railFill }} />
            </div>
            <ol className="voyage__rail-steps" role="list">
              {connectionStory.map((s, i) => (
                <li key={s.label} className={i <= active ? 'is-done' : ''}>
                  <span />
                  {s.label}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>

      {/* Texto accesible / versión sin movimiento */}
      <ol className="voyage__list container visually-hidden" role="list">
        {connectionStory.map((s, i) => (
          <li key={s.label}>
            <span className="voyage__index">{String(i + 1).padStart(2, '0')}</span>
            <strong>{s.label}</strong> — {s.text}
          </li>
        ))}
      </ol>
    </section>
  );
}
