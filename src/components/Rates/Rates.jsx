import { Plane, Ship, ExternalLink, CircleAlert } from 'lucide-react';
import SectionHeader from '../ui/SectionHeader';
import Reveal from '../ui/Reveal';
import { rateZones, surcharges, transitNotes, ratesMeta } from '../../data/shippingRates';
import { mainCities } from '../../data/destinations';
import { siteConfig } from '../../config/siteConfig';
import { formatEUR, formatNumber } from '../../utils/format';
import './Rates.css';

export default function Rates() {
  const zones = Object.values(rateZones);
  const extra = Object.values(surcharges);
  return (
    <section className="rates section theme-white" aria-labelledby="rates-title">
      <div className="container">
        <SectionHeader
          id="rates-title"
          eyebrow="Tarifas transparentes"
          title="Tarifas y tiempos de referencia"
          lead="Precios por kilo y plazos aproximados por destino. Sin letra pequeña: aquí tienes también todos los recargos."
        />
        <Reveal className="rates__table-wrap">
          <table className="rates__table">
            <caption className="visually-hidden">Tarifas por destino y tipo de envío</caption>
            <thead>
              <tr>
                <th scope="col">Destino</th>
                <th scope="col">
                  <Plane size={16} aria-hidden="true" /> Aéreo
                </th>
                <th scope="col">
                  <Ship size={16} aria-hidden="true" /> Marítimo
                </th>
              </tr>
            </thead>
            <tbody>
              {zones.map((z) => (
                <tr key={z.id}>
                  <th scope="row">
                    <strong>{z.label}</strong>
                    <span>{z.id === 'main' ? mainCities.join(' · ') : 'Consulta tu ciudad'}</span>
                  </th>
                  <td data-label="Aéreo">
                    <strong className="rates__price">
                      {z.rates.air !== null ? `${formatEUR(z.rates.air)}` : 'A consultar'}
                      {z.rates.air !== null && <small>/kg</small>}
                    </strong>
                    <span>{z.transit.air}</span>
                  </td>
                  <td data-label="Marítimo">
                    <strong className="rates__price">
                      {z.rates.sea !== null ? formatEUR(z.rates.sea) : 'Cotización'}
                      {z.rates.sea !== null && <small>/kg</small>}
                    </strong>
                    <span>{z.transit.sea}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="rates__closed">
            <CircleAlert size={16} aria-hidden="true" /> Actualmente no ofrecemos envíos hacia la Isla de Margarita.
          </p>
        </Reveal>

        <div className="rates__grid">
          <Reveal className="rates__box">
            <h3>Recargos</h3>
            <ul role="list">
              {extra.map((s) => (
                <li key={s.id}>
                  <span>
                    {s.label}
                    {s.note && <small>{s.note}</small>}
                  </span>
                  <strong>
                    {s.percent ? `${formatNumber(s.percent)} %` : formatEUR(s.amount)}
                    <small>{s.unit}</small>
                  </strong>
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal className="rates__box" delay={0.08}>
            <h3>Cómo se cuentan los plazos</h3>
            <p>
              <strong>Aéreo.</strong> {transitNotes.air}
            </p>
            <p>
              <strong>Marítimo.</strong> {transitNotes.sea}
            </p>
            <p>
              <strong>Kilos.</strong> No se fraccionan: si tu paquete pesa 5,10 kg se facturan 6,00 kg.
            </p>
            <a className="rates__link" href={siteConfig.resources.ratesAndFormsUrl} target="_blank" rel="noopener noreferrer">
              Planillas y artículos prohibidos <ExternalLink size={14} aria-hidden="true" />
            </a>
          </Reveal>
        </div>
        <p className="rates__disclaimer">{ratesMeta.disclaimer}</p>
      </div>
    </section>
  );
}
