/**
 * Datos de la empresa — fuente única de verdad.
 *
 * Origen: contenido publicado en https://www.tucargo.de/ (inicio, «¿Quiénes somos?»,
 * «Preguntas frecuentes», «Planillas y tarifas») y perfiles sociales oficiales.
 * Si algún dato cambia, actualízalo SOLO aquí.
 */

const whatsappNumber = '491638789774';
const whatsappDefaultMessage = 'Hola Tucargo, quisiera obtener información sobre un envío.';

export const siteConfig = {
  name: 'Tucargo',
  legalName: 'Tucargo Düsseldorf',
  url: 'https://www.tucargo.de/',
  foundedYear: 2018,
  tagline: 'De Alemania a Venezuela. Tu carga, en buenas manos.',

  /**
   * Logo oficial (insignia circular con el barco). Archivos en /public/brand/.
   * Si se cambia el logo, regenerar las versiones con el mismo nombre.
   */
  brand: {
    logo: {
      webp: { 128: 'brand/tucargo-logo-128.webp', 256: 'brand/tucargo-logo-256.webp', 512: 'brand/tucargo-logo-512.webp' },
      png: 'brand/tucargo-logo-256.png',
      showWordmark: true, // muestra «TUCARGO / Düsseldorf» junto a la insignia
    },
  },

  contact: {
    phoneDisplay: '+49 163 8789774',
    phoneHref: 'tel:+491638789774',
    whatsappNumber,
    whatsappDefaultMessage,
    email: 'tucargo.de@gmail.com',
  },

  /** Almacén principal: dirección publicada para recibir paquetes («Envía tu paquete a»). */
  warehouse: {
    recipient: 'Erika Hönig',
    street: 'Graf-Engelbert-Str. 42b',
    postalCode: '40489',
    city: 'Düsseldorf',
    country: 'Alemania',
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Graf-Engelbert-Str.+42b%2C+40489+D%C3%BCsseldorf',
  },

  /**
   * Horario publicado en la página de inicio de tucargo.de.
   * Nota: otras páginas del sitio oficial muestran horarios distintos — confirmar.
   */
  hours: [
    { days: 'Lunes a viernes', time: '9:00 – 19:00' },
    { days: 'Sábados', time: '9:00 – 14:00' },
  ],

  social: {
    instagram: { handle: '@tucargode', url: 'https://www.instagram.com/tucargode/' },
    x: { handle: '@tucargo1', url: 'https://x.com/tucargo1' },
  },

  /** Enlaces legales. Dejar en null hasta tener la URL definitiva (p. ej. Impressum). */
  legal: {
    impressumUrl: null,
    privacyUrl: null,
  },

  /** Recursos oficiales externos (planillas descargables, etc.). */
  resources: {
    ratesAndFormsUrl: 'https://www.tucargo.de/planillas-y-tarifas',
  },

  /**
   * Cifras verificables publicadas por la empresa («¿Quiénes somos?»).
   * No añadir números que no estén publicados oficialmente.
   */
  stats: [
    { value: 1790, prefix: '+', suffix: '', label: 'Clientes satisfechos', format: true },
    { value: 2018, prefix: '', suffix: '', label: 'Año en que nació Tucargo', format: false },
    { value: 6, prefix: '', suffix: ' días', label: 'De atención: lunes a sábado', format: false },
    { value: 10, prefix: 'Hasta ', suffix: '', label: 'Paquetes por recogida DHL', format: false },
  ],
};

export const navItems = [
  { id: 'inicio', label: 'Inicio' },
  { id: 'servicios', label: 'Servicios' },
  { id: 'envios', label: 'Envíos' },
  { id: 'tarifas', label: 'Tarifas' },
  { id: 'calculadora', label: 'Calculadora' },
  { id: 'nosotros', label: 'Nosotros' },
  { id: 'faq', label: 'FAQ' },
  { id: 'contacto', label: 'Contacto' },
];

/** Construye un enlace wa.me con mensaje prellenado. */
export function whatsappLink(message = whatsappDefaultMessage) {
  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
}
