import { ArrowUpRight, Check } from 'lucide-react';
import SpotlightCard from '../ui/SpotlightCard';
import { whatsappLink } from '../../config/siteConfig';
import './ServiceCard.css';

export default function ServiceCard({ service, index, variant = '', highlights }) {
  const { icon: Icon, title, description, benefits, cta } = service;
  const href = cta.type === 'whatsapp' ? whatsappLink(cta.message) : `#${cta.target}`;
  const external = cta.type === 'whatsapp';

  return (
    <SpotlightCard as="article" className={`service-card ${variant ? `service-card--${variant}` : ''}`} tilt={variant ? 4 : 7}>
      {/* Reflejo que sigue al cursor (patrón «Glare Hover») */}
      <span className="service-card__glare" aria-hidden="true" />
      {variant && (
        <span className="service-card__art" aria-hidden="true">
          <Icon size={220} strokeWidth={0.6} />
        </span>
      )}
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
      {highlights && (
        <dl className="service-card__stats">
          {highlights.map((h) => (
            <div key={h.label}>
              <dt>{h.label}</dt>
              <dd>{h.value}</dd>
            </div>
          ))}
        </dl>
      )}
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
