/**
 * ============================================================================
 *  INTRO CINEMATOGRÁFICA — PARÁMETROS AJUSTABLES
 *  Formato «brand film»: película del carguero en alta mar con barras de cine,
 *  HUD de ruta (coordenadas reales Düsseldorf → Caracas), titulares que se
 *  revelan con máscara, la distancia real contando y, al final, el sello de
 *  TUCARGO emergiendo en medio del mar antes de deslizarse al header.
 *  Tiempos en segundos.
 * ============================================================================
 */
export const INTRO = {
  /* ---- Cuándo se muestra ---- */
  // Cambiar la clave hace que todos vuelvan a ver la intro una vez.
  // Si se cambia, actualizar también el script del <head> en index.html.
  storageKey: 'tucargo:intro-v2',
  remember: 'local', // 'local' = solo la primera visita · 'session' = una vez por sesión
  // Con «reducir movimiento» se hace solo un fundido. false = en ordenadores se
  // reproduce completa (mismo criterio que el resto del sitio); true = se respeta siempre.
  respectReducedMotionOnDesktop: false,

  /* ---- Película (public/media) ---- */
  video: {
    desktop: [
      { src: 'media/intro-1280.webm', type: 'video/webm' },
      { src: 'media/intro-1280.mp4', type: 'video/mp4' },
    ],
    mobile: [
      { src: 'media/intro-854.webm', type: 'video/webm' },
      { src: 'media/intro-854.mp4', type: 'video/mp4' },
    ],
    poster: 'media/intro-poster.webp',
    playbackRate: 0.85, // cámara lenta (1 = velocidad normal)
    focusX: '50%', // encuadre horizontal en pantallas verticales
    maxWait: 2.5, // s máximos esperando a que el vídeo pueda reproducirse
  },

  /* ---- Secuencia (≈ 6,5 s + salida) ---- */
  timing: {
    filmInDuration: 1.6, //  la película aparece desde negro
    title1: 0.6, //          «De Alemania / a Venezuela.»
    title1Out: 1.9,
    title2: 2.55, //         «7.965 km» contando + «Ninguna distancia es suficiente.»
    title2Out: 3.8,
    ripples: 4.05, //        corte al mar abierto: el agua se agita…
    ring: 4.15, //            …un aro se cierra…
    ringDuration: 1.3,
    logo: 4.35, //            …y el sello emerge del agua
    logoDuration: 1.4,
    letters: 5.0, //         «TUCARGO» letra a letra
    letterStagger: 0.07,
    shine: 5.5, //           brillo que cruza el logo
    exit: 6.5, //            las barras se abren y el logo se desliza al header
    exitDuration: 1.5,
    skipDuration: 0.7,
  },

  /* ---- Escena ---- */
  sealSize: { desktop: 180, mobile: 132 }, // px del sello
  cameraZoom: [1.08, 1.0], // dolly lento de la película (inicio → final)
  tiltMax: 7, // grados del parallax 3D del logo con el ratón
  filmParallax: 18, // px que se desplaza la película con el ratón
  mist: { desktop: { blobs: 16, motes: 60 }, mobile: { blobs: 8, motes: 30 } },
  colors: { mist: '#BFE6F7' },
};
