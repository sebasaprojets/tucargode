import { useMemo, useState } from 'react';
import { AnimatePresence, m } from 'framer-motion';
import { Plane, Ship, Calculator, Scale, Box, ArrowRight, Info, TriangleAlert, Clock3 } from 'lucide-react';
import SectionHeader from '../ui/SectionHeader';
import Reveal from '../ui/Reveal';
import Field from '../ui/Field';
import Button from '../ui/Button';
import { destinations } from '../../data/destinations';
import { shippingModes, surcharges, ratesMeta } from '../../data/shippingRates';
import { validateShipment, calculateShipment } from '../../utils/shippingCalculator';
import { formatEUR, formatKg, formatNumber } from '../../utils/format';
import { whatsappLink } from '../../config/siteConfig';
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

import { PREFILL_EVENT } from '../../config/events';

export default function ShippingCalculator() {
  const [values, setValues] = useState(initial);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});

  const result = useMemo(() => {
    if (!submitted) return null;
    const errs = validateShipment(values);
    return Object.keys(errs).length ? null : calculateShipment(values);
  }, [submitted, values]);

  const set = (k) => (e) => {
    const v = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setValues((s) => ({ ...s, [k]: v }));
    if (submitted) setErrors(validateShipment({ ...values, [k]: v }));
  };

  const onSubmit = (e) => {
    e.preventDefault();
    const errs = validateShipment(values);
    setErrors(errs);
    setSubmitted(true);
    if (Object.keys(errs).length) {
      const first = e.currentTarget.querySelector(`[name="${Object.keys(errs)[0]}"]`);
      first?.focus();
    }
  };

  const requestQuote = () => {
    window.dispatchEvent(
      new CustomEvent(PREFILL_EVENT, {
        detail: {
          shippingType: values.mode,
          weight: values.weight,
          destination: values.destination,
        },
      }),
    );
  };

  const mode = shippingModes[values.mode];
  const destOptions = destinations.map((d) => ({
    value: d.id,
    label: d.available ? d.label : `${d.label} — ruta cerrada`,
    disabled: !d.available,
  }));

  return (
    <section className="calc section theme-light" aria-labelledby="calc-title">
      <div className="container">
        <SectionHeader
          id="calc-title"
          eyebrow="Calcula tu envío"
          title="Calcula tu envío en segundos"
          lead="Introduce el peso y las medidas de tu caja. Te mostramos el peso real, el volumétrico y el peso que se factura."
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
                      {opt.id === 'air' ? <Plane size={18} aria-hidden="true" /> : <Ship size={18} aria-hidden="true" />}
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
              Calcular
            </Button>
          </form>

          <div className="calc__result theme-dark" aria-live="polite">
            <AnimatePresence mode="wait">
              {!result ? (
                <m.div
                  key="empty"
                  className="calc__empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="calc__empty-art" aria-hidden="true">
                    <Box size={40} strokeWidth={1.2} />
                  </div>
                  <p className="calc__empty-title">
                    {submitted ? 'Revisa los datos marcados' : 'Tu resultado aparecerá aquí'}
                  </p>
                  <p className="calc__empty-text">
                    {submitted
                      ? 'Corrige los campos para ver el cálculo.'
                      : 'Indica el peso, las medidas y el destino, y pulsa «Calcular».'}
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
                    {result.mode === 'air' ? <Plane size={16} aria-hidden="true" /> : <Ship size={16} aria-hidden="true" />}
                    Düsseldorf → {result.destination.label}
                  </p>

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
                      <dd>{formatKg(result.billableWeight)}</dd>
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
                        <p className="calc__price-value">{formatEUR(result.total)}</p>
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

                  {result.transit && (
                    <p className="calc__transit">
                      <Clock3 size={16} aria-hidden="true" /> Tiempo estimado: {result.transit}
                    </p>
                  )}

                  <div className="calc__actions">
                    <Button href="#contacto" variant="accent" block onClick={requestQuote} iconRight={<ArrowRight size={18} />}>
                      Cotiza tu envío
                    </Button>
                    <Button
                      href={whatsappLink(
                        `Hola Tucargo, calculé un envío ${result.mode === 'air' ? 'aéreo' : 'marítimo'} a ${result.destination.label} con ${formatKg(result.billableWeight)} facturables. ¿Me confirman el precio?`,
                      )}
                      variant="secondary"
                      block
                    >
                      Confirmar por WhatsApp
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
