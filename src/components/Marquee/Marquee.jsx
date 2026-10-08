import { useEffect, useRef } from 'react';
import {
  m,
  useAnimationFrame,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from 'framer-motion';
import { Plane, Ship, House, Truck, PackageOpen, Warehouse, MapPin } from 'lucide-react';
import { mainCities } from '../../data/destinations';
import './Marquee.css';

const wrap = (min, max, v) => {
  const r = max - min;
  return ((((v - min) % r) + r) % r) + min;
};

/**
 * Cinta infinita lenta que reacciona a la velocidad del scroll
 * (patrón «Scroll Velocity» de React Bits). Cambia de sentido según
 * se baje o se suba. Solo transform: no provoca reflow.
 */
function Row({ items, baseVelocity }) {
  const reduce = useReducedMotion();
  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  const velocity = useVelocity(scrollY);
  const smooth = useSpring(velocity, { damping: 60, stiffness: 300 });
  const factor = useTransform(smooth, [0, 1500], [0, 3], { clamp: false });
  const x = useTransform(baseX, (v) => `${wrap(-50, 0, v)}%`);
  const dir = useRef(1);
  const visible = useRef(true);
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const io = new IntersectionObserver(([e]) => {
      visible.current = e.isIntersecting;
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useAnimationFrame((_, delta) => {
    if (reduce || !visible.current) return;
    let move = dir.current * baseVelocity * (delta / 1000);
    const f = factor.get();
    if (f < 0) dir.current = -1;
    else if (f > 0) dir.current = 1;
    move += dir.current * move * Math.min(Math.abs(f), 4);
    baseX.set(baseX.get() + move);
  });

  const content = (
    <>
      {items.map(({ icon: Icon, label }, i) => (
        <span className="marquee__item" key={`${label}-${i}`}>
          <Icon size={22} strokeWidth={1.6} aria-hidden="true" />
          {label}
          <span className="marquee__sep" aria-hidden="true" />
        </span>
      ))}
    </>
  );

  return (
    <div className="marquee__row" ref={ref}>
      <m.div className="marquee__track" style={{ x }}>
        {content}
        {content}
      </m.div>
    </div>
  );
}

const services = [
  { icon: Plane, label: 'Envíos aéreos' },
  { icon: Ship, label: 'Envíos marítimos' },
  { icon: House, label: 'Puerta a puerta' },
  { icon: Truck, label: 'Recogida DHL' },
  { icon: PackageOpen, label: 'Reempaque' },
  { icon: Warehouse, label: 'Casillero internacional' },
];

const cities = [
  { icon: MapPin, label: 'Düsseldorf' },
  ...mainCities.map((c) => ({ icon: MapPin, label: c })),
  { icon: MapPin, label: 'Toda Venezuela' },
];

export default function Marquee() {
  return (
    <section className="marquee" aria-label="Servicios y destinos">
      <p className="visually-hidden">
        Servicios: {services.map((s) => s.label).join(', ')}. Destinos: {cities.map((c) => c.label).join(', ')}.
      </p>
      <div aria-hidden="true">
        <Row items={services} baseVelocity={-2.2} />
        <Row items={cities} baseVelocity={1.6} />
      </div>
    </section>
  );
}
