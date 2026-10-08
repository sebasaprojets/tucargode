import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, m, useReducedMotion } from 'framer-motion';
import { X } from 'lucide-react';
import { useBodyLock } from '../../hooks/useBodyLock';
import './Modal.css';

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])';

/** Diálogo accesible: focus trap, Esc, restauración de foco, estados opening/open/closing. */
export default function Modal({ open, onClose, title, labelledBy = 'modal-title', children }) {
  const panelRef = useRef(null);
  const lastFocus = useRef(null);
  const reduce = useReducedMotion();
  useBodyLock(open);

  useEffect(() => {
    if (!open) return undefined;
    lastFocus.current = document.activeElement;
    const t = setTimeout(() => panelRef.current?.querySelector(FOCUSABLE)?.focus(), 50);
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Tab' && panelRef.current) {
        const items = [...panelRef.current.querySelectorAll(FOCUSABLE)];
        if (!items.length) return;
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      clearTimeout(t);
      document.removeEventListener('keydown', onKey);
      lastFocus.current?.focus?.();
    };
  }, [open, onClose]);

  return createPortal(
    <AnimatePresence>
      {open && (
        <m.div
          className="modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <div className="modal__backdrop" onClick={onClose} aria-hidden="true" />
          <m.div
            ref={panelRef}
            className="modal__panel theme-white"
            data-lenis-prevent
            role="dialog"
            aria-modal="true"
            aria-labelledby={labelledBy}
            initial={reduce ? false : { opacity: 0, y: 40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.98 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="modal__head">
              <h2 id={labelledBy} className="modal__title">
                {title}
              </h2>
              <button type="button" className="modal__close" onClick={onClose} aria-label="Cerrar">
                <X size={20} />
              </button>
            </div>
            <div className="modal__body">{children}</div>
          </m.div>
        </m.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
