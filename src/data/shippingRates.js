/**
 * Tarifas y reglas de facturación.
 *
 * ⚠️ NUNCA escribir precios directamente en los componentes: todo se lee de aquí.
 *
 * Origen: «Preguntas frecuentes» y página de inicio de https://www.tucargo.de/.
 * Los valores son referenciales; `lastVerified` debe actualizarse cada vez que
 * la empresa confirme las tarifas vigentes.
 */

export const ratesMeta = {
  currency: 'EUR',
  source: 'https://www.tucargo.de/preguntas-frecuentes',
  lastVerified: null, // p. ej. '2026-10-01' cuando la empresa confirme
  disclaimer:
    'Tarifas referenciales publicadas por Tucargo. Confirma siempre el precio vigente antes de enviar.',
};

export const shippingModes = {
  air: {
    id: 'air',
    label: 'Aéreo',
    minBillableKg: 3,
    maxKg: 30,
    /** Peso volumétrico aéreo: largo × ancho × alto (cm) / 6000 */
    volumetricDivisor: 6000,
    /** Las aerolíneas no fraccionan kilos: 5,10 kg se facturan como 6,00 kg. */
    roundUpToKg: true,
    expressAvailable: false,
  },
  sea: {
    id: 'sea',
    label: 'Marítimo',
    minBillableKg: 20,
    maxKg: null, // Sin límite de peso, siempre que la carga quepa en un palet.
    volumetricDivisor: null, // El marítimo se cotiza de forma personalizada.
    roundUpToKg: true,
  },
};

/**
 * Tarifas por destino. `rates.sea = null` significa «cotización personalizada».
 * `transit` en texto, tal como lo comunica la empresa (aproximado).
 */
export const rateZones = {
  main: {
    id: 'main',
    label: 'Ciudades principales',
    rates: { air: 18, sea: null },
    transit: {
      air: 'aprox. 12–15 días hábiles',
      sea: 'aprox. 2 meses y medio',
    },
    /** Equivalente aproximado en semanas (solo para comparar visualmente). */
    transitWeeks: { air: 3, sea: 10.5 },
  },
  other: {
    id: 'other',
    label: 'Otras ciudades de Venezuela',
    rates: { air: 20, sea: null },
    transit: {
      air: 'aprox. 15–24 días hábiles',
      sea: 'aprox. 3 meses',
    },
    transitWeeks: { air: 4, sea: 13 },
  },
};

/** Contados desde la salida del vuelo / del contenedor desde Europa. */
export const transitNotes = {
  air: 'A partir de la fecha de salida del vuelo desde el aeropuerto europeo. No hay envíos express: no existen rutas aéreas directas hacia Venezuela.',
  sea: 'A partir de la fecha de salida del contenedor desde el puerto europeo. Llegada por Puerto Cabello y tránsito en aduana portuaria de aprox. 5–7 días hábiles.',
};

export const surcharges = {
  batteries: {
    id: 'batteries',
    label: 'Celulares, tablets, laptops o artículos con baterías',
    amount: 15,
    unit: 'por paquete',
  },
  newItemInsurance: {
    id: 'newItemInsurance',
    label: 'Seguro obligatorio para artículos nuevos',
    amount: 30,
    unit: 'por artículo',
  },
  commercialDua: {
    id: 'commercialDua',
    label: 'DUA para carga comercial',
    amount: 120,
    unit: 'por envío',
    note: 'Requiere planilla MRN del proveedor, facturas de compra y packing list.',
  },
  customs: {
    id: 'customs',
    label: 'Recargo aduanal (Bolipuertos / SENIAT)',
    percent: 38.04,
    unit: 'sobre el valor del contenido',
    effectiveFrom: '2023-07-08',
    note: 'Vigente desde el 08.07.2023 según tucargo.de. Confirmar vigencia.',
  },
};

export const storage = {
  privateMaxDays: 45,
};
