import { useEffect, useMemo, useRef, useState } from 'react';
import { m, useReducedMotion } from 'framer-motion';
import { Plane, Ship } from 'lucide-react';
import SectionHeader from '../ui/SectionHeader';
import Reveal from '../ui/Reveal';
import { buildDotsPath, project, WIDTH, HEIGHT } from './geo';
import { destinations, origin } from '../../data/destinations';
import { rateZones } from '../../data/shippingRates';
import { useIsMobile } from '../../hooks/useMediaQuery';
import './RouteMap.css';

const [ox, oy] = project(origin.coords);
const caracas = project(destinations.find((d) => d.id === 'caracas').coords);
const puertoCabello = project([-68.0, 10.47]);

const routes = {
  air: {
    id: 'air',
    label: 'Aéreo',
    icon: Plane,
    d: `M${ox} ${oy} Q 640 40 ${caracas[0]} ${caracas[1]}`,
    info: `${rateZones.main.transit.air} hasta ciudades principales`,
    end: 'Caracas · Maracay · Valencia · Barquisimeto',
  },
  sea: {
    id: 'sea',
    label: 'Marítimo',
    icon: Ship,
    d: `M${ox} ${oy + 30} C 860 330, 560 420, ${puertoCabello[0]} ${puertoCabello[1]}`,
    info: 'Llegada por Puerto Cabello · 45–60 días de tránsito marítimo',
    end: 'Puerto Cabello, Venezuela',
  },
};

const waypoints = [
  { label: 'Düsseldorf', at: [ox, oy], cls: 'origin' },
  { label: 'Europa', at: [930, 250], cls: 'region' },
  { label: 'Atlántico', at: [610, 330], cls: 'region' },
  { label: 'Venezuela', at: [caracas[0] - 10, caracas[1] + 50], cls: 'dest' },
];

export default function RouteMap() {
  const dots = useMemo(() => buildDotsPath(), []);
  const [active, setActive] = useState('air');
  const [hover, setHover] = useState(false);
  const reduce = useReducedMotion();
  const isMobile = useIsMobile();
  const route = routes[active];
  const viewBox = isMobile ? `170 30 1000 622` : `0 0 ${WIDTH} ${HEIGHT}`;
  const cities = destinations.filter((d) => d.coords && d.available);
  const fgRef = useRef(null);

  // Pausa las animaciones SVG (SMIL) cuando el mapa no está en pantalla
  useEffect(() => {
    const svg = fgRef.current;
    if (!svg?.pauseAnimations) return undefined;
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? svg.unpauseAnimations() : svg.pauseAnimations()));
    io.observe(svg);
    return () => io.disconnect();
  }, []);

  return (
    <section className="routemap section theme-dark" aria-labelledby="map-title">
      <div className="container">
        <SectionHeader
          id="map-title"
          eyebrow="Recíbela en Venezuela"
          title="Una ruta, de Düsseldorf a tu puerta"
          lead="Tu carga sale de Alemania, cruza Europa y el Atlántico y llega a Venezuela, donde coordinamos la entrega."
        />

        <div className="routemap__tabs" role="tablist" aria-label="Tipo de ruta">
          {Object.values(routes).map((r) => {
            const Icon = r.icon;
            return (
              <button
                key={r.id}
                role="tab"
                type="button"
                aria-selected={active === r.id}
                aria-controls="routemap-panel"
                className={`routemap__tab ${active === r.id ? 'is-active' : ''}`}
                onClick={() => setActive(r.id)}
              >
                <Icon size={16} aria-hidden="true" /> {r.label}
              </button>
            );
          })}
        </div>

        <Reveal variant="clip" className="routemap__frame" id="routemap-panel" role="tabpanel">
          <div className="routemap__stage">
          {/* Capa estática: miles de puntos, nunca se repinta durante la animación */}
          <svg className="routemap__svg routemap__svg--bg" viewBox={viewBox} preserveAspectRatio="xMidYMid meet" aria-hidden="true">
            <defs>
              <radialGradient id="mapVignette" cx="50%" cy="50%" r="70%">
                <stop offset="60%" stopColor="#04213A" stopOpacity="0" />
                <stop offset="100%" stopColor="#04213A" stopOpacity="0.9" />
              </radialGradient>
            </defs>
            <path d={dots} className="routemap__dots" />
            <rect x="0" y="0" width={WIDTH} height={HEIGHT} fill="url(#mapVignette)" />
          </svg>
          <svg
            ref={fgRef}
            className={`routemap__svg routemap__svg--fg ${hover ? 'is-hover' : ''}`}
            viewBox={viewBox}
            preserveAspectRatio="xMidYMid meet"
            role="img"
            aria-label={`Mapa de la ruta ${route.label.toLowerCase()} de Düsseldorf a Venezuela. ${route.info}.`}
          >
            <defs>
              <linearGradient id="mapRoute" x1="1" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#7FD6F8" />
                <stop offset="100%" stopColor="#CC4D47" />
              </linearGradient>
            </defs>

            {/* Ruta inactiva (contexto) */}
            {Object.values(routes)
              .filter((r) => r.id !== active)
              .map((r) => (
                <path key={r.id} d={r.d} className="routemap__route routemap__route--ghost" />
              ))}

            {/* Ruta activa */}
            <m.path
              key={route.id}
              d={route.d}
              className={`routemap__route routemap__route--${route.id}`}
              stroke="url(#mapRoute)"
              initial={reduce ? false : { pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.8, ease: [0.65, 0, 0.35, 1] }}
            />
            {!reduce && (
              <circle r="6" className="routemap__traveler" key={`t-${route.id}`}>
                <animateMotion dur={route.id === 'air' ? '6s' : '14s'} repeatCount="indefinite" path={route.d} />
              </circle>
            )}
            {/* Zona de interacción amplia */}
            <path
              d={route.d}
              className="routemap__hit"
              onPointerEnter={() => setHover(true)}
              onPointerLeave={() => setHover(false)}
            />

            {/* Ciudades destino */}
            {cities.map((c) => {
              const [x, y] = project(c.coords);
              return (
                <g key={c.id} className="routemap__city">
                  <circle cx={x} cy={y} r="4" />
                  <title>{c.label}</title>
                </g>
              );
            })}

            {/* Origen y destino */}
            <circle cx={ox} cy={oy} r="9" className="routemap__node" />
            <circle cx={ox} cy={oy} r="9" className="routemap__ping" />
            <circle cx={caracas[0]} cy={caracas[1]} r="9" className="routemap__node routemap__node--dest" />
            <circle cx={caracas[0]} cy={caracas[1]} r="9" className="routemap__ping routemap__ping--dest" />

            {waypoints.map((w) => (
              <text
                key={w.label}
                x={w.at[0]}
                y={w.cls === 'origin' ? w.at[1] - 22 : w.at[1]}
                textAnchor="middle"
                className={`routemap__label routemap__label--${w.cls}`}
              >
                {w.label.toUpperCase()}
              </text>
            ))}
          </svg>
          </div>

          <div className={`routemap__info ${hover ? 'is-hover' : ''}`}>
            <p className="routemap__info-mode">
              <route.icon size={16} aria-hidden="true" /> Ruta {route.label.toLowerCase()}
            </p>
            <p className="routemap__info-text">{route.info}</p>
            <p className="routemap__info-end">{route.end}</p>
          </div>
        </Reveal>

        <ol className="routemap__steps" role="list" aria-label="Etapas de la ruta">
          {waypoints.map((w, i) => (
            <li key={w.label}>
              <span>{String(i + 1).padStart(2, '0')}</span>
              {w.label}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
