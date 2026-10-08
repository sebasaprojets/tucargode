import { useEffect, useState } from 'react';
import { Calculator, ArrowRight } from 'lucide-react';
import { WhatsAppIcon } from '../ui/BrandIcons';
import { whatsappLink } from '../../config/siteConfig';
import './MobileActionBar.css';

/**
 * Barra de acciones fija en móvil: cotizar, calcular y WhatsApp siempre a un toque.
 * Aparece tras el hero, se oculta en la sección de contacto, con el teclado
 * abierto (al escribir en un campo) y con el menú abierto.
 */
export default function MobileActionBar() {
  const [pastHero, setPastHero] = useState(false);
  const [atContact, setAtContact] = useState(false);
  const [typing, setTyping] = useState(false);

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setPastHero(window.scrollY > window.innerHeight * 0.7));
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    let io;
    const watchContact = () => {
      const el = document.getElementById('contacto');
      if (!el) return;
      io = new IntersectionObserver(([e]) => setAtContact(e.isIntersecting), { rootMargin: '0px 0px -30% 0px' });
      io.observe(el);
    };
    watchContact();

    const isField = (t) => t?.matches?.('input, textarea, select');
    const onFocusIn = (e) => isField(e.target) && setTyping(true);
    const onFocusOut = (e) => isField(e.target) && setTyping(false);
    document.addEventListener('focusin', onFocusIn);
    document.addEventListener('focusout', onFocusOut);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      io?.disconnect();
      document.removeEventListener('focusin', onFocusIn);
      document.removeEventListener('focusout', onFocusOut);
    };
  }, []);

  const visible = pastHero && !atContact && !typing;

  return (
    <nav className={`mbar ${visible ? 'is-visible' : ''}`} aria-label="Acciones rápidas" aria-hidden={!visible}>
      <a className="mbar__primary" href="#contacto" tabIndex={visible ? 0 : -1}>
        Cotiza tu envío <ArrowRight size={18} aria-hidden="true" />
      </a>
      <a className="mbar__icon" href="#calculadora" aria-label="Calcula tu envío" tabIndex={visible ? 0 : -1}>
        <Calculator size={22} aria-hidden="true" />
      </a>
      <a
        className="mbar__icon mbar__icon--wa"
        href={whatsappLink()}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Hablar por WhatsApp"
        tabIndex={visible ? 0 : -1}
      >
        <WhatsAppIcon size={24} />
      </a>
    </nav>
  );
}
