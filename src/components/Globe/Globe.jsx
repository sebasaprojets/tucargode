import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { Hand, LocateFixed } from 'lucide-react';
import Flag from '../ui/Flag';
import landDots from './landDots.json';
import { createEarthRenderer } from './earthRenderer';
import {
  DEG,
  toVec,
  toLonLat,
  slerp,
  cameraBasis,
  distanceKm,
  easeOutCubic,
  easeInOutCubic,
  clamp01,
  shortestDelta,
} from './globeMath';
import { origin, destinations } from '../../data/destinations';
import { formatInt } from '../../utils/format';
import './Globe.css';
import { useReduceMotion } from '../../hooks/useMotionPreference';

const FROM = origin.coords; // Düsseldorf
const TO = destinations.find((d) => d.id === 'caracas').coords; // Caracas
const DISTANCE_KM = distanceKm(FROM, TO);

/* Línea de tiempo de la intro (ms) */
const T_INTRO = 2800;
const T_ARC_START = 2100;
const T_ARC = 1900;
const T_HUD = 3700;
const T_COUNT = 1500;
const PLANE_PERIOD = 7000;

const SHIP_PERIOD = 18000;
const textureSet = (res) => ({
  day: `${import.meta.env.BASE_URL}globe/earth-day-${res}.webp`,
  night: `${import.meta.env.BASE_URL}globe/earth-night-${res}.webp`,
  water: `${import.meta.env.BASE_URL}globe/earth-water-1k.webp`,
});

/** Perfil del dispositivo para ajustar calidad y consumo. */
function deviceProfile() {
  const conn = navigator.connection || {};
  const saveData = Boolean(conn.saveData) || /(^|-)(2g|3g)$/.test(conn.effectiveType || '');
  const small = window.matchMedia('(max-width: 767px)').matches;
  const lowPower = (navigator.hardwareConcurrency || 8) <= 4 || (navigator.deviceMemory || 8) <= 4;
  return { saveData, small, lowPower };
}

const idle = (fn, timeout = 1500) =>
  'requestIdleCallback' in window ? window.requestIdleCallback(fn, { timeout }) : setTimeout(fn, 200);

/** Brillo suave pre-renderizado (sustituye a shadowBlur, que es caro por cuadro). */
function makeGlowSprite() {
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const g = c.getContext('2d');
  const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, 'rgba(127,214,248,0.9)');
  grad.addColorStop(0.35, 'rgba(1,185,255,0.35)');
  grad.addColorStop(1, 'rgba(1,185,255,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, 64, 64);
  return c;
}
/** Ruta marítima aproximada: Rin → Róterdam → Canal de la Mancha → Atlántico → Puerto Cabello. */
const SEA_WAYPOINTS = [
  [6.78, 51.22],
  [4.3, 51.9],
  [1.5, 51.0],
  [-5.5, 49.2],
  [-25, 38],
  [-61.5, 15.5],
  [-68.0, 10.47],
];

const ARC_SEGMENTS = 160;
const ARC_LIFT = 0.3;
const SHIP = new Path2D('M-7 -2.6 L5 -2.6 L8.5 0 L5 2.6 L-7 2.6 Z M-4.5 -1.4 L0.5 -1.4 L0.5 1.4 L-4.5 1.4 Z');
const PLANE = new Path2D(
  'M-8 -1.1 L4 -1.1 Q9 -1 9.5 0 Q9 1 4 1.1 L-8 1.1 Z M1 -1 L-3.5 -8.5 L-1.2 -8.5 L5 -1 Z M1 1 L-3.5 8.5 L-1.2 8.5 L5 1 Z M-6 -1 L-8.5 -4.5 L-7 -4.5 L-3.5 -1 Z M-6 1 L-8.5 4.5 L-7 4.5 L-3.5 1 Z',
);

function buildScene() {
  const n = landDots.length / 3;
  const dots = new Float32Array(n * 3);
  const flags = new Uint8Array(n);
  for (let i = 0; i < n; i++) {
    const v = toVec(landDots[i * 3] / 10, landDots[i * 3 + 1] / 10);
    dots[i * 3] = v[0];
    dots[i * 3 + 1] = v[1];
    dots[i * 3 + 2] = v[2];
    flags[i] = landDots[i * 3 + 2];
  }

  const flagged = [];
  for (let i = 0; i < n; i++) if (flags[i]) flagged.push(i);

  // Graticule cada 30°
  const grat = [];
  for (let lon = -180; lon < 180; lon += 30) {
    const line = [];
    for (let lat = -80; lat <= 80; lat += 4) line.push(toVec(lon, lat));
    grat.push(line);
  }
  for (let lat = -60; lat <= 60; lat += 30) {
    const line = [];
    for (let lon = -180; lon <= 180; lon += 4) line.push(toVec(lon, lat));
    grat.push(line);
  }

  // Arco elevado Düsseldorf → Caracas
  const a = toVec(...FROM);
  const b = toVec(...TO);
  const arc = [];
  for (let i = 0; i <= ARC_SEGMENTS; i++) {
    const t = i / ARC_SEGMENTS;
    const v = slerp(a, b, t);
    const h = 1 + ARC_LIFT * Math.sin(Math.PI * t);
    arc.push([v[0] * h, v[1] * h, v[2] * h]);
  }

  // Ruta marítima sobre la superficie
  const sea = [];
  for (let k = 0; k < SEA_WAYPOINTS.length - 1; k++) {
    const p = toVec(...SEA_WAYPOINTS[k]);
    const q = toVec(...SEA_WAYPOINTS[k + 1]);
    const ang = Math.acos(Math.max(-1, Math.min(1, p[0] * q[0] + p[1] * q[1] + p[2] * q[2])));
    const steps = Math.max(2, Math.round(ang / (1.2 * DEG)));
    for (let i = k === 0 ? 0 : 1; i <= steps; i++) {
      const v = slerp(p, q, i / steps);
      sea.push([v[0] * 1.004, v[1] * 1.004, v[2] * 1.004]);
    }
  }

  // Vista "home": desplazada al sureste del punto medio de la ruta para que el
  // arco no quede de frente (se ve curvado, con profundidad).
  const [midLon, midLat] = toLonLat(slerp(a, b, 0.5));
  return { dots, flags, flagged, grat, arc, sea, a, b, home: { lon: midLon + 14, lat: midLat - 14 } };
}

const project = (v, cam) => [
  v[0] * cam.e[0] + v[1] * cam.e[1] + v[2] * cam.e[2],
  v[0] * cam.n[0] + v[1] * cam.n[1] + v[2] * cam.n[2],
  v[0] * cam.c[0] + v[1] * cam.c[1] + v[2] * cam.c[2],
];
const hidden = (x, y, z) => z < 0 && x * x + y * y < 1;

/**
 * Globo interactivo del hero.
 * - Intro cinematográfica: el mundo entra girando, la cámara se acerca y se
 *   dibuja la ruta; la distancia cuenta hacia arriba.
 * - Arrastrar (ratón o dedo) para girar, con inercia; vuelve solo a la ruta.
 * - Teclado: flechas para girar, Inicio para recentrar.
 */
export default function Globe({ showDistance = true }) {
  const wrapRef = useRef(null);
  const canvasRef = useRef(null); // capa dinámica: rutas, avión, barco, pulsos
  const baseRef = useRef(null); // capa estática: esfera, puntos, atmósfera (solo se redibuja si cambia la cámara)
  const glRef = useRef(null); // Tierra fotorrealista (WebGL)
  const labelFrom = useRef(null);
  const labelTo = useRef(null);
  const badge = useRef(null);
  const badgeValue = useRef(null);
  const reduce = useReduceMotion();
  const scene = useMemo(buildScene, []);
  const [hint, setHint] = useState(true);
  const [away, setAway] = useState(false);
  const kickRef = useRef(() => {});

  const view = useRef({
    lon: scene.home.lon,
    lat: scene.home.lat,
    vLon: 0,
    vLat: 0,
    dragging: false,
    lastX: 0,
    lastY: 0,
    lastInteract: -Infinity,
    hx: 0,
    hy: 0,
    thx: 0,
    thy: 0,
    away: false,
    R: 200,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    const baseCanvas = baseRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !baseCanvas || !wrap) return undefined;
    const ctx = canvas.getContext('2d');
    const bctx = baseCanvas.getContext('2d');
    // En pantallas táctiles no hay parallax ni deriva: la Tierra queda quieta y no se redibuja
    const hoverCapable = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    let lastKey = '';
    const v = view.current;
    const profile = deviceProfile();
    const maxDpr = Math.min(window.devicePixelRatio || 1, profile.small || profile.lowPower ? 1.5 : 2);
    // Calidad adaptativa: si el dispositivo no sostiene ~45 fps, baja la resolución y luego a 30 fps
    let quality = 1;
    let dpr = maxDpr;
    // En móvil la capa animada va a 30 fps (el avión sigue fluido y se ahorra batería)
    let fps = profile.lowPower || profile.small ? 30 : 60;
    let lastDraw = 0;
    let prevNow = 0;
    let dtSum = 0;
    let dtN = 0;
    const glow = makeGlowSprite();
    let W = 0;
    let H = 0;
    let raf = 0;
    let running = false;
    let visible = false; // el IntersectionObserver lo activa: la intro empieza al entrar en pantalla
    let start = null;
    let lastCount = -1;
    let glFadeStart = null;

    // Tierra fotorrealista (WebGL). Si no hay WebGL o la conexión es lenta, queda el globo de puntos.
    const earth =
      glRef.current && !profile.saveData
        ? createEarthRenderer(glRef.current, textureSet(profile.small || profile.lowPower ? '1k' : '2k'))
        : null;
    const textureTimer = setTimeout(
      () =>
        idle(() => {
          earth
            ?.load()
            .then(() => {
              if (glDisabled) return;
              glFadeStart = performance.now();
              kick();
            })
            .catch(() => {});
        }),
      reduce ? 0 : T_INTRO - 400,
    );

    const resize = () => {
      const r = wrap.getBoundingClientRect();
      W = r.width;
      H = r.height;
      for (const [c, cx2] of [
        [canvas, ctx],
        [baseCanvas, bctx],
      ]) {
        c.width = Math.round(W * dpr);
        c.height = Math.round(H * dpr);
        c.style.width = `${W}px`;
        c.style.height = `${H}px`;
        cx2.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
      wrap.dataset.compact = String(W < 520);
      earth?.resize(W, H, dpr);
      lastKey = '';
      kick();
    };

    const place = (el, x, y, show, flip) => {
      if (!el) return;
      if (flip !== undefined && el.dataset.flip !== String(flip)) el.dataset.flip = String(flip);
      el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
      el.style.opacity = show ? '1' : '0';
    };

    const next = () => {
      if (running && visible) raf = requestAnimationFrame(frame);
      else running = false;
    };

    // Adaptación por etapas según el coste real (intervalo entre cuadros y trabajo de CPU):
    // 1) baja resolución → 2) 30 fps → 3) sin WebGL (globo de puntos) → 4) menos puntos y 24 fps
    let workSum = 0;
    let glDisabled = false;
    let dotStride = profile.lowPower ? 2 : 1;
    const adapt = (now, work) => {
      if (prevNow) {
        dtSum += Math.min(100, now - prevNow);
        workSum += work;
        dtN += 1;
      }
      prevNow = now;
      if (dtN < 30) return;
      const avgDt = dtSum / dtN;
      const avgWork = workSum / dtN;
      dtSum = 0;
      workSum = 0;
      dtN = 0;
      const budget = 1000 / fps;
      if (avgDt > budget * 1.4 || avgWork > budget * 0.6) {
        if (quality > 0.6) {
          quality = Math.max(0.6, quality - 0.2);
          dpr = Math.max(1, maxDpr * quality);
          resize();
        } else if (fps > 30) {
          fps = 30;
        } else if (!glDisabled && glFadeStart !== null) {
          glDisabled = true;
          glFadeStart = null;
          earth?.clear();
        } else if (dotStride < 3) {
          dotStride += 1;
          fps = 24;
        }
      }
    };

    const frame = (now) => {
      if (start === null) start = now;
      if (fps < 60 && now - lastDraw < 1000 / fps - 2) {
        next();
        return;
      }
      lastDraw = now;
      const workStart = performance.now();
      const t = reduce ? 1e9 : now - start;

      // ---- Cámara ----
      const intro = easeOutCubic(clamp01(t / T_INTRO));
      if (!v.dragging) {
        v.lon += v.vLon;
        v.lat += v.vLat;
        v.vLon *= 0.94;
        v.vLat *= 0.94;
        if (now - v.lastInteract > 2600) {
          const drift = reduce || !hoverCapable ? 0 : Math.sin(now * 0.00011) * 6;
          v.lon += shortestDelta(v.lon, scene.home.lon + drift) * 0.022;
          v.lat += (scene.home.lat - v.lat) * 0.022;
        }
      }
      v.lat = Math.max(-70, Math.min(70, v.lat));
      v.hx += (v.thx - v.hx) * 0.05;
      v.hy += (v.thy - v.hy) * 0.05;

      const lon0 = v.lon + (1 - intro) * 160 + v.hx * 7;
      const lat0 = v.lat - (1 - intro) * 18 - v.hy * 5;
      const cam = cameraBasis(lon0, lat0);
      const scale = 0.62 + 0.38 * intro;
      const R = Math.min(W, H) * 0.41 * scale;
      v.R = R;
      const cx = W / 2;
      const cy = H / 2;
      const alpha = clamp01(t / 900);
      const glFade = earth?.usable && !glDisabled && glFadeStart !== null ? (reduce ? 1 : easeInOutCubic(clamp01((now - glFadeStart) / 1100))) : 0;
      const dotsAlpha = 1 - glFade;

      // Capa estática: solo si cambió la cámara, el tamaño o un fundido
      const key = `${lon0.toFixed(2)}|${lat0.toFixed(2)}|${R.toFixed(1)}|${alpha.toFixed(2)}|${glFade.toFixed(3)}|${dotStride}|${W}|${H}|${dpr}`;
      if (key !== lastKey) {
        lastKey = key;
        if (glFade > 0) {
          // Sol a la izquierda de la cámara: América de día, Europa en el crepúsculo con sus luces
          const sx = -0.86;
          const sy = 0.3;
          const sz = 0.41;
          const sun = [0, 1, 2].map((k) => sx * cam.e[k] + sy * cam.n[k] + sz * cam.c[k]);
          earth.render({ cx, cy, R, cam, sun, alpha, H, dpr });
        }

        bctx.clearRect(0, 0, W, H);
        bctx.globalAlpha = alpha * dotsAlpha;
        let g;

        if (dotsAlpha > 0) {
        // ---- Atmósfera ----
        g = bctx.createRadialGradient(cx, cy, R * 0.92, cx, cy, R * 1.38);
        g.addColorStop(0, 'rgba(1,185,255,0.32)');
        g.addColorStop(0.35, 'rgba(1,185,255,0.1)');
        g.addColorStop(1, 'rgba(1,185,255,0)');
        bctx.fillStyle = g;
        bctx.fillRect(0, 0, W, H);

        // ---- Esfera ----
        g = bctx.createRadialGradient(cx - R * 0.38, cy - R * 0.45, R * 0.05, cx, cy, R * 1.05);
        g.addColorStop(0, '#0A4D78');
        g.addColorStop(0.45, '#06304F');
        g.addColorStop(1, '#02121F');
        bctx.fillStyle = g;
        bctx.beginPath();
        bctx.arc(cx, cy, R, 0, Math.PI * 2);
        bctx.fill();
        }

        // ---- Graticule (se mantiene tenue sobre la Tierra real: estética HUD) ----
        bctx.globalAlpha = alpha * (dotsAlpha + glFade * 0.6);
        bctx.strokeStyle = 'rgba(127,214,248,0.07)';
        bctx.lineWidth = 1;
        bctx.beginPath();
        for (const line of scene.grat) {
          let pen = false;
          for (const p of line) {
            const [x, y, z] = project(p, cam);
            if (z <= 0) {
              pen = false;
              continue;
            }
            const sx = cx + R * x;
            const sy = cy - R * y;
            if (pen) bctx.lineTo(sx, sy);
            else bctx.moveTo(sx, sy);
            pen = true;
          }
        }
        bctx.stroke();
        bctx.globalAlpha = alpha * dotsAlpha;

        // ---- Puntos de tierra (agrupados por profundidad) ----
        const buckets = [new Path2D(), new Path2D(), new Path2D(), new Path2D(), new Path2D()];
        const de = new Path2D();
        const ve = new Path2D();
        const d = scene.dots;
        const base = Math.max(0.7, R / 260);
        // Con la Tierra real visible solo se dibujan los puntos de Alemania y Venezuela
        const list = dotsAlpha > 0 ? null : scene.flagged;
        const count0 = list ? list.length : scene.flags.length;
        for (let j = 0; j < count0; j += list ? 1 : dotStride) {
          const i = list ? list[j] : j;
          const x0 = d[i * 3];
          const y0 = d[i * 3 + 1];
          const z0 = d[i * 3 + 2];
          const z = x0 * cam.c[0] + y0 * cam.c[1] + z0 * cam.c[2];
          if (z <= 0.04) continue;
          const sx = cx + R * (x0 * cam.e[0] + y0 * cam.e[1] + z0 * cam.e[2]);
          const sy = cy - R * (x0 * cam.n[0] + y0 * cam.n[1] + z0 * cam.n[2]);
          const f = scene.flags[i];
          const r = base * (0.55 + 0.75 * z) * (f ? 1.25 : 1);
          const path = f === 1 ? de : f === 2 ? ve : buckets[Math.min(4, (z * 5) | 0)];
          path.moveTo(sx + r, sy);
          path.arc(sx, sy, r, 0, Math.PI * 2);
        }
        if (dotsAlpha > 0) {
          for (let b = 0; b < 5; b++) {
            bctx.fillStyle = `rgba(127,214,248,${0.16 + b * 0.15})`;
            bctx.fill(buckets[b]);
          }
        }
        // Alemania y Venezuela siguen destacadas sobre la Tierra real
        bctx.globalAlpha = alpha * (dotsAlpha + glFade * 0.45);
        bctx.fillStyle = '#ffffff';
        bctx.fill(de);
        bctx.fillStyle = '#E06B65';
        bctx.fill(ve);

        // ---- Sombreado de borde + luz de contorno ----
        bctx.globalAlpha = alpha * dotsAlpha;
        if (dotsAlpha > 0) {
          g = bctx.createRadialGradient(cx - R * 0.2, cy - R * 0.25, R * 0.5, cx, cy, R);
          g.addColorStop(0, 'rgba(2,18,31,0)');
          g.addColorStop(1, 'rgba(2,18,31,0.6)');
          bctx.fillStyle = g;
          bctx.beginPath();
          bctx.arc(cx, cy, R, 0, Math.PI * 2);
          bctx.fill();
        }
        bctx.globalAlpha = alpha;
        bctx.beginPath();
        bctx.arc(cx, cy, R, 0, Math.PI * 2);
        bctx.strokeStyle = 'rgba(127,214,248,0.35)';
        bctx.lineWidth = 1.2;
        bctx.stroke();
      }

      // Capa dinámica
      ctx.clearRect(0, 0, W, H);
      ctx.globalAlpha = alpha;

      // ---- Ruta marítima (punteada) + barco ----
      const seaIn = reduce ? 1 : clamp01((t - T_ARC_START - T_ARC) / 900);
      if (seaIn > 0) {
        const seaPts = scene.sea.map((p) => {
          const [x, y, z] = project(p, cam);
          return [cx + R * x, cy - R * y, z < 0];
        });
        ctx.save();
        ctx.globalAlpha = alpha * seaIn;
        ctx.setLineDash([2, 6]);
        ctx.lineCap = 'round';
        ctx.strokeStyle = 'rgba(255,255,255,0.55)';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        let pen = false;
        for (const [sx, sy, hid] of seaPts) {
          if (hid) {
            pen = false;
            continue;
          }
          if (pen) ctx.lineTo(sx, sy);
          else ctx.moveTo(sx, sy);
          pen = true;
        }
        ctx.stroke();
        ctx.setLineDash([]);
        const st = reduce ? 0.55 : ((t - T_ARC_START - T_ARC) % SHIP_PERIOD) / SHIP_PERIOD;
        const si = Math.min(seaPts.length - 2, Math.floor(st * (seaPts.length - 1)));
        const [shx, shy, shHid] = seaPts[si];
        if (!shHid) {
          ctx.translate(shx, shy);
          ctx.rotate(Math.atan2(seaPts[si + 1][1] - shy, seaPts[si + 1][0] - shx));
          ctx.drawImage(glow, -14, -14, 28, 28);
          ctx.fillStyle = '#ffffff';
          ctx.fill(SHIP, 'evenodd');
        }
        ctx.restore();
      }

      // ---- Ruta aérea ----
      const prog = reduce ? 1 : easeInOutCubic(clamp01((t - T_ARC_START) / T_ARC));
      const pts = scene.arc.map((p) => {
        const [x, y, z] = project(p, cam);
        return [cx + R * x, cy - R * y, hidden(x, y, z)];
      });
      const last = Math.floor(prog * ARC_SEGMENTS);
      if (last > 0) {
        const grad = ctx.createLinearGradient(pts[0][0], pts[0][1], pts[ARC_SEGMENTS][0], pts[ARC_SEGMENTS][1]);
        grad.addColorStop(0, '#7FD6F8');
        grad.addColorStop(0.6, '#01B9FF');
        grad.addColorStop(1, '#CC4D47');
        const routePath = new Path2D();
        let pen = false;
        for (let i = 0; i <= last; i++) {
          const [sx, sy, hid] = pts[i];
          if (hid) {
            pen = false;
            continue;
          }
          if (pen) routePath.lineTo(sx, sy);
          else routePath.moveTo(sx, sy);
          pen = true;
        }
        ctx.lineCap = 'round';
        ctx.strokeStyle = 'rgba(1,185,255,0.25)';
        ctx.lineWidth = 7;
        ctx.stroke(routePath);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 2.2;
        ctx.stroke(routePath);
      }

      // ---- Marcadores con pulso ----
      const pulse = ((now % 2400) / 2400);
      const marker = (vec, color, ringColor, delay) => {
        const [x, y, z] = project(vec, cam);
        if (z <= 0) return [cx + R * x, cy - R * y, false];
        const sx = cx + R * x;
        const sy = cy - R * y;
        const ph = (pulse + delay) % 1;
        if (!reduce) {
          ctx.strokeStyle = ringColor.replace('A', String(0.8 * (1 - ph)));
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(sx, sy, 4 + ph * 18, 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(sx, sy, 4.5, 0, Math.PI * 2);
        ctx.fill();
        return [sx, sy, true];
      };
      const mFrom = marker(scene.a, '#ffffff', 'rgba(127,214,248,A)', 0);
      const mTo = prog > 0.98 ? marker(scene.b, '#CC4D47', 'rgba(224,107,101,A)', 0.5) : [0, 0, false];

      // ---- Avión ----
      if (prog >= 1) {
        const tt = reduce ? 0.6 : easeInOutCubic(((t - T_ARC_START - T_ARC) % PLANE_PERIOD) / PLANE_PERIOD);
        const i = Math.min(ARC_SEGMENTS - 1, Math.floor(tt * ARC_SEGMENTS));
        const tail = Math.max(0, i - 22);
        const [px, py, ph] = pts[i];
        const [nx, ny] = pts[i + 1];
        if (!ph) {
          // estela
          ctx.lineCap = 'round';
          for (let k = tail; k < i; k++) {
            if (pts[k][2] || pts[k + 1][2]) continue;
            ctx.strokeStyle = `rgba(255,255,255,${((k - tail) / (i - tail)) * 0.7})`;
            ctx.lineWidth = 2.4;
            ctx.beginPath();
            ctx.moveTo(pts[k][0], pts[k][1]);
            ctx.lineTo(pts[k + 1][0], pts[k + 1][1]);
            ctx.stroke();
          }
          ctx.save();
          ctx.translate(px, py);
          ctx.rotate(Math.atan2(ny - py, nx - px));
          ctx.drawImage(glow, -18, -18, 36, 36);
          ctx.scale(1.15, 1.15);
          ctx.fillStyle = '#ffffff';
          ctx.fill(PLANE);
          ctx.restore();
        }
      }
      ctx.globalAlpha = 1;

      // ---- Capas HTML (etiquetas y distancia) ----
      const hud = reduce || t > T_HUD;
      // Las etiquetas cambian de lado cerca de los bordes para no salirse
      place(labelFrom.current, mFrom[0], mFrom[1], hud && mFrom[2], mFrom[0] > W * 0.6);
      place(labelTo.current, mTo[0], mTo[1], hud && mTo[2], mTo[0] < W * 0.4);
      const apex = pts[ARC_SEGMENTS >> 1];
      place(badge.current, apex[0], apex[1], hud && !apex[2]);
      const count = reduce ? DISTANCE_KM : DISTANCE_KM * easeOutCubic(clamp01((t - T_HUD) / T_COUNT));
      const rounded = Math.round(count);
      if (rounded !== lastCount && badgeValue.current) {
        badgeValue.current.textContent = formatInt(rounded);
        lastCount = rounded;
      }

      // Botón «recentrar»
      const isAway = Math.abs(shortestDelta(v.lon, scene.home.lon)) > 25 || Math.abs(v.lat - scene.home.lat) > 20;
      if (isAway !== v.away) {
        v.away = isAway;
        setAway(isAway);
      }

      // ¿Seguir animando?
      const moving =
        v.dragging || Math.abs(v.vLon) > 0.01 || Math.abs(v.vLat) > 0.01 || Math.abs(v.hx - v.thx) > 0.001 || isAway ||
        Math.abs(shortestDelta(v.lon, scene.home.lon)) > 0.05;
      if (reduce && !moving) running = false;
      if (now - start > T_INTRO) adapt(now, performance.now() - workStart);
      next();
    };

    function kick() {
      if (running || !visible || document.hidden) return;
      running = true;
      raf = requestAnimationFrame(frame);
    }
    kickRef.current = kick;

    const ro = new ResizeObserver(resize);
    ro.observe(wrap);
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) kick();
      else {
        running = false;
        cancelAnimationFrame(raf);
      }
    });
    io.observe(wrap);
    const onVis = () => {
      if (document.hidden) {
        running = false;
        cancelAnimationFrame(raf);
      } else kick();
    };
    document.addEventListener('visibilitychange', onVis);

    resize();
    return () => {
      running = false;
      cancelAnimationFrame(raf);
      clearTimeout(textureTimer);
      earth?.destroy();
      ro.disconnect();
      io.disconnect();
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [reduce, scene]);

  // ---- Interacción ----
  const interact = useCallback(() => {
    view.current.lastInteract = performance.now();
    setHint(false);
    kickRef.current();
  }, []);

  const onPointerDown = (e) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    const v = view.current;
    v.dragging = true;
    v.lastX = e.clientX;
    v.lastY = e.clientY;
    v.vLon = 0;
    v.vLat = 0;
    e.currentTarget.setPointerCapture?.(e.pointerId);
    interact();
  };

  const onPointerMove = (e) => {
    const v = view.current;
    if (v.dragging) {
      const k = (1 / DEG / Math.max(80, v.R)) * 0.9;
      const dx = e.clientX - v.lastX;
      const dy = e.clientY - v.lastY;
      v.lastX = e.clientX;
      v.lastY = e.clientY;
      v.lon -= dx * k;
      v.lat += dy * k;
      v.vLon = -dx * k;
      v.vLat = dy * k;
      v.lastInteract = performance.now();
    } else if (e.pointerType === 'mouse') {
      const r = e.currentTarget.getBoundingClientRect();
      v.thx = ((e.clientX - r.left) / r.width - 0.5) * 2;
      v.thy = ((e.clientY - r.top) / r.height - 0.5) * 2;
      kickRef.current();
    }
  };

  const onPointerUp = () => {
    view.current.dragging = false;
    view.current.lastInteract = performance.now();
  };

  const onPointerLeave = () => {
    view.current.thx = 0;
    view.current.thy = 0;
  };

  const recenter = () => {
    view.current.lastInteract = -Infinity;
    view.current.vLon = 0;
    view.current.vLat = 0;
    kickRef.current();
  };

  const onKeyDown = (e) => {
    const v = view.current;
    const map = { ArrowLeft: [8, 0], ArrowRight: [-8, 0], ArrowUp: [0, -6], ArrowDown: [0, 6] };
    if (map[e.key]) {
      e.preventDefault();
      v.vLon = map[e.key][0] * 0.12;
      v.vLat = map[e.key][1] * 0.12;
      interact();
    } else if (e.key === 'Home') {
      e.preventDefault();
      recenter();
    }
  };

  const km = formatInt(Math.round(DISTANCE_KM));

  return (
    <div className="globe">
      <div
        ref={wrapRef}
        className="globe__stage"
        tabIndex={0}
        role="group"
        aria-roledescription="globo interactivo"
        aria-label={`Globo terrestre con la ruta de Düsseldorf, Alemania, a Caracas, Venezuela: aproximadamente ${km} kilómetros en línea recta. Arrastra o usa las flechas para girarlo.`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onPointerLeave={onPointerLeave}
        onKeyDown={onKeyDown}
      >
        <canvas ref={glRef} className="globe__canvas" aria-hidden="true" />
        <canvas ref={baseRef} className="globe__canvas" aria-hidden="true" />
        <canvas ref={canvasRef} className="globe__canvas" aria-hidden="true" />

        <div ref={labelFrom} className="globe__label globe__label--from" aria-hidden="true">
          <span className="globe__label-inner">
            <Flag code="de" size={16} /> Düsseldorf
          </span>
        </div>
        <div ref={labelTo} className="globe__label globe__label--to" aria-hidden="true">
          <span className="globe__label-inner">
            <Flag code="ve" size={16} /> Venezuela
          </span>
        </div>
        <div ref={badge} className="globe__badge" aria-hidden="true" hidden={!showDistance}>
          <span className="globe__badge-inner">
            <span className="globe__badge-value">
              ≈ <span ref={badgeValue}>0</span> km
            </span>
            <span className="globe__badge-sub">en línea recta</span>
          </span>
        </div>
      </div>

      <p className={`globe__hint ${hint ? '' : 'is-hidden'}`} aria-hidden="true">
        <Hand size={14} /> Arrastra para girar el mundo
      </p>
      <button type="button" className={`globe__recenter ${away ? 'is-visible' : ''}`} onClick={recenter} tabIndex={away ? 0 : -1}>
        <LocateFixed size={16} aria-hidden="true" /> Ver la ruta
      </button>
    </div>
  );
}
