import { Calculator, MessageCircle } from 'lucide-react';
import SectionHeader from '../ui/SectionHeader';
import ServiceCard from '../ServiceCard/ServiceCard';
import Button from '../ui/Button';
import { RevealGroup, RevealItem } from '../ui/Reveal';
import { services } from '../../data/services';
import { whatsappLink } from '../../config/siteConfig';
import './Services.css';

export default function Services() {
  return (
    <section className="services section theme-light" aria-labelledby="services-title">
      <div className="container">
        <SectionHeader
          id="services-title"
          eyebrow="Transportamos lo que importa"
          title="Todo lo que necesitas para enviar"
          lead="Una sola empresa para recoger, preparar, transportar y coordinar la entrega de tu carga en Venezuela."
        />
        <RevealGroup className="services__grid" stagger={0.07}>
          {services.map((s, i) => (
            <RevealItem key={s.id} className="services__cell">
              <ServiceCard service={s} index={i} />
            </RevealItem>
          ))}
        </RevealGroup>
        <div className="services__footer">
          <p>¿No sabes qué servicio necesitas? Te asesoramos sin compromiso.</p>
          <div className="services__actions">
            <Button href="#calculadora" variant="primary" iconLeft={<Calculator size={18} aria-hidden="true" />}>
              Calcula tu envío
            </Button>
            <Button href={whatsappLink()} variant="secondary" iconLeft={<MessageCircle size={18} aria-hidden="true" />}>
              Hablar por WhatsApp
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
