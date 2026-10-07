/**
 * Destinos en Venezuela. `zone` enlaza con `rateZones` en shippingRates.js.
 * Coordenadas aproximadas (lon, lat) para el mapa estilizado.
 */
export const destinations = [
  { id: 'caracas', label: 'Caracas', zone: 'main', coords: [-66.9, 10.5], available: true },
  { id: 'maracay', label: 'Maracay', zone: 'main', coords: [-67.6, 10.25], available: true },
  { id: 'valencia', label: 'Valencia', zone: 'main', coords: [-68.0, 10.16], available: true },
  { id: 'barquisimeto', label: 'Barquisimeto', zone: 'main', coords: [-69.3, 10.07], available: true },
  { id: 'otra', label: 'Otra ciudad de Venezuela', zone: 'other', coords: null, available: true },
  {
    id: 'margarita',
    label: 'Isla de Margarita',
    zone: null,
    coords: [-63.9, 11.0],
    available: false,
    unavailableReason: 'Actualmente no ofrecemos envíos hacia la Isla de Margarita.',
  },
];

export const origin = { id: 'dusseldorf', label: 'Düsseldorf', country: 'Alemania', coords: [6.78, 51.22] };

export const mainCities = destinations.filter((d) => d.zone === 'main').map((d) => d.label);

export function getDestination(id) {
  return destinations.find((d) => d.id === id) ?? null;
}
