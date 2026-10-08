/**
 * Scroll del sitio:
 * - Desplazamiento suave con inercia (Lenis) solo en escritorio con ratón y sin
 *   prefers-reduced-motion. En móvil se mantiene el scroll nativo (ya es fluido).
 * - Navegación por anclas que garantiza que las secciones diferidas estén
 *   montadas antes de calcular la posición.
 */
export const MOUNT_ALL_EVENT = 'tucargo:mount-all';

let lenis = null;
let lockCount = 0;

const headerOffset = () => {
  const v = getComputedStyle(document.documentElement).getPropertyValue('--header-h');
  return (parseFloat(v) || 72) + 8;
};

export async function initSmoothScroll() {
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!fine || reduce || lenis) return null;
  const { default: Lenis } = await import('lenis');
  lenis = new Lenis({ lerp: 0.11, wheelMultiplier: 1, smoothWheel: true });
  const raf = (time) => {
    lenis?.raf(time);
    requestAnimationFrame(raf);
  };
  requestAnimationFrame(raf);
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
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
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
