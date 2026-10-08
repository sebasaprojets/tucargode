import { useCallback, useState } from 'react';
import { AnimatePresence, m } from 'framer-motion';
import { ArrowLeft, Calculator, Plane, Ship, MessageCircle, RotateCcw } from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { weightOptions, urgencyOptions, recommendShipping } from '../../utils/recommendShipping';
import { whatsappLink } from '../../config/siteConfig';

const slide = {
  initial: { opacity: 0, x: 24 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -24 },
  transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
};

export default function ShippingAssistant({ open, onClose }) {
  const [weight, setWeight] = useState(null);
  const [urgency, setUrgency] = useState(null);
  const step = !weight ? 0 : !urgency ? 1 : 2;
  const result = weight && urgency ? recommendShipping(weight, urgency) : null;

  const reset = () => {
    setWeight(null);
    setUrgency(null);
  };
  const close = useCallback(() => {
    onClose();
    setTimeout(() => {
      setWeight(null);
      setUrgency(null);
    }, 300);
  }, [onClose]);

  const weightLabel = weightOptions.find((o) => o.id === weight)?.label;
  const urgencyLabel = urgencyOptions.find((o) => o.id === urgency)?.label;

  return (
    <Modal open={open} onClose={close} title="¿Cuál es mejor para mí?" labelledBy="assistant-title">
      <div className="assistant">
        <div className="assistant__progress" aria-hidden="true">
          {[0, 1, 2].map((i) => (
            <span key={i} className={i <= step ? 'is-done' : ''} />
          ))}
        </div>
        <p className="visually-hidden" aria-live="polite">
          Paso {step + 1} de 3
        </p>
        <AnimatePresence mode="wait" initial={false}>
          {step === 0 && (
            <m.fieldset key="w" className="assistant__step" {...slide}>
              <legend>¿Cuánto pesa tu envío aproximadamente?</legend>
              <div className="assistant__options">
                {weightOptions.map((o) => (
                  <button key={o.id} type="button" className="assistant__option" onClick={() => setWeight(o.id)}>
                    {o.label}
                  </button>
                ))}
              </div>
            </m.fieldset>
          )}
          {step === 1 && (
            <m.fieldset key="u" className="assistant__step" {...slide}>
              <legend>¿Qué tan urgente es?</legend>
              <div className="assistant__options assistant__options--col">
                {urgencyOptions.map((o) => (
                  <button key={o.id} type="button" className="assistant__option" onClick={() => setUrgency(o.id)}>
                    <strong>{o.label}</strong>
                    <span>{o.hint}</span>
                  </button>
                ))}
              </div>
              <button type="button" className="assistant__back" onClick={() => setWeight(null)}>
                <ArrowLeft size={16} aria-hidden="true" /> Volver
              </button>
            </m.fieldset>
          )}
          {step === 2 && result && (
            <m.div key="r" className="assistant__step" {...slide} aria-live="polite">
              <div className={`assistant__result assistant__result--${result.mode}`}>
                <span className="assistant__result-icon" aria-hidden="true">
                  {result.mode === 'sea' ? <Ship size={28} /> : result.mode === 'contact' ? <MessageCircle size={28} /> : <Plane size={28} />}
                </span>
                <p className="assistant__summary">
                  {weightLabel} · {urgencyLabel}
                </p>
                <h3>{result.title}</h3>
                <p>{result.reason}</p>
              </div>
              <p className="assistant__disclaimer">
                Recomendación orientativa, no es un cálculo ni una cotización oficial.
              </p>
              <div className="assistant__actions">
                {result.mode !== 'contact' && result.mode !== 'sea' && (
                  <Button href="#calculadora" variant="primary" block onClick={close} iconLeft={<Calculator size={18} aria-hidden="true" />}>
                    Calcula tu envío
                  </Button>
                )}
                <Button
                  href={whatsappLink(`Hola Tucargo, quisiera asesoría para un envío de ${weightLabel} (${urgencyLabel}).`)}
                  variant="whatsapp"
                  block
                >
                  Hablar por WhatsApp
                </Button>
                <Button variant="ghost" onClick={reset} iconLeft={<RotateCcw size={16} aria-hidden="true" />}>
                  Empezar de nuevo
                </Button>
              </div>
            </m.div>
          )}
        </AnimatePresence>
      </div>
    </Modal>
  );
}
