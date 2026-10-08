import { m, useMotionValue, useScroll, useSpring, useTransform } from 'framer-motion';
import { useEffect } from 'react';
import Particles from '../ui/Particles';
import SkyWriting from './SkyWriting';
import { Ship, DusseldorfSkyline, WaveBand } from '../Connection/VoyageArt';
import { useCanHover } from '../../hooks/useMediaQuery';
import './HeroScene.css';
import { useReduceMotion } from '../../hooks/useMotionPreference';

const TAIL_FIN = 'M430 -18 L452 -18 Q470 -60 492 -82 L512 -82 L500 -18 Z';

/** Avión de carga en vista lateral, morro a la izquierda (vuela hacia el oeste: Venezuela). */
function CargoPlane() {
  return (
    <svg className="hs-plane__svg" viewBox="-10 -90 540 180" aria-hidden="true">
      <defs>
        <linearGradient id="hsPlaneBody" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#F2F7FA" />
          <stop offset="0.55" stopColor="#C6D6E2" />
          <stop offset="1" stopColor="#7C97AE" />
        </linearGradient>
        <linearGradient id="hsPlaneWing" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#A9BFCF" />
          <stop offset="1" stopColor="#5E7A93" />
        </linearGradient>
      </defs>
      {/* Ala lejana */}
      <path d="M215 -6 L300 -6 L262 -52 L240 -52 Z" fill="#6F8AA3" opacity="0.8" />
      {/* Estabilizador vertical */}
      <path d={TAIL_FIN} fill="url(#hsPlaneBody)" />
      {/* Bandera de Venezuela de lado a lado de la cola (recortada con la forma del estabilizador) */}
      <clipPath id="hsTailClip">
        <path d={TAIL_FIN} />
      </clipPath>
      <g clipPath="url(#hsTailClip)">
        <rect x="440" y="-74" width="80" height="10" fill="#FFD100" />
        <rect x="440" y="-64" width="80" height="10" fill="#0033A0" />
        <rect x="440" y="-54" width="80" height="10" fill="#E4002B" />
        {[-70, -50, -30, -10, 10, 30, 50, 70].map((a) => (
          <circle
            key={a}
            cx={491 + 10 * Math.sin((a * Math.PI) / 180)}
            cy={-57.4 - 4 * Math.cos((a * Math.PI) / 180)}
            r="0.95"
            fill="#FFFFFF"
          />
        ))}
      </g>
      {/* Fuselaje */}
      <path
        d="M0 2 C6 -12 30 -20 70 -21 L440 -21 C470 -21 500 -14 520 -6 L520 6 C500 12 470 14 440 14 L70 14 C30 14 4 12 0 2 Z"
        fill="url(#hsPlaneBody)"
      />
      {/* Franja de marca */}
      <path d="M80 -1 H470" stroke="#019DD8" strokeWidth="5" strokeLinecap="round" />
      {/* Cabina */}
      <path d="M22 -8 L52 -15 L58 -7 L28 -3 Z" fill="#1B3A55" />
      {/* Estabilizador horizontal */}
      <path d="M440 -2 L505 -4 L480 22 L455 22 Z" fill="url(#hsPlaneWing)" />
      {/* Ala cercana + motores */}
      <path d="M200 4 L320 4 L262 76 L232 76 Z" fill="url(#hsPlaneWing)" />
      <rect x="226" y="20" width="56" height="18" rx="9" fill="#8FA7BC" />
      <rect x="226" y="20" width="10" height="18" rx="5" fill="#2A4258" />
      <rect x="246" y="46" width="44" height="14" rx="7" fill="#8FA7BC" />
      <rect x="246" y="46" width="8" height="14" rx="4" fill="#2A4258" />
    </svg>
  );
}

/** Ventanas encendidas, siempre dentro de los edificios del skyline. */
const BUILDINGS = [
  [120, 520, 60, 80],
  [185, 490, 44, 110],
  [234, 535, 70, 65],
  [308, 505, 38, 95],
  [364, 500, 44, 100],
  [422, 482, 56, 118],
  [492, 506, 44, 94],
];
function CityLights() {
  const lights = [];
  BUILDINGS.forEach(([x, y, w, h], b) => {
    for (let row = y + 12; row < y + h - 8; row += 14) {
      for (let col = x + 6; col < x + w - 6; col += 10) {
        // patrón pseudoaleatorio estable: no todas las ventanas encendidas
        if ((col * 7 + row * 13 + b * 31) % 5 > 1) continue;
        lights.push(
          <rect key={`${col}-${row}`} x={col} y={row} width="3.5" height="5" fill="#FFD9A0" opacity={0.45 + ((col + row) % 5) / 10} />,
        );
      }
    }
  });
  return <g>{lights}</g>;
}

/**
 * Escena cinematográfica del hero: partida nocturna desde Düsseldorf.
 * Cada objeto que se mueve vive en su propia capa animada con transform
 * (compositor), así la escena no se repinta en cada cuadro.
 */
export default function HeroScene({ targetRef }) {
  const reduce = useReduceMotion();
  const canHover = useCanHover();
  const { scrollYProgress } = useScroll({ target: targetRef, offset: ['start start', 'end start'] });

  // Parallax de scroll (profundidad: fondo lento, primer plano rápido)
  const skyY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 120]);
  const cityY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 60]);
  const seaY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -40]);
  const planeScroll = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -220]);

  // Parallax de ratón
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 30, damping: 20 });
  const sy = useSpring(my, { stiffness: 30, damping: 20 });
  const farX = useTransform(sx, (v) => v * -10);
  const midX = useTransform(sx, (v) => v * -24);
  const nearX = useTransform(sx, (v) => v * -42);
  const nearY = useTransform(sy, (v) => v * -14);

  useEffect(() => {
    if (!canHover || reduce) return undefined;
    const onMove = (e) => {
      mx.set(e.clientX / window.innerWidth - 0.5);
      my.set(e.clientY / window.innerHeight - 0.5);
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, [canHover, reduce, mx, my]);

  return (
    <div className="hs" aria-hidden="true">
      <m.div className="hs-sky" style={{ y: skyY }}>
        <div className="hs-stars" />
        <div className="hs-moon" />
      </m.div>
      <Particles className="hs-particles" density={0.00005} maxCount={70} />

      {/* Avión: cruza hacia el oeste con luces de navegación y estela */}
      <m.div className="hs-plane-layer" style={{ y: planeScroll, x: midX }}>
        <SkyWriting reduce={reduce} />
        <div className="hs-plane">
          <div className="hs-plane__trail" />
          <CargoPlane />
          <span className="hs-light hs-light--beacon" />
          <span className="hs-light hs-light--strobe" />
          <span className="hs-light hs-light--wing" />
        </div>
      </m.div>

      {/* Horizonte: skyline de Düsseldorf con ventanas encendidas */}
      <m.div className="hs-city" style={{ y: cityY, x: farX }}>
        <svg viewBox="100 200 900 410" preserveAspectRatio="xMaxYMax meet">
          <DusseldorfSkyline color="#06223A" />
          <CityLights />
        </svg>
      </m.div>

      {/* Mar nocturno con reflejo de luna */}
      <m.div className="hs-sea" style={{ y: seaY }}>
        <div className="hs-sea__reflection" />
        <div className="hs-wave hs-wave--back">
          <svg viewBox="0 560 3200 340" preserveAspectRatio="none">
            <WaveBand y={600} amp={6} len={160} color="#063152" />
          </svg>
        </div>

        {/* Barco del logo navegando hacia el oeste */}
        <m.div className="hs-ship-layer" style={{ x: nearX, y: nearY }}>
          <div className="hs-ship">
            <div className="hs-ship__bob">
              <svg viewBox="-200 -130 400 175" className="hs-ship__svg">
                <g transform="scale(-1 1)">
                  <Ship />
                </g>
              </svg>
              <span className="hs-ship__light hs-ship__light--a" />
              <span className="hs-ship__light hs-ship__light--b" />
              <svg viewBox="-200 -130 400 175" className="hs-ship__reflection">
                <g transform="scale(-1 1)">
                  <Ship />
                </g>
              </svg>
            </div>
          </div>
        </m.div>

        <div className="hs-wave hs-wave--front">
          <svg viewBox="0 560 3200 340" preserveAspectRatio="none">
            <WaveBand y={600} amp={9} len={320} color="#04213A" />
          </svg>
        </div>
      </m.div>

      <div className="hs-vignette" />
    </div>
  );
}
