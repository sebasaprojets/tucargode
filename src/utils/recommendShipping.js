import { shippingModes } from '../data/shippingRates';

export const weightOptions = [
  { id: '3-10', label: '3 – 10 kg' },
  { id: '10-20', label: '10 – 20 kg' },
  { id: '20-50', label: '20 – 50 kg' },
  { id: '50+', label: 'Más de 50 kg' },
];

export const urgencyOptions = [
  { id: 'urgent', label: 'Urgente', hint: 'Lo necesito cuanto antes' },
  { id: 'normal', label: 'Normal', hint: 'Unas semanas está bien' },
  { id: 'relaxed', label: 'No tengo prisa', hint: 'Prefiero ahorrar en volumen' },
];

/**
 * Recomendación orientativa (no es un cálculo oficial).
 * Reglas derivadas de los límites publicados: aéreo 3–30 kg, marítimo desde 20 kg.
 */
export function recommendShipping(weight, urgency) {
  const { air, sea } = shippingModes;
  if (weight === '3-10' || weight === '10-20') {
    return {
      mode: 'air',
      title: 'Te recomendamos envío aéreo',
      reason: `Para este peso el aéreo es la opción natural: admite desde ${air.minBillableKg} kg y el marítimo factura un mínimo de ${sea.minBillableKg} kg.`,
    };
  }
  if (weight === '20-50') {
    if (urgency === 'urgent') {
      return {
        mode: 'air',
        title: 'Aéreo, si tu carga cabe en el límite',
        reason: `El aéreo es más rápido pero admite hasta ${air.maxKg} kg. Si superas ese peso, te ayudamos a encontrar la mejor alternativa.`,
      };
    }
    if (urgency === 'relaxed') {
      return {
        mode: 'sea',
        title: 'Te recomendamos envío marítimo',
        reason: `Superas el mínimo de ${sea.minBillableKg} kg del marítimo y no tienes prisa: es la opción pensada para volumen.`,
      };
    }
    return {
      mode: 'both',
      title: 'Ambas opciones pueden funcionar',
      reason: `Hasta ${air.maxKg} kg puedes enviar por avión; por encima de ${sea.minBillableKg} kg el marítimo es ideal para volumen. Te asesoramos según tu carga.`,
    };
  }
  // 50+
  if (urgency === 'urgent') {
    return {
      mode: 'contact',
      title: 'Hablemos de tu caso',
      reason: `El aéreo admite hasta ${air.maxKg} kg por envío. Para más peso con urgencia, escríbenos y buscamos la mejor solución.`,
    };
  }
  return {
    mode: 'sea',
    title: 'Te recomendamos envío marítimo',
    reason: 'Sin límite de peso siempre que la carga quepa en un palet. La mejor opción para grandes volúmenes.',
  };
}
