import { ArrowUpRight, Check } from 'lucide-react';
import SpotlightCard from '../ui/SpotlightCard';
import { whatsappLink } from '../../config/siteConfig';
import './ServiceCard.css';

export default function ServiceCard({ service, index }) {
  const { icon: Icon, title, description, benefits, cta } = service;
  const href = cta.type === 'whatsapp' ? whatsappLink(cta.message) : `#${cta.target}`;
  const external = cta.type === 'whatsapp';

  return (
    <SpotlightCard as="article" className="service-card">
      <div className="service-card__top">
        <span className="service-card__icon" aria-hidden="true">
          <Icon size={26} strokeWidth={1.6} />
        </span>
        <span className="service-card__index" aria-hidden="true">
          {String(index + 1).padStart(2, '0')}
        </span>
      </div>
      <h3 className="service-card__title">{title}</h3>
      <p className="service-card__desc">{description}</p>
      <ul className="service-card__list" role="list">
        {benefits.map((b) => (
          <li key={b}>
            <Check size={16} aria-hidden="true" />
            {b}
          </li>
        ))}
      </ul>
      <a
        className="service-card__cta"
        href={href}
        {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      >
        {cta.label}
        <ArrowUpRight size={18} aria-hidden="true" />
        {external && <span className="visually-hidden"> (abre WhatsApp)</span>}
      </a>
    </SpotlightCard>
  );
}
