import { useEffect, useState } from 'react';
import { AnimatePresence, m } from 'framer-motion';
import { WhatsAppIcon } from '../ui/BrandIcons';
import { whatsappLink } from '../../config/siteConfig';
import './WhatsAppButton.css';

/** Botón flotante de WhatsApp con burbuja de invitación discreta. */
export default function WhatsAppButton() {
  const [visible, setVisible] = useState(false);
  const [hint, setHint] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 320);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!visible) return undefined;
    let dismissed = false;
    try {
      dismissed = sessionStorage.getItem('tc-wa-hint') === '1';
    } catch {
      /* storage no disponible */
    }
    if (dismissed) return undefined;
    const show = setTimeout(() => setHint(true), 2500);
    const hide = setTimeout(() => {
      setHint(false);
      try {
        sessionStorage.setItem('tc-wa-hint', '1');
      } catch {
        /* noop */
      }
    }, 9000);
    return () => {
      clearTimeout(show);
      clearTimeout(hide);
    };
  }, [visible]);

  return (
    <AnimatePresence>
      {visible && (
        <m.div
          className="wa-float"
          initial={{ opacity: 0, scale: 0.6, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.6, y: 20 }}
          transition={{ type: 'spring', stiffness: 320, damping: 22 }}
        >
          <AnimatePresence>
            {hint && (
              <m.p
                className="wa-float__hint"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                role="status"
              >
                ¿Dudas con tu envío? Escríbenos.
              </m.p>
            )}
          </AnimatePresence>
          <a
            href={whatsappLink()}
            className="wa-float__btn"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Hablar por WhatsApp con Tucargo"
            onClick={() => setHint(false)}
          >
            <WhatsAppIcon size={28} />
            <span className="wa-float__ring" aria-hidden="true" />
          </a>
        </m.div>
      )}
    </AnimatePresence>
  );
}
