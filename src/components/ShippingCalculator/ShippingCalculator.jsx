import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, m } from 'framer-motion';
import { Plane, Ship, Calculator, Scale, Box, ArrowRight, Info, TriangleAlert, Clock3, Package, Sparkles } from 'lucide-react';
import SectionHeader from '../ui/SectionHeader';
import Reveal from '../ui/Reveal';
import Field from '../ui/Field';
import Button from '../ui/Button';
import ElasticSlider from '../ui/ElasticSlider';
import NumberTicker from '../ui/NumberTicker';
import { WhatsAppIcon } from '../ui/BrandIcons';
import { destinations } from '../../data/destinations';
import { shippingModes, surcharges, ratesMeta } from '../../data/shippingRates';
import { validateShipment, calculateShipment, compareModes, shipmentWhatsappMessage } from '../../utils/shippingCalculator';
import { formatEUR, formatKg, formatNumber } from '../../utils/format';
import { whatsappLink } from '../../config/siteConfig';
import { PREFILL_EVENT } from '../../config/events';
import './ShippingCalculator.css';

const initial = {
  mode: 'air',
  weight: '',
  length: '',
  width: '',
  height: '',
  destination: 'caracas',
  batteries: false,
  newItems: '',
  declaredValue: '',
};

// Rango del control deslizante (se puede escribir cualquier peso en el campo)
const SLIDER = { min: 0.5, max: 60, step: 0.5 };
const SLIDER_MARKS = [
  { value: shippingModes.air.minBillableKg, label: `${shippingModes.air.minBillableKg} kg` },
  { value: shippingModes.sea.minBillableKg, label: `${shippingModes.sea.minBillableKg} kg` },
  { value: shippingModes.air.maxKg, label: `${shippingModes.air.maxKg} kg` },
];

const ModeIcon = ({ mode, size = 16 }) =>
  mode === 'air' ? <Plane size={size} aria-hidden="true" /> : <Ship size={size} aria-hidden="true" />;

/**
 * Calculadora en vivo: el resultado se actualiza mientras el usuario escribe o
 * arrastra el peso. Compara aéreo y marítimo y prepara el mensaje de WhatsApp.
 */
export default function ShippingCalculator() {
  const [values, setValues] = useState(initial);
  const [submitted, setSubmitted] = useState(false);
  const resultRef = useRef(null);

  const liveErrors = useMemo(() => validateShipment(values), [values]);
  const valid = Object.keys(liveErrors).length === 0;
  const errors = submitted ? liveErrors : {};
  const result = useMemo(() => (valid ? calculateShipment(values) : null), [valid, values]);
  const compare = useMemo(() => (valid ? compareModes(values) : null), [valid, values]);

  const update = (k, v) => setValues((s) => ({ ...s, [k]: v }));
  const set = (k) => (e) => update(k, e.target.type === 'checkbox' ? e.target.checked : e.target.value);

  const onSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    if (!valid) {
      e.currentTarget.querySelector(`[name="${Object.keys(liveErrors)[0]}"]`)?.focus();
      return;
    }
    // En móvil el resultado queda debajo del formulario
    if (window.matchMedia('(max-width: 959px)').matches) {
      resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const requestQuote = () => {
    window.dispatchEvent(
      new CustomEvent(PREFILL_EVENT, {
        detail: { shippingType: values.mode, weight: values.weight, destination: values.destination },
      }),
    );
  };

  // Resumen para lectores de pantalla (sin anunciar cada número intermedio)
  const [announce, setAnnounce] = useState('');
  useEffect(() => {
    const t = setTimeout(() => {
      if (!result) return setAnnounce('');
      setAnnounce(
        result.total !== null
          ? `Peso facturable ${formatKg(result.billableWeight)}. Estimación ${formatEUR(result.total)}.`
          : `Peso facturable ${formatKg(result.billableWeight)}. Cotización personalizada.`,
      );
    }, 700);
    return () => clearTimeout(t);
  }, [result]);

  const mode = shippingModes[values.mode];
  const destOptions = destinations.map((d) => ({
    value: d.id,
    label: d.available ? d.label : `${d.label} — ruta cerrada`,
    disabled: !d.available,
  }));
  const weightNum = Number(String(values.weight).replace(',', '.'));

  return (
    <section className="calc section theme-light" aria-labelledby="calc-title">
      <div className="container">
        <SectionHeader
          id="calc-title"
          eyebrow="Calcula tu envío"
          title="Calcula tu envío en segundos"
          lead="Arrastra o escribe el peso y añade las medidas de tu caja. El precio se calcula al instante y te decimos qué opción te conviene."
        />

        <Reveal variant="clip" className="calc__panel">
          <form className="calc__form theme-white" onSubmit={onSubmit} noValidate aria-describedby="calc-disclaimer">
            <fieldset className="calc__fieldset">
              <legend className="calc__legend">Tipo de envío</legend>
              <div className="segmented" role="radiogroup" aria-label="Tipo de envío">
                {Object.values(shippingModes).map((opt) => (
                  <label key={opt.id} className="segmented__option">
                    <input type="radio" name="mode" value={opt.id} checked={values.mode === opt.id} onChange={set('mode')} />
                    <span className="segmented__label">
                      <ModeIcon mode={opt.id} size={18} />
                      {opt.label}
                    </span>
                  </label>
                ))}
              </div>
              <p className="calc__mode-hint">
                {values.mode === 'air'
                  ? `Desde ${mode.minBillableKg} kg hasta ${mode.maxKg} kg. Volumétrico = L × A × H / ${mode.volumetricDivisor}.`
                  : `Mínimo facturable ${mode.minBillableKg} kg. Sin límite de peso si la carga cabe en un palet.`}
              </p>
            </fieldset>

            <div className="calc__weight-block">
              <div className="calc__grid">
                <Field
                  label="Peso real"
                  name="weight"
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.01"
                  placeholder="0,00"
                  suffix="kg"
                  required
                  value={values.weight}
                  onChange={set('weight')}
                  error={errors.weight}
                  className="calc__weight"
                />
                <Field
                  kind="select"
                  label="Destino"
                  name="destination"
                  value={values.destination}
                  onChange={set('destination')}
                  options={destOptions}
                  error={errors.destination}
                  required
                  className="calc__dest"
                />
              </div>
              <ElasticSlider
                label="Peso real en kilos"
                value={values.weight}
                valueText={values.weight ? formatKg(weightNum || 0) : 'Sin peso'}
                onChange={(v) => update('weight', String(v))}
                min={SLIDER.min}
                max={SLIDER.max}
                step={SLIDER.step}
                marks={SLIDER_MARKS}
                startIcon={<Package size={16} />}
                endIcon={<Package size={24} />}
              />
              <p className="calc__slider-hint">
                {shippingModes.air.minBillableKg} kg mínimo aéreo · {shippingModes.sea.minBillableKg} kg mínimo marítimo ·{' '}
                {shippingModes.air.maxKg} kg máximo aéreo
              </p>
            </div>

            <fieldset className="calc__fieldset">
              <legend className="calc__legend">
                Medidas de la caja <span className="calc__optional">(opcional, recomendado)</span>
              </legend>
              <div className="calc__dims">
                {[
                  ['length', 'Largo'],
                  ['width', 'Ancho'],
                  ['height', 'Alto'],
                ].map(([k, label]) => (
                  <Field
                    key={k}
                    label={label}
                    name={k}
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="0.1"
                    placeholder="0"
                    suffix="cm"
                    value={values[k]}
                    onChange={set(k)}
                    error={errors[k]}
                  />
                ))}
              </div>
            </fieldset>

            <details className="calc__extras">
              <summary>Recargos opcionales</summary>
              <div className="calc__extras-body">
                {values.mode === 'air' && (
                  <label className="check">
                    <input type="checkbox" name="batteries" checked={values.batteries} onChange={set('batteries')} />
                    <span>
                      Contiene {surcharges.batteries.label.toLowerCase()} (+{formatEUR(surcharges.batteries.amount)}{' '}
                      {surcharges.batteries.unit})
                    </span>
                  </label>
                )}
                <div className="calc__grid">
                  <Field
                    label="Artículos nuevos a asegurar"
                    name="newItems"
                    type="number"
                    inputMode="numeric"
                    min="0"
                    step="1"
                    placeholder="0"
                    value={values.newItems}
                    onChange={set('newItems')}
                    error={errors.newItems}
                    hint={`${formatEUR(surcharges.newItemInsurance.amount)} ${surcharges.newItemInsurance.unit}`}
                  />
                  <Field
                    label="Valor del contenido"
                    name="declaredValue"
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="1"
                    placeholder="0"
                    suffix="€"
                    value={values.declaredValue}
                    onChange={set('declaredValue')}
                    error={errors.declaredValue}
                    hint={`Para estimar el recargo aduanal (${formatNumber(surcharges.customs.percent)} %)`}
                  />
                </div>
              </div>
            </details>

            <Button type="submit" variant="primary" size="lg" block iconLeft={<Calculator size={18} aria-hidden="true" />}>
              Ver mi resultado
            </Button>
          </form>

          <div ref={resultRef} className="calc__result theme-dark">
            <p className="visually-hidden" aria-live="polite">
              {announce}
            </p>
            <AnimatePresence mode="wait" initial={false}>
              {!result ? (
                <m.div key="empty" className="calc__empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <div className="calc__empty-art" aria-hidden="true">
                    <Box size={40} strokeWidth={1.2} />
                  </div>
                  <p className="calc__empty-title">{submitted ? 'Revisa los datos marcados' : 'Tu resultado aparecerá aquí'}</p>
                  <p className="calc__empty-text">
                    {submitted ? 'Corrige los campos para ver el cálculo.' : 'Arrastra o escribe el peso: el precio aparece al instante.'}
                  </p>
                </m.div>
              ) : (
                <m.div
                  key="result"
                  className="calc__out"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                >
                  <p className="calc__out-route">
                    <ModeIcon mode={result.mode} />
                    Düsseldorf → {result.destination.label}
                  </p>

                  <div className="calc__price">
                    {result.quoteRequired ? (
                      <>
                        <p className="calc__price-label">Precio</p>
                        <p className="calc__price-value calc__price-value--quote">Cotización personalizada</p>
                        <p className="calc__price-sub">El envío marítimo se cotiza según tu carga.</p>
                      </>
                    ) : (
                      <>
                        <p className="calc__price-label">Estimación de flete</p>
                        <NumberTicker className="calc__price-value" value={result.total} format={formatEUR} />
                        <p className="calc__price-sub">
                          {formatKg(result.billableWeight)} × {formatEUR(result.rate)}/kg = {formatEUR(result.freight)}
                          {result.extras.map((x) => (
                            <span key={x.id}>
                              <br />+ {x.label}: {formatEUR(x.total)}
                            </span>
                          ))}
                        </p>
                      </>
                    )}
                    {result.customs && (
                      <p className="calc__price-sub calc__customs">
                        Recargo aduanal estimado ({formatNumber(result.customs.percent)} % sobre {formatEUR(Number(values.declaredValue))}):{' '}
                        <strong>{formatEUR(result.customs.total)}</strong> — {result.customs.note}
                      </p>
                    )}
                  </div>

                  <dl className="calc__weights">
                    <div>
                      <dt>Peso real</dt>
                      <dd>{formatKg(result.realWeight)}</dd>
                    </div>
                    <div>
                      <dt>{result.mode === 'air' ? 'Peso volumétrico' : 'Volumen'}</dt>
                      <dd>
                        {result.mode === 'air'
                          ? result.volumetricWeight !== null
                            ? formatKg(Math.round(result.volumetricWeight * 100) / 100)
                            : '—'
                          : result.volumeM3 !== null
                            ? `${formatNumber(result.volumeM3, 3)} m³`
                            : '—'}
                      </dd>
                    </div>
                    <div className="calc__billable">
                      <dt>
                        <Scale size={16} aria-hidden="true" /> Peso facturable
                      </dt>
                      <dd>
                        <NumberTicker value={result.billableWeight} format={formatKg} duration={0.5} />
                      </dd>
                    </div>
                  </dl>

                  <ul className="calc__notes" role="list">
                    {result.appliedMinimum && (
                      <li>
                        <Info size={14} aria-hidden="true" /> Se aplica el mínimo facturable de {formatKg(shippingModes[result.mode].minBillableKg)}.
                      </li>
                    )}
                    {result.billedBy === 'volumetric' && (
                      <li>
                        <Info size={14} aria-hidden="true" /> Se factura por peso volumétrico (es mayor que el real).
                      </li>
                    )}
                    {result.mode === 'sea' && result.volumeFt3 !== null && (
                      <li>
                        <Info size={14} aria-hidden="true" /> Equivale a {formatNumber(result.volumeFt3, 2)} ft³.
                      </li>
                    )}
                    {result.warnings.map((w) => (
                      <li key={w} className="is-warning">
                        <TriangleAlert size={14} aria-hidden="true" /> {w}
                      </li>
                    ))}
                  </ul>

                  {compare && <Comparison compare={compare} current={values.mode} onPick={(md) => update('mode', md)} />}

                  <div className="calc__actions">
                    <Button
                      href={whatsappLink(shipmentWhatsappMessage(values, result, { formatKg, formatEUR, formatNumber }))}
                      variant="whatsapp"
                      block
                      iconLeft={<WhatsAppIcon size={18} />}
                    >
                      Enviar cotización por WhatsApp
                    </Button>
                    <Button href="#contacto" variant="secondary" block onClick={requestQuote} iconRight={<ArrowRight size={18} />}>
                      Solicitar cotización formal
                    </Button>
                  </div>
                </m.div>
              )}
            </AnimatePresence>
            <p id="calc-disclaimer" className="calc__disclaimer">
              {ratesMeta.disclaimer} Esta calculadora es orientativa y no constituye una cotización oficial.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/** Aéreo vs marítimo lado a lado: precio, plazo y la mejor opción para esta carga. */
function Comparison({ compare, current, onPick }) {
  const { air, sea, airAllowed, best, reason } = compare;
  const weeks = air.zone?.transitWeeks ?? { air: 3, sea: 10.5 };
  const maxWeeks = Math.max(weeks.air, weeks.sea);
  const rows = [
    {
      id: 'air',
      r: air,
      price: airAllowed && air.total !== null ? formatEUR(air.total) : `Hasta ${shippingModes.air.maxKg} kg`,
      priceBar: airAllowed && air.total !== null ? 1 : 0,
      time: air.transit,
      timeBar: weeks.air / maxWeeks,
      disabled: !airAllowed,
    },
    {
      id: 'sea',
      r: sea,
      price: 'A cotizar',
      priceBar: null, // sin tarifa publicada: barra «pendiente»
      time: sea.transit,
      timeBar: weeks.sea / maxWeeks,
      disabled: false,
    },
  ];

  return (
    <div className="calc__compare">
      <p className="calc__compare-title">Aéreo vs. marítimo para tu carga</p>
      <div className="calc__compare-grid">
        {rows.map((row) => (
          <button
            key={row.id}
            type="button"
            className={`ccard ${current === row.id ? 'is-current' : ''} ${best === row.id ? 'is-best' : ''} ${row.disabled ? 'is-disabled' : ''}`}
            onClick={() => onPick(row.id)}
            aria-pressed={current === row.id}
          >
            {best === row.id && (
              <span className="ccard__badge">
                <Sparkles size={12} aria-hidden="true" /> Mejor opción para ti
              </span>
            )}
            <span className="ccard__head">
              <ModeIcon mode={row.id} size={18} />
              {shippingModes[row.id].label}
            </span>
            <span className="ccard__metric">
              <span className="ccard__label">Precio</span>
              <span className="ccard__value">{row.price}</span>
              <span className="ccard__bar">
                <m.span
                  className={`ccard__fill ${row.priceBar === null ? 'is-pending' : ''}`}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: row.priceBar === null ? 1 : row.priceBar }}
                  transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                />
              </span>
            </span>
            <span className="ccard__metric">
              <span className="ccard__label">
                <Clock3 size={12} aria-hidden="true" /> Plazo
              </span>
              <span className="ccard__value ccard__value--sm">{row.time}</span>
              <span className="ccard__bar">
                <m.span
                  className="ccard__fill ccard__fill--time"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: row.timeBar }}
                  transition={{ duration: 0.9, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                />
              </span>
            </span>
          </button>
        ))}
      </div>
      <p className="calc__compare-reason">{reason}</p>
    </div>
  );
}
