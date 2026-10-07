import { ArrowUp, Phone, Mail, MapPin } from 'lucide-react';
import Logo from '../ui/Logo';
import Button from '../ui/Button';
import { WhatsAppIcon, InstagramIcon, XIcon } from '../ui/BrandIcons';
import { navItems, siteConfig, whatsappLink } from '../../config/siteConfig';
import { services } from '../../data/services';
import './Footer.css';

export default function Footer() {
  const { contact, warehouse, hours, social, legal } = siteConfig;
  const year = new Date().getFullYear();
  return (
    <footer className="footer theme-dark">
      <div className="container">
        <div className="footer__cta">
          <p className="footer__cta-title">
            Tu carga, en buenas manos<span className="accent-dot">.</span>
          </p>
          <div className="footer__cta-actions">
            <Button href="#contacto" variant="accent">
              Cotiza tu envío
            </Button>
            <Button href={whatsappLink()} variant="secondary" iconLeft={<WhatsAppIcon size={18} />}>
              Hablar por WhatsApp
            </Button>
          </div>
        </div>

        <div className="footer__grid">
          <div className="footer__brand">
            <Logo />
            <p>Envíos aéreos y marítimos de Alemania a Venezuela desde {siteConfig.foundedYear}. Puerta a puerta, con atención personalizada.</p>
            <div className="footer__social">
              <a href={social.instagram.url} target="_blank" rel="noopener noreferrer" aria-label={`Instagram ${social.instagram.handle}`}>
                <InstagramIcon size={18} />
              </a>
              <a href={social.x.url} target="_blank" rel="noopener noreferrer" aria-label={`X ${social.x.handle}`}>
                <XIcon size={16} />
              </a>
              <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
                <WhatsAppIcon size={18} />
              </a>
            </div>
          </div>

          <nav aria-label="Secciones">
            <h2 className="footer__title">Navegación</h2>
            <ul role="list">
              {navItems.map((n) => (
                <li key={n.id}>
                  <a href={`#${n.id}`}>{n.label}</a>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Servicios">
            <h2 className="footer__title">Servicios</h2>
            <ul role="list">
              {services.map((s) => (
                <li key={s.id}>
                  <a href="#servicios">{s.title}</a>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="footer__title">Contacto</h2>
            <ul role="list" className="footer__contact">
              <li>
                <Phone size={16} aria-hidden="true" />
                <a href={contact.phoneHref}>{contact.phoneDisplay}</a>
              </li>
              <li>
                <Mail size={16} aria-hidden="true" />
                <a href={`mailto:${contact.email}`}>{contact.email}</a>
              </li>
              <li>
                <MapPin size={16} aria-hidden="true" />
                <a href={warehouse.mapsUrl} target="_blank" rel="noopener noreferrer">
                  {warehouse.street}, {warehouse.postalCode} {warehouse.city}
                </a>
              </li>
            </ul>
            <ul role="list" className="footer__hours">
              {hours.map((h) => (
                <li key={h.days}>
                  {h.days} · {h.time}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="footer__bottom">
          <p>
            © {year} {siteConfig.legalName}. Todos los derechos reservados.
          </p>
          <div className="footer__legal">
            {legal.impressumUrl && <a href={legal.impressumUrl}>Impressum</a>}
            {legal.privacyUrl && <a href={legal.privacyUrl}>Datenschutz</a>}
            <a href="#inicio" className="footer__top">
              Volver arriba <ArrowUp size={14} aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>
      <p className="footer__giant" aria-hidden="true">
        TUCARGO
      </p>
    </footer>
  );
}
