import { useState } from 'react';
import { Phone, Mail, MapPin, Clock, Copy, Check, ExternalLink } from 'lucide-react';
import SectionHeader from '../ui/SectionHeader';
import Reveal from '../ui/Reveal';
import Button from '../ui/Button';
import { WhatsAppIcon } from '../ui/BrandIcons';
import QuoteForm from '../QuoteForm/QuoteForm';
import { siteConfig, whatsappLink } from '../../config/siteConfig';
import './Contact.css';

export default function Contact() {
  const { contact, warehouse, hours } = siteConfig;
  const [copied, setCopied] = useState(false);
  const address = `${warehouse.recipient}\n${warehouse.street}\n${warehouse.postalCode} ${warehouse.city}\n${warehouse.country}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(false);
    }
  };

  return (
    <section className="contact section theme-light" aria-labelledby="contact-title">
      <div className="container">
        <SectionHeader
          id="contact-title"
          eyebrow="Contacto"
          title="Hablemos de tu envío"
          lead="Pide tu cotización o escríbenos directamente. Respondemos de lunes a sábado."
        />
        <div className="contact__grid">
          <Reveal className="contact__form">
            <QuoteForm />
          </Reveal>

          <Reveal className="contact__aside" delay={0.1}>
            <div className="contact__wa theme-dark">
              <WhatsAppIcon size={28} />
              <div>
                <p className="contact__wa-title">La forma más rápida</p>
                <p className="contact__wa-text">Escríbenos y te atendemos personalmente.</p>
              </div>
              <Button href={whatsappLink()} variant="whatsapp" block>
                Hablar por WhatsApp
              </Button>
            </div>

            <ul className="contact__list" role="list">
              <li>
                <Phone size={20} aria-hidden="true" />
                <div>
                  <span>Teléfono / WhatsApp</span>
                  <a href={contact.phoneHref}>{contact.phoneDisplay}</a>
                </div>
              </li>
              <li>
                <Mail size={20} aria-hidden="true" />
                <div>
                  <span>Email</span>
                  <a href={`mailto:${contact.email}`}>{contact.email}</a>
                </div>
              </li>
              <li>
                <Clock size={20} aria-hidden="true" />
                <div>
                  <span>Horario</span>
                  {hours.map((h) => (
                    <p key={h.days}>
                      {h.days}: <strong>{h.time}</strong>
                    </p>
                  ))}
                </div>
              </li>
            </ul>

            <div className="contact__address" id="casillero">
              <div className="contact__address-head">
                <MapPin size={20} aria-hidden="true" />
                <div>
                  <span>Almacén principal · Envía tu paquete a</span>
                  <address>
                    {warehouse.recipient}
                    <br />
                    {warehouse.street}
                    <br />
                    {warehouse.postalCode} {warehouse.city}, {warehouse.country}
                  </address>
                </div>
              </div>
              <div className="contact__address-actions">
                <button type="button" className="contact__chip" onClick={copy} aria-live="polite">
                  {copied ? <Check size={16} aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />}
                  {copied ? 'Dirección copiada' : 'Copiar dirección'}
                </button>
                <a className="contact__chip" href={warehouse.mapsUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink size={16} aria-hidden="true" /> Ver en el mapa
                </a>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
