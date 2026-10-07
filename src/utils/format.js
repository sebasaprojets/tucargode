const eur = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' });
const num = new Intl.NumberFormat('es-ES', { maximumFractionDigits: 2 });
const int = new Intl.NumberFormat('es-ES', { useGrouping: true });

export const formatEUR = (v) => eur.format(v);
export const formatKg = (v) => `${num.format(v)} kg`;
export const formatNumber = (v, decimals = 2) =>
  new Intl.NumberFormat('es-ES', { maximumFractionDigits: decimals }).format(v);
/** Agrupa miles también en números de 4 cifras (1.790). */
export const formatInt = (v) => {
  const s = int.format(Math.round(v));
  return Math.abs(v) >= 1000 && !s.includes('.') ? s.replace(/\B(?=(\d{3})+(?!\d))/g, '.') : s;
};
