import { shippingModes, rateZones, surcharges, transitNotes, storage } from './shippingRates';
import { mainCities } from './destinations';
import { siteConfig } from '../config/siteConfig';

const air = shippingModes.air;
const sea = shippingModes.sea;
const cities = mainCities.join(', ');

/**
 * Respuestas basadas en la información publicada en tucargo.de.
 * Cuando el sitio oficial no detalla un tema, la respuesta remite al equipo
 * en lugar de inventar condiciones.
 */
export const faq = [
  {
    q: '¿Puedo enviar por avión?',
    a: `Sí. Enviamos por vía aérea desde ${air.minBillableKg} kg y hasta ${air.maxKg} kg. La tarifa de referencia es de ${rateZones.main.rates.air} €/kg hacia ${cities}, y de ${rateZones.other.rates.air} €/kg hacia otras ciudades.`,
  },
  {
    q: '¿Cuál es el peso mínimo?',
    a: `El mínimo facturable es de ${air.minBillableKg} kg en envíos aéreos y de ${sea.minBillableKg} kg en envíos marítimos. Los kilos no se fraccionan: si el paquete pesa 5,10 kg se facturan 6,00 kg.`,
  },
  {
    q: '¿Puedo enviar por barco?',
    a: `Sí. El envío marítimo es ideal para cargas grandes: a partir de ${sea.minBillableKg} kg y sin límite de peso, siempre que la carga pueda enviarse en un palet. Se cotiza de forma personalizada.`,
  },
  {
    q: '¿Cuánto tarda?',
    a: `Aéreo: ${rateZones.main.transit.air} hacia ${cities}, y ${rateZones.other.transit.air} hacia otros destinos. Marítimo: ${rateZones.main.transit.sea} hacia ciudades principales y ${rateZones.other.transit.sea} hacia otros destinos. ${transitNotes.air}`,
  },
  {
    q: '¿Cómo funciona el peso volumétrico?',
    a: `En envíos aéreos se calcula largo × ancho × alto (en cm) ÷ ${air.volumetricDivisor}. Se factura el mayor entre el peso real y el peso volumétrico. Puedes calcularlo en nuestra calculadora.`,
  },
  {
    q: '¿Realizan recogidas DHL?',
    a: 'Sí, organizamos recogidas solo dentro de Alemania, de lunes a sábado y con un máximo de 10 paquetes por recogida. Necesitamos tu nombre, dirección y teléfono, además de los datos del envío.',
  },
  {
    q: '¿Hacen puerta a puerta?',
    a: 'Sí. Nos encargamos desde la recepción o recogida en Alemania hasta la coordinación de la entrega en Venezuela, gestionando la carga con nuestro propio personal.',
  },
  {
    q: '¿Qué artículos están prohibidos?',
    a: 'La lista oficial y actualizada de artículos prohibidos está disponible en la sección «Planillas y tarifas» del sitio de Tucargo. Si tienes dudas sobre un artículo concreto, escríbenos antes de enviarlo.',
    link: { label: 'Ver planillas y tarifas', href: siteConfig.resources.ratesAndFormsUrl },
  },
  {
    q: '¿Puedo asegurar mi envío?',
    a: `Los artículos nuevos deben asegurarse: el seguro es de ${surcharges.newItemInsurance.amount} € ${surcharges.newItemInsurance.unit}. Para otros casos, consúltanos.`,
  },
  {
    q: '¿Puedo pagar por PayPal?',
    a: 'Los métodos de pago se confirman al cotizar tu envío. Escríbenos por WhatsApp y te indicamos las opciones vigentes.',
  },
  {
    q: '¿Puedo enviar electrónicos?',
    a: `Sí, celulares y artículos electrónicos pueden enviarse por vía aérea o marítima siguiendo nuestras recomendaciones. En envíos con celulares, tablets, laptops o artículos con baterías se aplica un recargo de ${surcharges.batteries.amount} € ${surcharges.batteries.unit}.`,
  },
  {
    q: '¿Envían a la Isla de Margarita?',
    a: 'Actualmente no ofrecemos envíos hacia la Isla de Margarita.',
  },
  {
    q: '¿Cuánto tiempo pueden quedarse mis paquetes en el almacén?',
    a: `Los envíos de personas particulares recibidos en nuestro almacén pueden permanecer almacenados hasta un máximo de ${storage.privateMaxDays} días.`,
  },
];
