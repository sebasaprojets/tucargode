import { motion, useReducedMotion } from 'framer-motion';
import { Plane, Ship } from 'lucide-react';
import Flag from '../ui/Flag';
import './RouteAnimation.css';

const AIR = 'M640 128 C 520 20, 250 120, 168 452';
/** Silueta de avión orientada hacia +x (rotate="auto" la alinea con la ruta). */
const PLANE =
  'M-8 -1.1 L4 -1.1 Q9 -1 9.5 0 Q9 1 4 1.1 L-8 1.1 Z M1 -1 L-3.5 -8.5 L-1.2 -8.5 L5 -1 Z M1 1 L-3.5 8.5 L-1.2 8.5 L5 1 Z M-6 -1 L-8.5 -4.5 L-7 -4.5 L-3.5 -1 Z M-6 1 L-8.5 4.5 L-7 4.5 L-3.5 1 Z';
const SEA = 'M648 150 C 640 360, 430 520, 186 470';

/**
 * Ruta Alemania → Venezuela.
 * - diagonal: escena SVG cinematográfica (desktop/tablet).
 * - vertical: versión simplificada para móvil.
 */
export default function RouteAnimation({ orientation = 'diagonal' }) {
  const reduce = useReducedMotion();
  return orientation === 'vertical' ? <VerticalRoute reduce={reduce} /> : <DiagonalRoute reduce={reduce} />;
}

function DiagonalRoute({ reduce }) {
  const draw = (delay) =>
    reduce
      ? {}
      : {
          initial: { pathLength: 0, opacity: 0 },
          animate: { pathLength: 1, opacity: 1 },
          transition: { duration: 2.4, delay, ease: [0.65, 0, 0.35, 1] },
        };

  return (
    <div className="route">
      <svg className="route__svg" viewBox="0 0 800 600" role="img" aria-labelledby="route-title">
        <title id="route-title">Ruta de envío desde Düsseldorf, Alemania, cruzando el Atlántico hasta Venezuela</title>
        <defs>
          <linearGradient id="routeGrad" x1="1" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8BBDF4" />
            <stop offset="55%" stopColor="#4C93E6" />
            <stop offset="100%" stopColor="#E53935" />
          </linearGradient>
          <radialGradient id="nodeGlow">
            <stop offset="0%" stopColor="#4C93E6" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#4C93E6" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="nodeGlowRed">
            <stop offset="0%" stopColor="#E53935" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#E53935" stopOpacity="0" />
          </radialGradient>
          <filter id="soft" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" />
          </filter>
        </defs>

        {/* Curvatura terrestre */}
        <g className="route__earth" aria-hidden="true">
          <circle cx="400" cy="1380" r="1000" fill="none" stroke="rgba(139,189,244,0.18)" />
          <circle cx="400" cy="1380" r="1060" fill="none" stroke="rgba(139,189,244,0.08)" />
          <circle cx="400" cy="1380" r="1130" fill="none" stroke="rgba(139,189,244,0.05)" />
          {[-60, -35, -12, 12, 35, 60].map((x) => (
            <path key={x} d={`M${400 + x * 6} 380 Q ${400 + x * 4.2} 500 ${400 + x * 3} 600`} stroke="rgba(139,189,244,0.06)" fill="none" />
          ))}
        </g>

        <text x="404" y="318" className="route__ocean" textAnchor="middle" aria-hidden="true">
          OCÉANO ATLÁNTICO
        </text>

        {/* Rutas */}
        <path d={AIR} className="route__track" />
        <motion.path d={AIR} className="route__air" stroke="url(#routeGrad)" {...draw(0.4)} />
        <path d={AIR} className="route__air-glow" stroke="url(#routeGrad)" filter="url(#soft)" />
        <motion.path d={SEA} className="route__sea" {...draw(0.9)} />

        {/* Avión */}
        {!reduce && (
          <g className="route__vehicle">
            <g>
              <circle r="16" fill="rgba(6,26,47,0.9)" stroke="rgba(139,189,244,0.6)" />
              <path d={PLANE} fill="#fff" />
              <animateMotion dur="16s" repeatCount="indefinite" rotate="auto" path={AIR} begin="2.6s" />
            </g>
          </g>
        )}

        {/* Barco */}
        {!reduce && (
          <g className="route__vehicle route__vehicle--ship">
            <g>
              <circle r="13" fill="rgba(6,26,47,0.9)" stroke="rgba(255,255,255,0.25)" />
              <g transform="translate(-7 -7)">
                <Ship size={14} color="rgba(255,255,255,0.85)" strokeWidth={1.8} />
              </g>
              <animateMotion dur="46s" repeatCount="indefinite" path={SEA} begin="3s" />
            </g>
          </g>
        )}

        {/* Nodos */}
        <g aria-hidden="true">
          <circle cx="644" cy="136" r="48" fill="url(#nodeGlow)" />
          <circle cx="644" cy="136" r="7" fill="#fff" />
          <circle cx="644" cy="136" r="7" className="route__pulse" />
          <circle cx="174" cy="462" r="52" fill="url(#nodeGlowRed)" />
          <circle cx="174" cy="462" r="7" fill="#E53935" />
          <circle cx="174" cy="462" r="7" className="route__pulse route__pulse--red" />
        </g>
      </svg>

      <div className="route__label route__label--origin">
        <Flag code="de" />
        <div>
          <strong>Düsseldorf</strong>
          <span>DE · 51.22°N 6.78°E</span>
        </div>
      </div>
      <div className="route__label route__label--dest">
        <Flag code="ve" />
        <div>
          <strong>Venezuela</strong>
          <span>VE · 10.48°N 66.90°W</span>
        </div>
      </div>
    </div>
  );
}

function VerticalRoute({ reduce }) {
  const stops = [
    { k: 'origin', title: 'Düsseldorf', sub: 'Alemania', flag: 'de' },
    { k: 'air', title: 'Aéreo o marítimo', sub: 'Salida desde Europa', icon: true },
    { k: 'ocean', title: 'Océano Atlántico', sub: 'En tránsito' },
    { k: 'dest', title: 'Venezuela', sub: 'Entrega coordinada', flag: 've' },
  ];
  return (
    <ol className="vroute" role="list" aria-label="Ruta de envío de Düsseldorf a Venezuela">
      <span className="vroute__line" aria-hidden="true">
        {!reduce && <span className="vroute__dot" />}
      </span>
      {stops.map((s) => (
        <li key={s.k} className={`vroute__stop vroute__stop--${s.k}`}>
          <span className="vroute__node" aria-hidden="true">
            {s.icon ? <Plane size={14} /> : null}
          </span>
          <span className="vroute__text">
            <strong>
              {s.flag && <Flag code={s.flag} size={16} />} {s.title}
            </strong>
            <span>{s.sub}</span>
          </span>
        </li>
      ))}
    </ol>
  );
}
