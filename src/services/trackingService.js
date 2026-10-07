/**
 * Servicio de seguimiento. Preparado para conectarse a una API futura.
 * Configurar VITE_TRACKING_API_URL (ver .env.example).
 */
export const TRACKING_STAGES = [
  { id: 'received', label: 'Recibido', description: 'Tu carga está en nuestro almacén en Alemania.' },
  { id: 'in_transit', label: 'En tránsito', description: 'Tu carga viaja hacia Venezuela.' },
  { id: 'customs', label: 'En aduana', description: 'Trámites de aduana en Venezuela.' },
  { id: 'distribution', label: 'En distribución', description: 'Coordinando la entrega en destino.' },
  { id: 'delivered', label: 'Entregado', description: 'Tu carga llegó a su destino.' },
];

const API_URL = import.meta.env.VITE_TRACKING_API_URL;

export const isTrackingConfigured = Boolean(API_URL);

export function normalizeTrackingCode(code) {
  return String(code || '').trim().toUpperCase().replace(/\s+/g, '');
}

/**
 * @returns {Promise<{ status: 'found', data } | { status: 'not_found' } | { status: 'unavailable' }>}
 */
export async function fetchTracking(code, { signal } = {}) {
  const normalized = normalizeTrackingCode(code);
  if (!API_URL) return { status: 'unavailable', code: normalized };

  const res = await fetch(`${API_URL}?code=${encodeURIComponent(normalized)}`, { signal });
  if (res.status === 404) return { status: 'not_found', code: normalized };
  if (!res.ok) throw new Error(`Tracking API error ${res.status}`);
  const data = await res.json();
  const stageIndex = TRACKING_STAGES.findIndex((s) => s.id === data.status);
  if (stageIndex === -1) throw new Error('Respuesta de seguimiento no válida');
  return { status: 'found', code: normalized, data: { ...data, stageIndex } };
}
