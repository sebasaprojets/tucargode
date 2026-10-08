import { Calculator, MessageCircle } from 'lucide-react';
import SectionHeader from '../ui/SectionHeader';
import ServiceCard from '../ServiceCard/ServiceCard';
import Button from '../ui/Button';
import { RevealGroup, RevealItem } from '../ui/Reveal';
import { services } from '../../data/services';
import { shippingModes, rateZones } from '../../data/shippingRates';
import { formatEUR } from '../../utils/format';
import { whatsappLink } from '../../config/siteConfig';
import './Services.css';

/** Bento grid: aéreo y marítimo como piezas destacadas del mosaico. */
const FEATURED = { aereo: 'dark', maritimo: 'sky' };
const { air, sea } = shippingModes;
/** Cifras clave de las piezas destacadas (todas salen de shippingRates.js). */
const HIGHLIGHTS = {
  aereo: [
    { value: `${formatEUR(rateZones.main.rates.air).replace(',00', '')}`, label: 'por kg · ciudades principales' },
    { value: `${air.minBillableKg}–${air.maxKg} kg`, label: 'por envío' },
    { value: rateZones.main.transit.air.replace('aprox. ', ''), label: 'tiempo estimado' },
  ],
  maritimo: [
    { value: `${sea.minBillableKg} kg`, label: 'mínimo facturable' },
    { value: 'Sin límite', label: 'si cabe en un palet' },
  ],
};

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
            <RevealItem key={s.id} className={`services__cell services__cell--${s.id}`}>
              <ServiceCard service={s} index={i} variant={FEATURED[s.id]} highlights={HIGHLIGHTS[s.id]} />
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
