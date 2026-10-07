import { useId, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus, ExternalLink, MessageCircle } from 'lucide-react';
import SectionHeader from '../ui/SectionHeader';
import Button from '../ui/Button';
import { RevealGroup, RevealItem } from '../ui/Reveal';
import { faq } from '../../data/faq';
import { whatsappLink } from '../../config/siteConfig';
import './FAQ.css';

function Item({ item, open, onToggle }) {
  const id = useId();
  return (
    <div className={`faq__item ${open ? 'is-open' : ''}`}>
      <h3>
        <button type="button" className="faq__q" aria-expanded={open} aria-controls={`${id}-a`} id={`${id}-q`} onClick={onToggle}>
          <span>{item.q}</span>
          <span className="faq__icon" aria-hidden="true">
            <Plus size={18} />
          </span>
        </button>
      </h3>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={`${id}-a`}
            role="region"
            aria-labelledby={`${id}-q`}
            className="faq__a"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="faq__a-inner">
              <p>{item.a}</p>
              {item.link && (
                <a href={item.link.href} target="_blank" rel="noopener noreferrer" className="faq__link">
                  {item.link.label} <ExternalLink size={14} aria-hidden="true" />
                </a>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FAQ() {
  const [open, setOpen] = useState(0);
  return (
    <section className="faq section theme-light" aria-labelledby="faq-title">
      <div className="container faq__grid">
        <div className="faq__aside">
          <SectionHeader
            id="faq-title"
            eyebrow="Preguntas frecuentes"
            title="Resolvemos tus dudas"
            lead="Lo que más nos preguntan antes de enviar. ¿No encuentras tu respuesta? Escríbenos."
          />
          <Button href={whatsappLink('Hola Tucargo, tengo una pregunta sobre un envío.')} variant="whatsapp" iconLeft={<MessageCircle size={18} aria-hidden="true" />}>
            Hablar por WhatsApp
          </Button>
        </div>
        <RevealGroup className="faq__list" stagger={0.04}>
          {faq.map((item, i) => (
            <RevealItem key={item.q}>
              <Item item={item} open={open === i} onToggle={() => setOpen(open === i ? -1 : i)} />
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
