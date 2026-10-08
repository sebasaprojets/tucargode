import { shippingModes, rateZones, surcharges } from '../data/shippingRates';
import { getDestination } from '../data/destinations';

const toNumber = (v) => {
  if (v === '' || v === null || v === undefined) return NaN;
  return Number(String(v).replace(',', '.'));
};

/** Valida las entradas. Devuelve { field: mensaje } */
export function validateShipment(input) {
  const errors = {};
  const mode = shippingModes[input.mode];
  if (!mode) errors.mode = 'Elige un tipo de envío.';

  const weight = toNumber(input.weight);
  if (!(weight > 0)) errors.weight = 'Indica un peso mayor que 0.';
  else if (weight > 5000) errors.weight = 'Para cargas de este tamaño, solicita una cotización.';

  ['length', 'width', 'height'].forEach((k) => {
    const v = toNumber(input[k]);
    if (input[k] === '' || input[k] === undefined) return; // medidas opcionales
    if (!(v > 0)) errors[k] = 'Valor no válido.';
    else if (v > 400) errors[k] = 'Máximo 400 cm.';
  });

  const dest = getDestination(input.destination);
  if (!dest) errors.destination = 'Elige un destino.';
  else if (!dest.available) errors.destination = dest.unavailableReason;

  const declared = toNumber(input.declaredValue);
  if (input.declaredValue !== '' && input.declaredValue !== undefined && !(declared >= 0)) {
    errors.declaredValue = 'Valor no válido.';
  }
  const newItems = toNumber(input.newItems);
  if (input.newItems !== '' && input.newItems !== undefined && !(Number.isInteger(newItems) && newItems >= 0)) {
    errors.newItems = 'Indica un número entero.';
  }
  return errors;
}

/**
 * Calcula pesos y una estimación de costo.
 * No es una cotización oficial: los valores dependen de shippingRates.js.
 */
export function calculateShipment(input) {
  const mode = shippingModes[input.mode];
  const dest = getDestination(input.destination);
  const zone = dest?.zone ? rateZones[dest.zone] : null;

  const realWeight = toNumber(input.weight);
  const l = toNumber(input.length);
  const w = toNumber(input.width);
  const h = toNumber(input.height);
  const hasDims = l > 0 && w > 0 && h > 0;

  const volumeCm3 = hasDims ? l * w * h : 0;
  const volumeM3 = volumeCm3 / 1_000_000;
  const volumetricWeight = hasDims && mode.volumetricDivisor ? volumeCm3 / mode.volumetricDivisor : null;

  const heaviest = Math.max(realWeight, volumetricWeight ?? 0);
  const rounded = mode.roundUpToKg ? Math.ceil(heaviest - 1e-9) : heaviest;
  const billableWeight = Math.max(rounded, mode.minBillableKg);
  const appliedMinimum = rounded < mode.minBillableKg;
  const billedBy = volumetricWeight && volumetricWeight > realWeight ? 'volumetric' : 'real';

  const warnings = [];
  if (mode.maxKg && heaviest > mode.maxKg) {
    warnings.push(
      `El envío aéreo admite hasta ${mode.maxKg} kg. Para más peso, consulta el envío marítimo o una cotización personalizada.`,
    );
  }

  const rate = zone?.rates?.[mode.id] ?? null;
  const freight = rate !== null ? billableWeight * rate : null;

  const extras = [];
  if (input.batteries && mode.id === 'air') {
    extras.push({ ...surcharges.batteries, total: surcharges.batteries.amount });
  }
  const newItems = toNumber(input.newItems) || 0;
  if (newItems > 0) {
    extras.push({
      ...surcharges.newItemInsurance,
      label: `${surcharges.newItemInsurance.label} (${newItems})`,
      total: newItems * surcharges.newItemInsurance.amount,
    });
  }
  const declared = toNumber(input.declaredValue) || 0;
  const customs = declared > 0 ? { ...surcharges.customs, total: (declared * surcharges.customs.percent) / 100 } : null;

  const extrasTotal = extras.reduce((s, e) => s + e.total, 0);
  const total = freight !== null ? freight + extrasTotal : null;

  return {
    mode: mode.id,
    destination: dest,
    zone,
    realWeight,
    volumetricWeight,
    volumeM3: hasDims ? volumeM3 : null,
    volumeFt3: hasDims ? volumeM3 * 35.3147 : null,
    billableWeight,
    appliedMinimum,
    billedBy,
    rate,
    freight,
    extras,
    customs,
    total,
    transit: zone?.transit?.[mode.id] ?? null,
    warnings,
    quoteRequired: rate === null,
  };
}

/**
 * Compara aéreo y marítimo para la misma carga y elige la mejor opción.
 * Reglas derivadas de los límites publicados (aéreo 3–30 kg, marítimo desde 20 kg).
 */
export function compareModes(input) {
  const { air: airMode, sea: seaMode } = shippingModes;
  const air = calculateShipment({ ...input, mode: 'air' });
  const sea = calculateShipment({ ...input, mode: 'sea' });
  const airHeaviest = Math.max(air.realWeight, air.volumetricWeight ?? 0);
  const airAllowed = !airMode.maxKg || airHeaviest <= airMode.maxKg;
  let best = 'air';
  let reason = `Más rápido y con precio por kilo publicado. Si no tienes prisa, el marítimo es ideal para volumen.`;
  if (!airAllowed) {
    best = 'sea';
    reason = `El aéreo admite hasta ${airMode.maxKg} kg: para esta carga, el barco es la opción.`;
  } else if (air.realWeight < seaMode.minBillableKg) {
    reason = `Por debajo de ${seaMode.minBillableKg} kg el marítimo te facturaría igualmente ${seaMode.minBillableKg} kg.`;
  }
  return { air, sea, airAllowed, best, reason };
}

/** Mensaje de WhatsApp con todos los datos del cálculo, listo para enviar. */
export function shipmentWhatsappMessage(input, r, { formatKg, formatEUR, formatNumber }) {
  const lines = [
    'Hola Tucargo, quiero confirmar este envío:',
    `• Tipo: ${shippingModes[r.mode].label}`,
    `• Destino: ${r.destination.label}`,
    `• Peso real: ${formatKg(r.realWeight)}`,
  ];
  const l = toNumber(input.length);
  const w = toNumber(input.width);
  const h = toNumber(input.height);
  if (l > 0 && w > 0 && h > 0) {
    const vol = r.volumetricWeight !== null ? ` (peso volumétrico ${formatKg(Math.round(r.volumetricWeight * 100) / 100)})` : '';
    lines.push(`• Medidas: ${formatNumber(l, 1)} × ${formatNumber(w, 1)} × ${formatNumber(h, 1)} cm${vol}`);
  }
  lines.push(`• Peso facturable: ${formatKg(r.billableWeight)}`);
  r.extras.forEach((x) => lines.push(`• ${x.label}: ${formatEUR(x.total)}`));
  if (r.customs) lines.push(`• Valor del contenido: ${formatEUR(toNumber(input.declaredValue))}`);
  lines.push(r.total !== null ? `• Estimación de la calculadora: ${formatEUR(r.total)}` : '• Precio: cotización personalizada');
  lines.push('', '¿Me confirman el precio y los pasos a seguir?');
  return lines.join('\n');
}
