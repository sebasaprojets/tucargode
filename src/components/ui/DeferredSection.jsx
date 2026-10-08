import { Suspense, useEffect, useRef, useState } from 'react';
import { MOUNT_ALL_EVENT } from '../../lib/scroll';

/**
 * Monta una sección diferida (lazy) de forma progresiva:
 * 1) cuando se acerca al viewport, 2) en momentos ociosos (una por vez, en orden),
 * o 3) de inmediato si se navega a un ancla. Así la carga inicial no bloquea el
 * hilo principal en móviles y el ancla siempre existe para la navegación.
 */
const queue = [];
let scheduled = false;

function pump() {
  if (!queue.length) {
    scheduled = false;
    return;
  }
  scheduled = true;
  const run = () => {
    const fn = queue.shift();
    fn?.();
    pump();
  };
  if ('requestIdleCallback' in window) window.requestIdleCallback(run, { timeout: 2500 });
  else setTimeout(run, 120);
}

let started = false;
function startQueueAfterLoad() {
  if (started) return;
  started = true;
  const go = () => setTimeout(() => !scheduled && pump(), 1200);
  if (document.readyState === 'complete') go();
  else window.addEventListener('load', go, { once: true });
}

export default function DeferredSection({ id, children, minHeight = '70vh' }) {
  const ref = useRef(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (mounted) return undefined;
    const mount = () => setMounted(true);
    const el = ref.current;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) mount();
      },
      { rootMargin: '120% 0px 120% 0px' },
    );
    if (el) io.observe(el);
    queue.push(mount);
    startQueueAfterLoad();
    window.addEventListener(MOUNT_ALL_EVENT, mount);
    return () => {
      io.disconnect();
      const i = queue.indexOf(mount);
      if (i >= 0) queue.splice(i, 1);
      window.removeEventListener(MOUNT_ALL_EVENT, mount);
    };
  }, [mounted]);

  const placeholder = <div style={{ minHeight }} aria-hidden="true" />;
  return (
    <div id={id} ref={ref} className="anchor">
      {mounted ? <Suspense fallback={placeholder}>{children}</Suspense> : placeholder}
    </div>
  );
}
