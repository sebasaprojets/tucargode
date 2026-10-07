import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Send, CircleCheck, CircleAlert, RotateCcw } from 'lucide-react';
import Field from '../ui/Field';
import Button from '../ui/Button';
import { WhatsAppIcon } from '../ui/BrandIcons';
import { destinations } from '../../data/destinations';
import { submitQuote, FORM_PROVIDER } from '../../services/quoteService';
import { PREFILL_EVENT } from '../../config/events';
import { whatsappLink } from '../../config/siteConfig';
import './QuoteForm.css';

const empty = {
  firstName: '',
  lastName: '',
  email: '',
  whatsapp: '',
  city: '',
  destination: '',
  shippingType: '',
  weight: '',
  message: '',
  website: '', // honeypot anti-spam
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^\+?[0-9\s().-]{7,20}$/;

function validate(v) {
  const e = {};
  if (!v.firstName.trim()) e.firstName = 'Indica tu nombre.';
  if (!v.lastName.trim()) e.lastName = 'Indica tu apellido.';
  if (!EMAIL_RE.test(v.email.trim())) e.email = 'Introduce un email válido.';
  if (!PHONE_RE.test(v.whatsapp.trim())) e.whatsapp = 'Introduce un número con prefijo, p. ej. +49…';
  if (!v.city.trim()) e.city = 'Indica tu ciudad en Alemania.';
  if (!v.destination) e.destination = 'Elige un destino.';
  if (!v.shippingType) e.shippingType = 'Elige un tipo de envío.';
  if (v.weight && !(Number(String(v.weight).replace(',', '.')) > 0)) e.weight = 'Peso no válido.';
  return e;
}

/** Estados: idle | loading | success | error */
export default function QuoteForm() {
  const [values, setValues] = useState(empty);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [status, setStatus] = useState('idle');
  const [waUrl, setWaUrl] = useState(null);
  const formRef = useRef(null);

  useEffect(() => {
    const onPrefill = (e) => {
      const { shippingType, weight, destination } = e.detail || {};
      setValues((s) => ({ ...s, shippingType: shippingType || s.shippingType, weight: weight || s.weight, destination: destination || s.destination }));
      setStatus('idle');
    };
    window.addEventListener(PREFILL_EVENT, onPrefill);
    return () => window.removeEventListener(PREFILL_EVENT, onPrefill);
  }, []);

  const set = (k) => (e) => {
    const next = { ...values, [k]: e.target.value };
    setValues(next);
    if (touched[k]) setErrors(validate(next));
  };
  const blur = (k) => () => {
    setTouched((t) => ({ ...t, [k]: true }));
    setErrors(validate(values));
  };
  const fieldProps = (k) => ({
    name: k,
    value: values[k],
    onChange: set(k),
    onBlur: blur(k),
    error: touched[k] ? errors[k] : undefined,
    success: touched[k] && !errors[k] && values[k] ? true : undefined,
  });

  const onSubmit = async (e) => {
    e.preventDefault();
    if (values.website) return; // bot
    const errs = validate(values);
    setErrors(errs);
    setTouched(Object.fromEntries(Object.keys(empty).map((k) => [k, true])));
    if (Object.keys(errs).length) {
      formRef.current?.querySelector(`[name="${Object.keys(errs)[0]}"]`)?.focus();
      return;
    }
    setStatus('loading');
    try {
      const dest = destinations.find((d) => d.id === values.destination);
      const res = await submitQuote({ ...values, website: undefined, destinationLabel: dest?.label ?? values.destination });
      if (res.channel === 'whatsapp') {
        setWaUrl(res.url);
        window.open(res.url, '_blank', 'noopener,noreferrer');
      }
      setStatus('success');
    } catch {
      setStatus('error');
    }
  };

  const reset = () => {
    setValues(empty);
    setErrors({});
    setTouched({});
    setStatus('idle');
    setWaUrl(null);
  };

  const viaWhatsApp = FORM_PROVIDER === 'whatsapp';

  return (
    <div className="quote theme-white">
      <AnimatePresence mode="wait" initial={false}>
        {status === 'success' ? (
          <motion.div key="ok" className="quote__state" role="status" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
            <span className="quote__state-icon quote__state-icon--ok" aria-hidden="true">
              <CircleCheck size={36} />
            </span>
            <h3>{viaWhatsApp ? 'Tu solicitud está lista en WhatsApp' : '¡Solicitud enviada!'}</h3>
            <p>
              {viaWhatsApp
                ? 'Abrimos WhatsApp con tu solicitud ya redactada. Solo tienes que pulsar «Enviar» y te responderemos con tu cotización.'
                : 'Hemos recibido tu solicitud. Te contactaremos lo antes posible con tu cotización.'}
            </p>
            <div className="quote__state-actions">
              {waUrl && (
                <Button href={waUrl} variant="whatsapp" iconLeft={<WhatsAppIcon size={18} />}>
                  Abrir WhatsApp de nuevo
                </Button>
              )}
              <Button variant="ghost" onClick={reset} iconLeft={<RotateCcw size={16} aria-hidden="true" />}>
                Nueva solicitud
              </Button>
            </div>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            ref={formRef}
            className="quote__form"
            onSubmit={onSubmit}
            noValidate
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            aria-labelledby="quote-title"
          >
            <div className="quote__head">
              <h3 id="quote-title">Solicita tu cotización</h3>
              <p>Completa los datos y te respondemos con el precio de tu envío.</p>
            </div>

            {status === 'error' && (
              <div className="quote__alert" role="alert">
                <CircleAlert size={18} aria-hidden="true" />
                <span>
                  No pudimos enviar tu solicitud. Inténtalo de nuevo o{' '}
                  <a href={whatsappLink()} target="_blank" rel="noopener noreferrer">
                    escríbenos por WhatsApp
                  </a>
                  .
                </span>
              </div>
            )}

            <div className="quote__grid">
              <Field label="Nombre" autoComplete="given-name" required {...fieldProps('firstName')} />
              <Field label="Apellido" autoComplete="family-name" required {...fieldProps('lastName')} />
              <Field label="Email" type="email" autoComplete="email" inputMode="email" required {...fieldProps('email')} />
              <Field label="WhatsApp" type="tel" autoComplete="tel" inputMode="tel" placeholder="+49 …" required {...fieldProps('whatsapp')} />
              <Field label="Ciudad (Alemania)" autoComplete="address-level2" required {...fieldProps('city')} />
              <Field
                kind="select"
                label="Destino"
                required
                options={[
                  { value: '', label: 'Elige un destino' },
                  ...destinations.map((d) => ({ value: d.id, label: d.available ? d.label : `${d.label} — ruta cerrada`, disabled: !d.available })),
                ]}
                {...fieldProps('destination')}
              />
              <Field
                kind="select"
                label="Tipo de envío"
                required
                options={[
                  { value: '', label: 'Elige una opción' },
                  { value: 'air', label: 'Aéreo' },
                  { value: 'sea', label: 'Marítimo' },
                  { value: 'unsure', label: 'No lo sé todavía' },
                ]}
                {...fieldProps('shippingType')}
              />
              <Field label="Peso aproximado" type="number" inputMode="decimal" min="0" step="0.1" suffix="kg" {...fieldProps('weight')} />
            </div>
            <Field kind="textarea" label="Mensaje" placeholder="¿Qué quieres enviar? Medidas, cantidad de paquetes, fechas…" {...fieldProps('message')} />

            <div className="quote__hp" aria-hidden="true">
              <label>
                No rellenar
                <input tabIndex={-1} autoComplete="off" name="website" value={values.website} onChange={set('website')} />
              </label>
            </div>

            <Button type="submit" variant="accent" size="lg" block loading={status === 'loading'} iconRight={<Send size={18} aria-hidden="true" />}>
              {status === 'loading' ? 'Enviando…' : 'Solicitar cotización'}
            </Button>
            <p className="quote__privacy">
              {viaWhatsApp
                ? 'Al enviar se abrirá WhatsApp con tu solicitud redactada. Tus datos solo se usan para responder a tu consulta.'
                : 'Tus datos solo se usan para responder a tu consulta.'}
            </p>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
