/**
 * Pausa las animaciones CSS de cada sección mientras está fuera de pantalla.
 * Olas, estrellas, luces, banderas… siguen siendo infinitas, pero solo se
 * calculan cuando se ven: en móviles es la mayor parte del trabajo por cuadro.
 * Las secciones que se montan más tarde (diferidas) se detectan solas.
 */
export function initOffscreenPause() {
  if (typeof IntersectionObserver === 'undefined') return;
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) e.target.classList.toggle('is-offscreen', !e.isIntersecting);
    },
    { rootMargin: '120px 0px' },
  );
  const seen = new WeakSet();
  const watch = (root) => {
    const list = root.matches?.('section, footer') ? [root] : [];
    root.querySelectorAll?.('section, footer').forEach((el) => list.push(el));
    for (const el of list) {
      if (seen.has(el)) continue;
      seen.add(el);
      io.observe(el);
    }
  };
  const root = document.getElementById('root');
  watch(root);
  new MutationObserver((muts) => {
    for (const m of muts) m.addedNodes.forEach((n) => n.nodeType === 1 && watch(n));
  }).observe(root, { childList: true, subtree: true });
}
