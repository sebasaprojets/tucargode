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
   * Logo oficial. Coloca los archivos en /public/brand/ y escribe aquí el nombre.
   * - onDark: versión para fondos oscuros (header, menú, footer). Idealmente blanca/clara con fondo transparente.
   * - onLight: versión para fondos claros (opcional).
   * Formatos recomendados: SVG, o PNG/WebP transparente de al menos 600 px de ancho.
   * Mientras sea null, se muestra el logotipo provisional.
   */
  brand: {
    logo: {
      onDark: null, // p. ej. 'brand/tucargo-logo-white.svg'
      onLight: null, // p. ej. 'brand/tucargo-logo.svg'
      height: 40, // alto en px en el header
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
