import { HeartHandshake, House, Award, ShieldCheck, Layers } from 'lucide-react';
import { shippingModes, rateZones } from './shippingRates';

/** Historia publicada en «¿Quiénes somos?» de tucargo.de. */
export const aboutTimeline = [
  {
    tag: '2018',
    title: 'Una necesidad personal',
    text: 'Necesitábamos enviar constantemente medicamentos e insumos difíciles de encontrar —y de alto costo— a nuestros familiares en Venezuela.',
  },
  {
    tag: 'El descubrimiento',
    title: 'No éramos los únicos',
    text: 'Al buscar soluciones descubrimos que muchas otras personas venezolanas vivían exactamente la misma situación.',
  },
  {
    tag: 'Así nació Tucargo',
    title: 'Envíos puerta a puerta',
    text: 'Decidimos indagar para poder ofrecer envíos puerta a puerta hacia Venezuela, gestionando la carga con nuestro propio personal.',
  },
  {
    tag: 'Hoy',
    title: 'Logística Alemania → Venezuela',
    text: 'Desde nuestro almacén en Düsseldorf coordinamos envíos aéreos y marítimos, recogidas DHL, consolidación y casillero internacional.',
  },
];

export const whyTucargo = [
  {
    icon: HeartHandshake,
    title: 'Atención personalizada',
    text: 'Te acompañamos de principio a fin, por WhatsApp, teléfono o en nuestro almacén, de lunes a sábado.',
  },
  {
    icon: House,
    title: 'Puerta a puerta',
    text: 'Desde la recogida o recepción en Alemania hasta la coordinación de la entrega en Venezuela.',
  },
  {
    icon: Award,
    title: 'Experiencia',
    text: 'Enviamos a Venezuela desde 2018. Conocemos la ruta, la aduana y lo que tu familia necesita.',
  },
  {
    icon: ShieldCheck,
    title: 'Seguridad',
    text: 'Gestionamos la carga directamente con nuestro personal, sin intermediarios.',
  },
  {
    icon: Layers,
    title: 'Gestión integral',
    text: 'Recogida, reempaque, consolidación, transporte y documentación aduanera en un solo lugar.',
  },
];

export const howItWorks = [
  {
    n: '01',
    title: 'Prepara',
    text: 'Empaca tu carga, anota peso y medidas y calcula el costo estimado con nuestra calculadora.',
  },
  {
    n: '02',
    title: 'Envía',
    text: 'Tráela a nuestro almacén en Düsseldorf, envíala por DHL o pide que la recojamos en Alemania.',
  },
  {
    n: '03',
    title: 'Transportamos',
    text: 'Tu carga sale por avión o por barco y la acompañamos durante todo el trayecto y la aduana.',
  },
  {
    n: '04',
    title: 'Recibe',
    text: 'Coordinamos la entrega en Venezuela para que llegue a manos de tu familia.',
  },
];

export const connectionStory = [
  { label: 'Alemania', text: 'Recibimos tu carga en Düsseldorf o la recogemos en cualquier punto de Alemania.' },
  { label: 'Logística', text: 'Pesamos, medimos, reempacamos y consolidamos si hace falta.' },
  { label: 'Transporte', text: 'Por avión o por barco, cruzando el Atlántico.' },
  { label: 'Venezuela', text: 'Aduana, distribución y coordinación de la entrega.' },
  { label: 'Tu familia', text: 'Lo que importa, en las manos de quien lo espera.' },
];

const air = shippingModes.air;
const sea = shippingModes.sea;

export const comparison = {
  air: {
    title: 'Aéreo',
    rows: [
      { k: 'Peso', v: `${air.minBillableKg} – ${air.maxKg} kg` },
      { k: 'Velocidad', v: `${rateZones.main.transit.air} (ciudades principales)` },
      { k: 'Tipo de carga', v: 'Paquetes pequeños y medianos' },
      { k: 'Tarifa', v: `${rateZones.main.rates.air} – ${rateZones.other.rates.air} €/kg según destino` },
      { k: 'Ideal si', v: 'Necesitas que llegue antes' },
    ],
    pros: ['El más rápido disponible', 'Precio por kilo claro', 'Calculable al instante'],
  },
  sea: {
    title: 'Marítimo',
    rows: [
      { k: 'Peso', v: `Desde ${sea.minBillableKg} kg, sin límite (en palet)` },
      { k: 'Velocidad', v: `${rateZones.main.transit.sea} (ciudades principales)` },
      { k: 'Tipo de carga', v: 'Envíos grandes, voluminosos o comerciales' },
      { k: 'Tarifa', v: 'Cotización personalizada' },
      { k: 'Ideal si', v: 'Envías mucho y no tienes prisa' },
    ],
    pros: ['Sin límite de peso', 'Pensado para grandes volúmenes', 'Gestión de DUA para carga comercial'],
  },
};

/**
 * Testimonios: SOLO reseñas reales con autorización del cliente.
 * Formato: { name, city, text, source, date }
 * Mientras el array esté vacío, la sección no se muestra.
 */
export const testimonials = [];

/**
 * Composición visual de Instagram. Son piezas gráficas inspiradas en la
 * identidad de @tucargode (no publicaciones reales). Para mostrar fotos
 * reales, añade `image` con la ruta en /public/instagram/.
 */
export const instagramTiles = [
  { id: 1, kind: 'route', title: 'Alemania → Venezuela', image: null },
  { id: 2, kind: 'air', title: 'Aéreo', image: null },
  { id: 3, kind: 'sea', title: 'Marítimo', image: null },
  { id: 4, kind: 'container', title: 'Carga consolidada', image: null },
  { id: 5, kind: 'family', title: 'Para tu familia', image: null },
  { id: 6, kind: 'door', title: 'Puerta a puerta', image: null },
];
