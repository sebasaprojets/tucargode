import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import SectionHeader from '../ui/SectionHeader';
import { testimonials } from '../../data/content';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import './Testimonials.css';

/**
 * Slider de testimonios reales (data/content.js → testimonials).
 * Si no hay testimonios verificados, la sección no se renderiza.
 */
export default function Testimonials() {
  const desktop = useMediaQuery('(min-width: 1024px)');
  const perView = desktop ? 3 : 1;
  const pages = Math.max(1, Math.ceil(testimonials.length / perView));
  const [page, setPage] = useState(0);

  useEffect(() => setPage(0), [perView]);

  if (!testimonials.length) return null;

  const visible = testimonials.slice(page * perView, page * perView + perView);
  const go = (d) => setPage((p) => (p + d + pages) % pages);

  return (
    <section className="testimonials section theme-light" aria-labelledby="testimonials-title" aria-roledescription="carrusel">
      <div className="container">
        <SectionHeader id="testimonials-title" eyebrow="Testimonios" title="Lo que dicen nuestros clientes" />
        <div className="testimonials__track" aria-live="polite">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={`${page}-${perView}`}
              className="testimonials__page"
              style={{ '--cols': perView }}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.4 }}
            >
              {visible.map((t) => (
                <figure key={`${t.name}-${t.date}`} className="testimonial">
                  <blockquote>“{t.text}”</blockquote>
                  <figcaption>
                    <strong>{t.name}</strong>
                    <span>
                      {[t.city, t.source].filter(Boolean).join(' · ')}
                    </span>
                  </figcaption>
                </figure>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
        {pages > 1 && (
          <div className="testimonials__nav">
            <button type="button" onClick={() => go(-1)} aria-label="Testimonios anteriores">
              <ChevronLeft size={20} />
            </button>
            <span>
              {page + 1} / {pages}
            </span>
            <button type="button" onClick={() => go(1)} aria-label="Testimonios siguientes">
              <ChevronRight size={20} />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
