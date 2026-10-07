import { Plane, Ship, House, Truck, PackageOpen, Warehouse } from 'lucide-react';
import { shippingModes, rateZones, storage } from './shippingRates';

const air = shippingModes.air;
const sea = shippingModes.sea;

/**
 * cta.type: 'anchor' (sección interna) | 'whatsapp' (mensaje prellenado)
 */
export const services = [
  {
    id: 'aereo',
    icon: Plane,
    title: 'Aéreo',
    description: `Tu paquete viaja por avión desde Alemania. Envíos desde ${air.minBillableKg} kg y hasta ${air.maxKg} kg.`,
    benefits: [
      `Desde ${air.minBillableKg} kg facturables`,
      `${rateZones.main.transit.air} a ciudades principales`,
      'Se factura el mayor entre peso real y volumétrico',
    ],
    cta: { label: 'Calcular envío aéreo', type: 'anchor', target: 'calculadora' },
  },
  {
    id: 'maritimo',
    icon: Ship,
    title: 'Marítimo',
    description: `Ideal para envíos grandes. A partir de ${sea.minBillableKg} kg y sin límite de peso, siempre que la carga quepa en un palet.`,
    benefits: [
      'Pensado para mucho volumen',
      `${rateZones.main.transit.sea} a ciudades principales`,
      'Carga comercial con gestión de DUA',
    ],
    cta: { label: 'Cotizar marítimo', type: 'anchor', target: 'contacto' },
  },
  {
    id: 'puerta-a-puerta',
    icon: House,
    title: 'Puerta a puerta',
    description:
      'Desde la recepción o recogida en Alemania hasta la coordinación de la entrega en Venezuela.',
    benefits: [
      'Gestionamos tu carga con nuestro propio personal',
      'Sin intermediarios',
      'Coordinación de la entrega en destino',
    ],
    cta: { label: 'Solicitar cotización', type: 'anchor', target: 'contacto' },
  },
  {
    id: 'recogida-dhl',
    icon: Truck,
    title: 'Recogida DHL',
    description:
      'Organizamos la recogida de tus paquetes en cualquier punto de Alemania, de lunes a sábado.',
    benefits: [
      'Hasta 10 paquetes por recogida',
      'Solo dentro de Alemania',
      'Necesitamos nombre, dirección y teléfono',
    ],
    cta: {
      label: 'Pedir recogida',
      type: 'whatsapp',
      message: 'Hola Tucargo, quisiera solicitar una recogida DHL en Alemania.',
    },
  },
  {
    id: 'reempaque',
    icon: PackageOpen,
    title: 'Reempaque y consolidación',
    description:
      'Si tienes varios paquetes, los consolidamos y te los enviamos todos juntos en un solo envío.',
    benefits: [
      'Un solo envío, menos gestiones',
      `Almacenaje de hasta ${storage.privateMaxDays} días para particulares`,
      'Combinable con aéreo o marítimo',
    ],
    cta: {
      label: 'Consolidar paquetes',
      type: 'whatsapp',
      message: 'Hola Tucargo, tengo varios paquetes y quisiera consolidarlos en un solo envío.',
    },
  },
  {
    id: 'casillero',
    icon: Warehouse,
    title: 'Casillero internacional',
    description:
      'Compra en tiendas de Alemania y envía tus compras a nuestro almacén en Düsseldorf. Nosotros las llevamos a Venezuela.',
    benefits: [
      'Dirección de almacén en Düsseldorf',
      'Recepción de compras online',
      'Se integra con consolidación',
    ],
    cta: { label: 'Ver dirección del almacén', type: 'anchor', target: 'contacto' },
  },
];
