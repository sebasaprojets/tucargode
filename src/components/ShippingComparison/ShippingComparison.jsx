import { useState } from 'react';
import { Plane, Ship, Check, Sparkles } from 'lucide-react';
import SectionHeader from '../ui/SectionHeader';
import Reveal from '../ui/Reveal';
import Button from '../ui/Button';
import ShippingAssistant from './ShippingAssistant';
import { comparison } from '../../data/content';
import './ShippingComparison.css';

function ModeCard({ data, icon: Icon, variant }) {
  return (
    <article className={`mode-card mode-card--${variant}`}>
      <header className="mode-card__head">
        <span className="mode-card__icon" aria-hidden="true">
          <Icon size={28} strokeWidth={1.6} />
        </span>
        <h3>{data.title}</h3>
      </header>
      <dl className="mode-card__rows">
        {data.rows.map((r) => (
          <div key={r.k}>
            <dt>{r.k}</dt>
            <dd>{r.v}</dd>
          </div>
        ))}
      </dl>
      <ul className="mode-card__pros" role="list">
        {data.pros.map((p) => (
          <li key={p}>
            <Check size={16} aria-hidden="true" /> {p}
          </li>
        ))}
      </ul>
    </article>
  );
}

export default function ShippingComparison() {
  const [open, setOpen] = useState(false);
  return (
    <section className="comparison section theme-white" aria-labelledby="comparison-title">
      <div className="container">
        <SectionHeader
          id="comparison-title"
          eyebrow="Elige cómo quieres enviar"
          title="Aéreo o marítimo"
          lead="Dos formas de cruzar el Atlántico. Compara y elige la que mejor encaja con tu carga y tus tiempos."
          align="center"
        />
        <div className="comparison__grid">
          <Reveal variant="left">
            <ModeCard data={comparison.air} icon={Plane} variant="air" />
          </Reveal>
          <div className="comparison__vs" aria-hidden="true">
            VS
          </div>
          <Reveal variant="right">
            <ModeCard data={comparison.sea} icon={Ship} variant="sea" />
          </Reveal>
        </div>
        <Reveal className="comparison__cta" delay={0.1}>
          <Button variant="primary" size="lg" onClick={() => setOpen(true)} iconLeft={<Sparkles size={18} aria-hidden="true" />}>
            ¿Cuál es mejor para mí?
          </Button>
          <p>Responde 2 preguntas y te orientamos en segundos.</p>
        </Reveal>
      </div>
      <ShippingAssistant open={open} onClose={() => setOpen(false)} />
    </section>
  );
}
