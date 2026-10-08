import SectionHeader from '../ui/SectionHeader';
import SpotlightCard from '../ui/SpotlightCard';
import { RevealGroup, RevealItem } from '../ui/Reveal';
import { whyTucargo } from '../../data/content';
import './WhyTucargo.css';

export default function WhyTucargo() {
  return (
    <section className="why section theme-dark noise" aria-labelledby="why-title">
      <div className="container why__inner">
        <SectionHeader
          id="why-title"
          eyebrow="Por qué Tucargo"
          title={'Estamos contigo durante\ntodo el proceso.'}
          lead="Una empresa cercana, con la experiencia y la estructura para mover tu carga con seguridad."
        />
        <RevealGroup className="why__grid" stagger={0.08}>
          {whyTucargo.map((w, i) => {
            const Icon = w.icon;
            return (
              <RevealItem key={w.title} className={`why__cell ${i === 0 ? 'why__cell--wide' : ''}`}>
                <SpotlightCard className="why__card" tabIndex={0} tilt={5}>
                  <span className="why__icon" aria-hidden="true">
                    <Icon size={24} strokeWidth={1.6} />
                  </span>
                  <h3>{w.title}</h3>
                  <p>{w.text}</p>
                </SpotlightCard>
              </RevealItem>
            );
          })}
        </RevealGroup>
      </div>
    </section>
  );
}
