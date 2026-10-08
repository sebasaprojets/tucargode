import { useReducedMotion } from 'framer-motion';
import { useMediaQuery } from './useMediaQuery';

/**
 * En ordenadores (ratón y pantalla ancha) las animaciones ambientales del sitio
 * (avión, barcos, cinta, partículas) se mantienen siempre activas por decisión
 * de diseño del cliente. En móvil y tablet se respeta «reducir movimiento».
 */
export const DESKTOP_MOTION_QUERY = '(min-width: 1024px) and (hover: hover) and (pointer: fine)';

export function isDesktopMotion() {
  return typeof window !== 'undefined' && window.matchMedia(DESKTOP_MOTION_QUERY).matches;
}

/** true si hay que reducir el movimiento (solo fuera de escritorio). */
export function useReduceMotion() {
  const prefers = useReducedMotion();
  const desktop = useMediaQuery(DESKTOP_MOTION_QUERY);
  return Boolean(prefers) && !desktop;
}
