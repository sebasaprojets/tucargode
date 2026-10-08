/**
 * ============================================================================
 *  INTRO CINEMATOGRÁFICA — PARÁMETROS AJUSTABLES
 *  Todo lo que se puede afinar (duración, colores, partículas, cámara lenta…)
 *  está aquí. Tiempos en segundos.
 * ============================================================================
 */
export const INTRO = {
  /* ---- Cuándo se muestra ---- */
  storageKey: 'tucargo:intro-v1',
  // 'local' = solo la primera visita · 'session' = una vez por sesión del navegador
  remember: 'local',
  // Con «reducir movimiento» activo se hace solo un fundido del logo.
  // false = en ordenadores se reproduce igual (mismo criterio que el resto del sitio);
  // true = se respeta también en ordenadores.
  respectReducedMotionOnDesktop: false,

  /* ---- Secuencia (≈ 6,5 s en total) ---- */
  timing: {
    beamIn: 0.2, //          1) oscuridad: el haz de luz aparece
    reveal: 1.0, //          2) el logo sale del desenfoque
    revealDuration: 1.5,
    ringDraw: 0.9, //           el contorno se dibuja antes del relleno
    wordmark: 1.9, //           «TUCARGO» con texto «scramble»
    tagline: 2.4,
    impact: 2.6, //          3) destello, aberración cromática, sacudida y explosión
    hint: 3.4, //               aparece «Haz clic para entrar»
    camera: 3.7, //          4) dolly in + giro en Y
    cameraDuration: 1.6,
    exit: 5.0, //            5) salida automática (si el usuario no está interactuando)
    exitDuration: 1.5,
    skipDuration: 0.75, //      salida rápida al pulsar «Saltar intro» o Esc
    maxWait: 14, //             tiempo máximo si el usuario sigue jugando
  },

  /* ---- Colores (paleta del logo) ---- */
  colors: {
    bg: '#01070D',
    bgGlow: '#04213A',
    light: '#7FD6F8', // haz volumétrico y brillo
    dust: '#E1F5FE',
    sea: '#01B9FF',
    spark: '#CC4D47', // chispas rojas del casco (pocas)
  },

  /* ---- Partículas ---- */
  particles: {
    dust: { desktop: 900, mobile: 240 }, // polvo flotante
    burst: { desktop: 650, mobile: 200 }, // explosión del impacto
    clickBurst: { desktop: 260, mobile: 120 }, // explosión al pulsar el logo
    max: 2000, // tope absoluto en pantalla
    repelRadius: 150, // px alrededor del cursor
    repelForce: 1, // intensidad de la repulsión
    parallax: 28, // px máximos de desplazamiento por profundidad
    burstSlowMo: 0.42, // velocidad de la explosión (1 = tiempo real)
    gravity: 60, // px/s² (en cámara lenta)
  },

  /* ---- Cámara y efectos ---- */
  logoSize: { desktop: 200, mobile: 132 }, // px
  tiltMax: 15, // grados con el ratón / giroscopio
  cameraTurn: 9, // grados de giro en Y durante el dolly
  cameraZoom: 1.08, // dolly in
  shake: 7, // px de la sacudida de cámara
  aberration: 7, // px de separación RGB
  grain: 0.09, // opacidad del grano de película
  bulletTime: 0.2, // escala de tiempo al mantener pulsado
  holdDelay: 0.22, // s pulsando para activar el «bullet time»
  sound: false, // sonido activado por defecto (los navegadores bloquean el autoplay)
};

/** Easing cubic-bezier(x1, y1, x2, y2) como función (para GSAP). */
export function cubicBezier(x1, y1, x2, y2) {
  const cx = 3 * x1;
  const bx = 3 * (x2 - x1) - cx;
  const ax = 1 - cx - bx;
  const cy = 3 * y1;
  const by = 3 * (y2 - y1) - cy;
  const ay = 1 - cy - by;
  const sx = (t) => ((ax * t + bx) * t + cx) * t;
  const sy = (t) => ((ay * t + by) * t + cy) * t;
  const dx = (t) => (3 * ax * t + 2 * bx) * t + cx;
  return (x) => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    let t = x;
    for (let i = 0; i < 6; i++) {
      const d = dx(t);
      if (Math.abs(d) < 1e-6) break;
      t -= (sx(t) - x) / d;
    }
    return sy(Math.min(1, Math.max(0, t)));
  };
}

/** Curva principal de la intro: cubic-bezier(0.16, 1, 0.3, 1). */
export const CINEMATIC_EASE = cubicBezier(0.16, 1, 0.3, 1);
