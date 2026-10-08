import { INTRO } from '../components/Intro/introConfig';

/**
 * Control de la intro: se muestra solo en la primera visita (o una vez por
 * sesión, según `INTRO.remember`). `?intro` en la URL la fuerza siempre.
 * La clase `intro-pending` la pone un script en index.html antes de pintar,
 * para que no se vea el sitio un instante antes de la intro.
 */
export const REPLAY_INTRO_EVENT = 'tucargo:replay-intro';
export const INTRO_DONE_EVENT = 'tucargo:intro-done';

const store = () => {
  try {
    return INTRO.remember === 'session' ? window.sessionStorage : window.localStorage;
  } catch {
    return null;
  }
};

export function shouldPlayIntro() {
  if (typeof window === 'undefined') return false;
  if (/[?&]intro\b/.test(window.location.search)) return true;
  // Enlace directo a una sección (#calculadora…): se va directo al contenido
  if (window.location.hash.length > 1) return false;
  try {
    return store()?.getItem(INTRO.storageKey) !== '1';
  } catch {
    return false;
  }
}

export function markIntroSeen() {
  try {
    store()?.setItem(INTRO.storageKey, '1');
  } catch {
    /* almacenamiento bloqueado: la intro simplemente podría repetirse */
  }
  document.documentElement.classList.remove('intro-pending');
}

/** Vuelve a reproducir la intro (enlace «Ver intro» del pie). */
export function replayIntro() {
  window.dispatchEvent(new Event(REPLAY_INTRO_EVENT));
}
