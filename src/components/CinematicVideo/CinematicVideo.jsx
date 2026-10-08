import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import './CinematicVideo.css';

const asset = (p) => (p ? `${import.meta.env.BASE_URL}${p}` : null);

/**
 * Vídeo de fondo cinematográfico, optimizado:
 * - no se descarga hasta acercarse al viewport (preload="none" + IntersectionObserver),
 * - se pausa fuera de pantalla y con la pestaña oculta,
 * - con prefers-reduced-motion o ahorro de datos muestra solo el póster,
 * - versión vertical opcional para móvil.
 */
export default function CinematicVideo({ mp4, webm, poster, mobileMp4, className = '' }) {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const [load, setLoad] = useState(false);
  const saveData = typeof navigator !== 'undefined' && navigator.connection?.saveData;
  const staticOnly = reduce || saveData;

  useEffect(() => {
    const el = ref.current;
    if (!el || staticOnly) return undefined;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setLoad(true);
          el.play?.().catch(() => {});
        } else {
          el.pause?.();
        }
      },
      { rootMargin: '25% 0px' },
    );
    io.observe(el);
    const onVis = () => (document.hidden ? el.pause() : io.takeRecords());
    document.addEventListener('visibilitychange', onVis);
    return () => {
      io.disconnect();
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [staticOnly]);

  if (staticOnly) {
    return poster ? <img className={`cvideo ${className}`} src={asset(poster)} alt="" aria-hidden="true" /> : null;
  }

  return (
    <video
      ref={ref}
      className={`cvideo ${className}`}
      poster={asset(poster) || undefined}
      muted
      loop
      playsInline
      autoPlay
      preload="none"
      aria-hidden="true"
      tabIndex={-1}
    >
      {load && mobileMp4 && <source src={asset(mobileMp4)} type="video/mp4" media="(max-width: 767px) and (orientation: portrait)" />}
      {load && webm && <source src={asset(webm)} type="video/webm" />}
      {load && mp4 && <source src={asset(mp4)} type="video/mp4" />}
    </video>
  );
}
