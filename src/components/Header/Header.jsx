import { useEffect, useState } from 'react';
import { AnimatePresence, m } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import Logo from '../ui/Logo';
import Button from '../ui/Button';
import { WhatsAppIcon, InstagramIcon } from '../ui/BrandIcons';
import { navItems, siteConfig, whatsappLink } from '../../config/siteConfig';
import { useScrolled, useActiveSection } from '../../hooks/useScrollAnimation';
import { useBodyLock } from '../../hooks/useBodyLock';
import './Header.css';
import { useReduceMotion } from '../../hooks/useMotionPreference';

const ids = navItems.map((n) => n.id);

export default function Header() {
  const scrolled = useScrolled(24);
  const active = useActiveSection(ids);
  const [open, setOpen] = useState(false);
  const reduce = useReduceMotion();
  useBodyLock(open);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  useEffect(() => {
    const mql = window.matchMedia('(min-width: 1200px)');
    const onChange = () => mql.matches && setOpen(false);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  return (
    <>
      <header className={`header ${scrolled || open ? 'is-scrolled' : ''} ${open ? 'is-open' : ''}`}>
        <div className="header__inner container">
          <a href="#inicio" className="header__logo" onClick={() => setOpen(false)}>
            <Logo />
          </a>

          <nav className="header__nav" aria-label="Principal">
            <ul role="list">
              {navItems.map((item) => (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    className={`header__link ${active === item.id ? 'is-active' : ''}`}
                    aria-current={active === item.id ? 'true' : undefined}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="header__actions">
            <a
              className="header__wa"
              href={whatsappLink()}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Hablar por WhatsApp"
            >
              <WhatsAppIcon size={20} />
            </a>
            <Button href="#contacto" variant="accent" size="sm" className="header__cta">
              Cotiza tu envío
            </Button>
            <button
              type="button"
              className="header__burger"
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
              onClick={() => setOpen((v) => !v)}
            >
              <span />
              <span />
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <m.div
            id="mobile-menu"
            className="mmenu theme-dark"
            data-lenis-prevent
            role="dialog"
            aria-modal="true"
            aria-label="Menú"
            initial={reduce ? { opacity: 0 } : { clipPath: 'circle(0% at calc(100% - 40px) 36px)' }}
            animate={reduce ? { opacity: 1 } : { clipPath: 'circle(150% at calc(100% - 40px) 36px)' }}
            exit={reduce ? { opacity: 0 } : { clipPath: 'circle(0% at calc(100% - 40px) 36px)' }}
            transition={{ duration: 0.6, ease: [0.65, 0, 0.35, 1] }}
          >
            <div className="mmenu__glow" aria-hidden="true" />
            <nav className="mmenu__nav container" aria-label="Menú móvil">
              <m.ul
                role="list"
                initial="hidden"
                animate="show"
                variants={{ show: { transition: { staggerChildren: 0.045, delayChildren: 0.2 } } }}
              >
                {navItems.map((item, i) => (
                  <m.li
                    key={item.id}
                    variants={{ hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0 } }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <a
                      href={`#${item.id}`}
                      className={`mmenu__link ${active === item.id ? 'is-active' : ''}`}
                      onClick={() => setOpen(false)}
                    >
                      <span className="mmenu__index">{String(i + 1).padStart(2, '0')}</span>
                      {item.label}
                      <ArrowRight size={20} className="mmenu__arrow" aria-hidden="true" />
                    </a>
                  </m.li>
                ))}
              </m.ul>
            </nav>
            <m.div
              className="mmenu__footer container"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0, transition: { delay: 0.5 } }}
            >
              <Button href="#contacto" variant="accent" block onClick={() => setOpen(false)}>
                Cotiza tu envío
              </Button>
              <Button href={whatsappLink()} variant="whatsapp" block iconLeft={<WhatsAppIcon size={18} />}>
                Hablar por WhatsApp
              </Button>
              <div className="mmenu__meta">
                <a href={siteConfig.contact.phoneHref}>{siteConfig.contact.phoneDisplay}</a>
                <a href={siteConfig.social.instagram.url} target="_blank" rel="noopener noreferrer">
                  <InstagramIcon size={16} /> {siteConfig.social.instagram.handle}
                </a>
              </div>
            </m.div>
          </m.div>
        )}
      </AnimatePresence>
    </>
  );
}
