/** Utilidades de geometría esférica para el globo (sin dependencias). */

export const DEG = Math.PI / 180;
export const EARTH_RADIUS_KM = 6371;

/** lon/lat (grados) → vector unitario [x, y, z]. */
export function toVec(lon, lat) {
  const l = lon * DEG;
  const p = lat * DEG;
  const c = Math.cos(p);
  return [c * Math.cos(l), c * Math.sin(l), Math.sin(p)];
}

/** Vector → lon/lat (grados). */
export function toLonLat([x, y, z]) {
  return [Math.atan2(y, x) / DEG, Math.asin(Math.max(-1, Math.min(1, z))) / DEG];
}

/** Distancia ortodrómica en km (haversine). */
export function distanceKm([lon1, lat1], [lon2, lat2]) {
  const dLat = (lat2 - lat1) * DEG;
  const dLon = (lon2 - lon1) * DEG;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * DEG) * Math.cos(lat2 * DEG) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(a));
}

/** Interpolación esférica entre dos vectores unitarios. */
export function slerp(a, b, t) {
  const dot = Math.max(-1, Math.min(1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2]));
  const omega = Math.acos(dot);
  if (omega < 1e-6) return a;
  const s = Math.sin(omega);
  const k1 = Math.sin((1 - t) * omega) / s;
  const k2 = Math.sin(t * omega) / s;
  return [a[0] * k1 + b[0] * k2, a[1] * k1 + b[1] * k2, a[2] * k1 + b[2] * k2];
}

/**
 * Base de cámara para una proyección ortográfica centrada en (lon0, lat0):
 * c = dirección hacia el espectador, e = este (x de pantalla), n = norte (y de pantalla).
 */
export function cameraBasis(lon0, lat0) {
  const l = lon0 * DEG;
  const p = lat0 * DEG;
  const sl = Math.sin(l);
  const cl = Math.cos(l);
  const sp = Math.sin(p);
  const cp = Math.cos(p);
  return {
    c: [cp * cl, cp * sl, sp],
    e: [-sl, cl, 0],
    n: [-sp * cl, -sp * sl, cp],
  };
}

export const easeOutCubic = (t) => 1 - (1 - t) ** 3;
export const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
export const clamp01 = (t) => Math.max(0, Math.min(1, t));

/** Diferencia angular más corta (grados) para animar longitudes sin dar la vuelta larga. */
export function shortestDelta(from, to) {
  return ((((to - from) % 360) + 540) % 360) - 180;
}
