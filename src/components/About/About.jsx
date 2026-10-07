import SectionHeader from '../ui/SectionHeader';
import Reveal, { RevealGroup, RevealItem } from '../ui/Reveal';
import CountUp from '../ui/CountUp';
import { aboutTimeline } from '../../data/content';
import { siteConfig } from '../../config/siteConfig';
import './About.css';

export default function About() {
  const clients = siteConfig.stats.find((s) => s.label.startsWith('Clientes'));
  return (
    <section className="about section theme-white" aria-labelledby="about-title">
      <div className="container about__grid">
        <div className="about__intro">
          <SectionHeader
            id="about-title"
            eyebrow="Nosotros"
            title="Nacimos de la misma necesidad que tú"
            lead="Tucargo empezó con una caja para nuestra propia familia. Hoy es una operación logística entre Alemania y Venezuela que trata cada envío como si fuera el nuestro."
          />
          <Reveal as="blockquote" className="about__quote">
            <p>
              Al buscar soluciones, descubrimos que muchas otras personas venezolanas vivían la misma situación. Así nació
              Tucargo.
            </p>
          </Reveal>
          {clients && (
            <Reveal className="about__figure" delay={0.1}>
              <span className="about__figure-value">
                +<CountUp to={clients.value} />
              </span>
              <span className="about__figure-label">{clients.label.toLowerCase()} confían en nosotros</span>
            </Reveal>
          )}
        </div>

        <RevealGroup as="ol" className="about__timeline" role="list" stagger={0.12}>
          {aboutTimeline.map((t, i) => (
            <RevealItem as="li" key={t.title} className={`about__item ${i === aboutTimeline.length - 1 ? 'is-now' : ''}`}>
              <span className="about__tag">{t.tag}</span>
              <h3>{t.title}</h3>
              <p>{t.text}</p>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
