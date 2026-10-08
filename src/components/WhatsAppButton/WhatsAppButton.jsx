import { useEffect, useState } from 'react';
import { AnimatePresence, m } from 'framer-motion';
import { X } from 'lucide-react';
import { WhatsAppIcon } from '../ui/BrandIcons';
import { siteConfig, whatsappLink } from '../../config/siteConfig';
import './WhatsAppButton.css';

const CLOSED_KEY = 'tc-wa-bubble-closed';
const SHOW_AFTER_MS = 6000; // tiempo en la página antes de saludar
const TYPING_MS = 1600; // «escribiendo…» antes de mostrar el mensaje
const COLLAPSE_AFTER_MS = 14000; // si no interactúa, se recoge y queda un aviso en el botón

const asset = (p) => `${import.meta.env.BASE_URL}${p}`;
const read = () => {
  try {
    return localStorage.getItem(CLOSED_KEY) === '1';
  } catch {
    return false;
  }
};

/**
 * Botón flotante de WhatsApp que «inicia la conversación»: tras unos segundos
 * aparece una burbuja de chat con «escribiendo…» y un saludo. Si la persona la
 * cierra, no vuelve a aparecer (se recuerda en este navegador).
 */
export default function WhatsAppButton() {
  const [visible, setVisible] = useState(false);
  const [stage, setStage] = useState('hidden'); // hidden | typing | message | collapsed
  const [closed, setClosed] = useState(read);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 320);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Secuencia: (espera) → escribiendo… → mensaje → se recoge con un aviso
  useEffect(() => {
    if (closed || !visible || stage !== 'hidden') return undefined;
    const t1 = setTimeout(() => setStage('typing'), SHOW_AFTER_MS);
    return () => clearTimeout(t1);
  }, [closed, visible, stage]);
  useEffect(() => {
    if (stage === 'typing') {
      const t = setTimeout(() => setStage('message'), TYPING_MS);
      return () => clearTimeout(t);
    }
    if (stage === 'message') {
      const t = setTimeout(() => setStage('collapsed'), COLLAPSE_AFTER_MS);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [stage]);

  const close = () => {
    setClosed(true);
    setStage('collapsed');
    try {
      localStorage.setItem(CLOSED_KEY, '1');
    } catch {
      /* storage no disponible */
    }
  };

  const open = stage === 'typing' || stage === 'message';
  const unread = stage === 'collapsed' && !closed;

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
            {open && (
              <m.div
                className="wa-chat"
                role="status"
                initial={{ opacity: 0, y: 14, scale: 0.92 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.94 }}
                transition={{ type: 'spring', stiffness: 360, damping: 26 }}
              >
                <div className="wa-chat__head">
                  <img className="wa-chat__avatar" src={asset(siteConfig.brand.logo.webp[128])} alt="" width="36" height="36" />
                  <span className="wa-chat__who">
                    <strong>Tucargo</strong>
                    <span>
                      <i aria-hidden="true" /> {stage === 'typing' ? 'escribiendo…' : 'en línea'}
                    </span>
                  </span>
                  <button type="button" className="wa-chat__close" onClick={close} aria-label="Cerrar mensaje">
                    <X size={16} aria-hidden="true" />
                  </button>
                </div>
                <div className="wa-chat__body">
                  <AnimatePresence mode="wait" initial={false}>
                    {stage === 'typing' ? (
                      <m.span key="dots" className="wa-chat__dots" aria-label="Escribiendo" exit={{ opacity: 0 }}>
                        <span />
                        <span />
                        <span />
                      </m.span>
                    ) : (
                      <m.p key="msg" className="wa-chat__msg" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
                        ¡Hola! 👋 ¿Te ayudamos con tu envío a Venezuela?
                      </m.p>
                    )}
                  </AnimatePresence>
                </div>
                {stage === 'message' && (
                  <m.a
                    href={whatsappLink()}
                    className="wa-chat__cta"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={close}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <WhatsAppIcon size={16} /> Responder por WhatsApp
                  </m.a>
                )}
              </m.div>
            )}
          </AnimatePresence>
          <a
            href={whatsappLink()}
            className="wa-float__btn"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Hablar por WhatsApp con Tucargo"
            onClick={close}
          >
            <WhatsAppIcon size={28} />
            <span className="wa-float__ring" aria-hidden="true" />
            {unread && (
              <m.span className="wa-float__badge" initial={{ scale: 0 }} animate={{ scale: 1 }} aria-hidden="true">
                1
              </m.span>
            )}
          </a>
        </m.div>
      )}
    </AnimatePresence>
  );
}
