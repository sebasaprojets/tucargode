/**
 * Scroll del sitio:
 * - Desplazamiento suave con inercia (Lenis) en escritorio (ratón y pantalla ancha),
 *   también con «reducir movimiento» activo: sin él, la rueda avanza a saltos y las
 *   capas con parallax (que se calculan en JS) van un cuadro por detrás y «tiemblan».
 *   Lenis se ejecuta dentro del bucle de cuadros de Framer Motion, así el scroll y
 *   las transformaciones que dependen de él se actualizan en el mismo cuadro.
 *   En móvil y tablet se mantiene el scroll nativo.
 * - Navegación por anclas que garantiza que las secciones diferidas estén
 *   montadas antes de calcular la posición.
 */
import { frame } from 'framer-motion';
import { DESKTOP_MOTION_QUERY } from '../hooks/useMotionPreference';

export const MOUNT_ALL_EVENT = 'tucargo:mount-all';

let lenis = null;
let lockCount = 0;

const headerOffset = () => {
  const v = getComputedStyle(document.documentElement).getPropertyValue('--header-h');
  return (parseFloat(v) || 72) + 8;
};

export async function initSmoothScroll() {
  if (!window.matchMedia(DESKTOP_MOTION_QUERY).matches || lenis) return null;
  const { default: Lenis } = await import('lenis');
  if (lenis) return lenis;
  lenis = new Lenis({ lerp: 0.12, wheelMultiplier: 1, smoothWheel: true, syncTouch: false });
  // Un único bucle: Lenis mueve el scroll en el primer paso («setup») del frameloop
  // de Framer y avisa en el acto, así useScroll mide y las capas se pintan en ese
  // mismo cuadro (sin el evento nativo llegarían un cuadro tarde y «temblarían»).
  const tick = ({ timestamp }) => lenis?.raf(timestamp);
  frame.setup(tick, true);
  lenis.on('scroll', (l) => {
    if (l.isScrolling === 'smooth') window.dispatchEvent(new Event('scroll'));
  });
  if (lockCount > 0) lenis.stop();
  return lenis;
}

/** Bloquea/desbloquea el scroll (menú móvil, modales). */
export function setScrollLocked(locked) {
  lockCount = Math.max(0, lockCount + (locked ? 1 : -1));
  const isLocked = lockCount > 0;
  document.body.classList.toggle('is-locked', isLocked);
  if (lenis) {
    if (isLocked) lenis.stop();
    else lenis.start();
  }
}

const nextFrame = () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));

/** Desplaza hasta un id, montando antes las secciones diferidas. */
export async function scrollToId(id, { focus = true } = {}) {
  window.dispatchEvent(new Event(MOUNT_ALL_EVENT));
  await nextFrame();
  const el = document.getElementById(id);
  if (!el) return;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches && !lenis;
  const top = id === 'inicio' ? 0 : el.getBoundingClientRect().top + window.scrollY - headerOffset();
  if (lenis) lenis.scrollTo(top, { duration: 1.2 });
  else window.scrollTo({ top, behavior: reduce ? 'auto' : 'smooth' });
  // En pantallas táctiles no se mueve el foco: un toque posterior dentro de la sección
  // podría hacer que el navegador salte a su inicio
  const touch = window.matchMedia('(pointer: coarse)').matches;
  if (focus && !touch) {
    // Foco accesible temporal: se retira al salir para que un toque posterior
    // dentro de la sección no la vuelva a enfocar (y el navegador no salte a su inicio)
    const added = !el.hasAttribute('tabindex');
    if (added) el.setAttribute('tabindex', '-1');
    el.focus({ preventScroll: true });
    if (added) el.addEventListener('blur', () => el.removeAttribute('tabindex'), { once: true });
  }
}

/** Intercepta los enlaces internos (#id) de toda la página. */
export function initAnchorNavigation() {
  const onClick = (e) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = e.target.closest?.('a[href^="#"]');
    if (!a) return;
    const id = decodeURIComponent(a.getAttribute('href').slice(1));
    if (!id) return;
    e.preventDefault();
    if (history.replaceState) history.replaceState(null, '', `#${id}`);
    scrollToId(id);
  };
  document.addEventListener('click', onClick);
  // Enlace directo con hash al cargar (p. ej. /#calculadora)
  if (location.hash.length > 1) {
    const id = decodeURIComponent(location.hash.slice(1));
    setTimeout(() => scrollToId(id, { focus: false }), 300);
  }
  return () => document.removeEventListener('click', onClick);
}
