import { useId, useMemo, useState } from 'react';
import { AnimatePresence, m } from 'framer-motion';
import { Plus, ExternalLink, MessageCircle, Search, X } from 'lucide-react';
import SectionHeader from '../ui/SectionHeader';
import Button from '../ui/Button';
import { faq } from '../../data/faq';
import { whatsappLink } from '../../config/siteConfig';
import './FAQ.css';

/** Normaliza para buscar sin tildes ni mayúsculas («aduana» encuentra «Aduana»). */
const norm = (t) => t.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

/** Atajos de búsqueda frecuentes (solo se muestran si tienen resultados). */
const TOPICS = ['Tarifa', 'Peso', 'Tiempo', 'Recogida', 'Prohibidos', 'Seguro', 'Electrónicos'];

/** Sinónimos: lo que la gente escribe → cómo aparece en las respuestas. */
const SYNONYMS = {
  precio: ['tarifa', '€'],
  costo: ['tarifa', '€'],
  cuesta: ['tarifa', '€'],
  pagar: ['pago', 'paypal'],
  tiempo: ['tarda', 'dias'],
  demora: ['tarda'],
  dias: ['tarda'],
  celular: ['electronic', 'bateria'],
  telefono: ['electronic', 'bateria'],
  movil: ['electronic', 'bateria'],
  laptop: ['electronic', 'bateria'],
  caja: ['peso', 'volumetric'],
  medidas: ['volumetric'],
  aduana: ['recargo', 'prohibid'],
  dhl: ['recogida'],
  almacen: ['almacen', 'casillero'],
};
/** ¿La pregunta coincide con la búsqueda (o con alguno de sus sinónimos)? */
const matches = (item, q) => {
  const text = norm(`${item.q} ${item.a}`);
  return text.includes(q) || (SYNONYMS[q] ?? []).some((s) => text.includes(s));
};

/** Resalta en la pregunta el texto buscado. */
function Highlight({ text, query }) {
  const q = norm(query.trim());
  if (!q) return text;
  const i = norm(text).indexOf(q);
  if (i < 0) return text;
  return (
    <>
      {text.slice(0, i)}
      <mark>{text.slice(i, i + q.length)}</mark>
      {text.slice(i + q.length)}
    </>
  );
}

function Item({ item, open, onToggle, query = '' }) {
  const id = useId();
  return (
    <div className={`faq__item ${open ? 'is-open' : ''}`}>
      <h3>
        <button type="button" className="faq__q" aria-expanded={open} aria-controls={`${id}-a`} id={`${id}-q`} onClick={onToggle}>
          <span>
            <Highlight text={item.q} query={query} />
          </span>
          <span className="faq__icon" aria-hidden="true">
            <Plus size={18} />
          </span>
        </button>
      </h3>
      <AnimatePresence initial={false}>
        {open && (
          <m.div
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
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FAQ() {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(faq[0].q);

  const results = useMemo(() => {
    const q = norm(query.trim());
    if (!q) return faq;
    return faq.filter((it) => matches(it, q));
  }, [query]);
  const topics = useMemo(() => TOPICS.filter((t) => faq.some((it) => matches(it, norm(t)))), []);

  const search = (v) => {
    setQuery(v);
    const q = norm(v.trim());
    // al buscar se abre la primera coincidencia
    if (q) setOpen(faq.find((it) => matches(it, q))?.q ?? null);
  };

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
        <div className="faq__main">
          <div className="faq__search" role="search">
            <Search size={18} className="faq__search-icon" aria-hidden="true" />
            <input
              type="search"
              className="faq__search-input"
              placeholder="Buscar pregunta… (precio, peso, tiempo…)"
              aria-label="Buscar en las preguntas frecuentes"
              value={query}
              onChange={(e) => search(e.target.value)}
              enterKeyHint="search"
            />
            {query && (
              <button type="button" className="faq__search-clear" onClick={() => search('')} aria-label="Borrar búsqueda">
                <X size={16} aria-hidden="true" />
              </button>
            )}
          </div>
          <div className="faq__topics" aria-label="Temas frecuentes">
            {topics.map((t) => (
              <button
                key={t}
                type="button"
                className={`faq__topic ${norm(query) === norm(t) ? 'is-active' : ''}`}
                onClick={() => search(norm(query) === norm(t) ? '' : t)}
                aria-pressed={norm(query) === norm(t)}
              >
                {t}
              </button>
            ))}
          </div>
          <p className="faq__count" aria-live="polite">
            {query.trim() ? `${results.length} ${results.length === 1 ? 'resultado' : 'resultados'}` : ''}
          </p>

          <div className="faq__list">
            <AnimatePresence initial={false} mode="popLayout">
              {results.map((item) => (
                <m.div
                  key={item.q}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                >
                  <Item item={item} query={query} open={open === item.q} onToggle={() => setOpen(open === item.q ? null : item.q)} />
                </m.div>
              ))}
            </AnimatePresence>
            {results.length === 0 && (
              <div className="faq__empty">
                <p className="faq__empty-title">No encontramos «{query.trim()}» en las preguntas frecuentes.</p>
                <p>Escríbenos y te respondemos personalmente.</p>
                <Button
                  href={whatsappLink(`Hola Tucargo, tengo una pregunta: ${query.trim()}`)}
                  variant="whatsapp"
                  size="sm"
                  iconLeft={<MessageCircle size={16} aria-hidden="true" />}
                >
                  Preguntar por WhatsApp
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
