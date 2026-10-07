import { useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Search, PackageCheck, Plane, FileCheck2, Truck, House, CircleAlert, MessageCircle } from 'lucide-react';
import SectionHeader from '../ui/SectionHeader';
import Reveal from '../ui/Reveal';
import Button from '../ui/Button';
import { TRACKING_STAGES, fetchTracking, normalizeTrackingCode } from '../../services/trackingService';
import { whatsappLink } from '../../config/siteConfig';
import './Tracking.css';

const stageIcons = [PackageCheck, Plane, FileCheck2, Truck, House];

function Timeline({ current = -1 }) {
  return (
    <ol className="ttl" role="list">
      {TRACKING_STAGES.map((s, i) => {
        const Icon = stageIcons[i];
        const state = i < current ? 'is-done' : i === current ? 'is-current' : '';
        return (
          <li key={s.id} className={`ttl__item ${state}`} aria-current={i === current ? 'step' : undefined}>
            <span className="ttl__node" aria-hidden="true">
              <Icon size={18} strokeWidth={1.8} />
            </span>
            <span className="ttl__text">
              <strong>{s.label}</strong>
              <span>{s.description}</span>
            </span>
          </li>
        );
      })}
    </ol>
  );
}

export default function Tracking() {
  const [code, setCode] = useState('');
  const [state, setState] = useState({ status: 'idle' });
  const [error, setError] = useState('');
  const abortRef = useRef(null);

  const onSubmit = async (e) => {
    e.preventDefault();
    const normalized = normalizeTrackingCode(code);
    if (normalized.length < 4) {
      setError('Introduce un número de seguimiento válido.');
      return;
    }
    setError('');
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setState({ status: 'loading' });
    try {
      const res = await fetchTracking(normalized, { signal: ctrl.signal });
      setState(res);
    } catch (err) {
      if (err.name !== 'AbortError') setState({ status: 'error', code: normalized });
    }
  };

  const waMsg = (c) => `Hola Tucargo, quisiera consultar el estado de mi envío. Número de seguimiento: ${c}`;

  return (
    <section className="tracking section theme-dark noise" aria-labelledby="tracking-title">
      <div className="tracking__glow" aria-hidden="true" />
      <div className="container tracking__inner">
        <SectionHeader
          id="tracking-title"
          eyebrow="Seguimos tu carga"
          title="¿Dónde está mi envío?"
          lead="Introduce tu número de seguimiento para consultar en qué etapa se encuentra tu carga."
          align="center"
        />

        <Reveal as="form" className="tracking__form" onSubmit={onSubmit} noValidate role="search">
          <label htmlFor="tracking-code" className="visually-hidden">
            Número de seguimiento
          </label>
          <div className={`tracking__input ${error ? 'is-error' : ''}`}>
            <Search size={20} aria-hidden="true" />
            <input
              id="tracking-code"
              name="tracking"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Número de seguimiento"
              autoComplete="off"
              autoCapitalize="characters"
              spellCheck="false"
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? 'tracking-error' : undefined}
            />
            <Button type="submit" variant="primary" loading={state.status === 'loading'}>
              Consultar
            </Button>
          </div>
          {error && (
            <p id="tracking-error" className="tracking__error" role="alert">
              {error}
            </p>
          )}
        </Reveal>

        <div className="tracking__result" aria-live="polite">
          <AnimatePresence mode="wait">
            {state.status === 'found' && (
              <motion.div key="found" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <p className="tracking__status">
                  Envío <strong>{state.code}</strong> · {TRACKING_STAGES[state.data.stageIndex].label}
                </p>
                <Timeline current={state.data.stageIndex} />
              </motion.div>
            )}

            {(state.status === 'unavailable' || state.status === 'not_found' || state.status === 'error') && (
              <motion.div key={state.status} className="tracking__notice" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <CircleAlert size={22} aria-hidden="true" />
                <div>
                  <p className="tracking__notice-title">
                    {state.status === 'unavailable' && 'La consulta en línea estará disponible próximamente'}
                    {state.status === 'not_found' && 'No encontramos ese número de seguimiento'}
                    {state.status === 'error' && 'No pudimos consultar el seguimiento ahora mismo'}
                  </p>
                  <p>
                    Mientras tanto, te informamos del estado de tu envío <strong>{state.code}</strong> por WhatsApp al instante.
                  </p>
                  <Button href={whatsappLink(waMsg(state.code))} variant="whatsapp" size="sm" iconLeft={<MessageCircle size={16} aria-hidden="true" />}>
                    Consultar por WhatsApp
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {state.status !== 'found' && (
            <div className="tracking__preview">
              <p className="tracking__preview-label">Etapas de tu envío</p>
              <Timeline current={-1} />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
