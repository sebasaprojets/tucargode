import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { Flip } from 'gsap/Flip';
import { INTRO } from './introConfig';
import { createIntroMist } from './introMist';
import { siteConfig } from '../../config/siteConfig';
import { INTRO_DONE_EVENT, markIntroSeen } from '../../lib/intro';
import { setScrollLocked, scrollToTop } from '../../lib/scroll';
import { isDesktopMotion } from '../../hooks/useMotionPreference';
import { distanceKm } from '../Globe/globeMath';
import { origin, destinations } from '../../data/destinations';
import { formatInt } from '../../utils/format';
import './Intro.css';

gsap.registerPlugin(Flip);

const asset = (path) => `${import.meta.env.BASE_URL}${path}`;
const LOGO_SRC = asset(siteConfig.brand.logo.webp[512]);
const CARACAS = destinations.find((d) => d.id === 'caracas');
const KM = Math.round(distanceKm(origin.coords, CARACAS.coords)); // distancia real en línea recta
const fmtCoords = ([lon, lat]) =>
  `${Math.abs(lat).toFixed(2)}° ${lat >= 0 ? 'N' : 'S'} · ${Math.abs(lon).toFixed(2)}° ${lon >= 0 ? 'E' : 'O'}`;
const HUD_FROM = `${origin.label} · ${fmtCoords(origin.coords)}`;
const HUD_TO = `${CARACAS.label} · ${fmtCoords(CARACAS.coords)}`;
const GLYPHS = '0123456789°·NSEO';
const RING_R = 49; // radio del aro en el viewBox 0..100
const SVG_NS = 'http://www.w3.org/2000/svg';

/** Cambia un texto con efecto «scramble» (HUD de coordenadas). */
function scrambleTo(el, text, duration) {
  const o = { p: 0 };
  return gsap.to(o, {
    p: 1,
    duration,
    ease: 'none',
    onUpdate: () => {
      const n = Math.floor(o.p * text.length);
      let out = text.slice(0, n);
      for (let i = n; i < text.length; i++) out += text[i] === ' ' ? ' ' : GLYPHS[(Math.random() * GLYPHS.length) | 0];
      el.textContent = out;
    },
    onComplete: () => (el.textContent = text),
  });
}

/** Línea de titular con máscara (el texto sube desde abajo). */
function Mask({ children }) {
  return (
    <span className="intro__mask">
      <span>{children}</span>
    </span>
  );
}

/**
 * Intro cinematográfica en formato «brand film» (solo en la primera visita).
 *  1) Barras de cine con HUD (ruta, coordenadas reales, timecode y progreso),
 *     grano y niebla; la película del carguero aparece desde negro en cámara lenta.
 *  2) Titulares con máscara: «De Alemania a Venezuela.» y la distancia real
 *     contando hasta 7.965 km — «Ninguna distancia es suficiente.»
 *  3) En medio del mar el agua se agita, un aro se cierra y el sello de TUCARGO
 *     emerge con su reflejo; «TUCARGO» letra a letra y un brillo cruza el logo.
 *  4) Las barras se abren y el logo se desliza hasta su sitio en el header
 *     (GSAP Flip) mientras el sitio entra en cascada.
 * Interacción: parallax 3D lento con el ratón (o el giroscopio), clic en el agua =
 * ondas, botón «Saltar intro» y tecla Esc.
 */
export default function Intro({ onDone }) {
  const rootRef = useRef(null);
  const [mobile] = useState(() => typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches);
  const S = mobile ? INTRO.sealSize.mobile : INTRO.sealSize.desktop;
  const sources = mobile ? INTRO.video.mobile : INTRO.video.desktop;

  useEffect(() => {
    const root = rootRef.current;
    const $ = (s) => root.querySelector(s);
    const html = document.documentElement;
    const T = INTRO.timing;
    const prefersReduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const reduce = prefersReduce && (INTRO.respectReducedMotionOnDesktop || !isDesktopMotion());

    // ---- Estado global mientras dura la intro ----
    window.__tucargoIntro = true;
    html.classList.add('intro-active');
    html.classList.remove('intro-pending');
    scrollToTop();
    setScrollLocked(true);
    const behind = [...root.parentElement.children].filter((n) => n !== root);
    behind.forEach((n) => n.setAttribute('inert', ''));
    root.classList.toggle('is-reduced', reduce);

    const el = {
      film: $('.intro__film'),
      video: $('.intro__video'),
      mist: $('.intro__mist'),
      water: $('.intro__water'),
      grade: $('.intro__grade--titles'),
      title1: root.querySelectorAll('.intro__title--1 .intro__mask > span'),
      title2: root.querySelectorAll('.intro__title--2 .intro__mask > span'),
      km: $('.intro__km'),
      hud: root.querySelectorAll('.intro__hud'),
      place: $('.intro__place'),
      timecode: $('.intro__timecode'),
      progress: $('.intro__progress span'),
      tilt: $('.intro__tilt'),
      camera: $('.intro__camera'),
      logo: $('.intro__logo'),
      glow: $('.intro__glow'),
      reflection: $('.intro__reflection'),
      ring: $('.intro__ring'),
      ringCircle: $('.intro__ring circle'),
      shine: $('.intro__shine span'),
      letters: root.querySelectorAll('.intro__word span'),
      tagline: $('.intro__tagline'),
      text: $('.intro__text'),
      grain: $('.intro__grain'),
      vignette: $('.intro__vignette'),
      barTop: $('.intro__bar--top'),
      barBottom: $('.intro__bar--bottom'),
      skip: $('.intro__skip'),
    };

    const mist = reduce ? null : createIntroMist(el.mist, { mobile });
    let exiting = false;
    let sealed = false;

    // Película en cámara lenta, sin sonido; si el navegador no deja reproducirla
    // (ahorro de datos/energía) se queda la imagen fija con el dolly.
    const video = el.video;
    video.muted = true;
    video.playbackRate = INTRO.video.playbackRate;
    video.addEventListener('loadedmetadata', () => (video.playbackRate = INTRO.video.playbackRate));
    const videoReady = new Promise((resolve) => {
      if (video.readyState >= 3) resolve();
      video.addEventListener('canplay', resolve, { once: true });
      video.addEventListener('error', resolve, { once: true });
      // si ningún formato es compatible, el error llega en la última <source>
      video.querySelector('source:last-of-type')?.addEventListener('error', resolve, { once: true });
    });

    // ---- Ondas en el agua (SVG a pantalla completa, coordenadas en px) ----
    const ripple = (x, y, { scale = 1, rings = 3 } = {}) => {
      const depth = Math.min(1.5, 0.45 + (y / window.innerHeight) * 1.1) * scale; // lejos = más pequeñas
      for (let i = 0; i < rings; i++) {
        const e = document.createElementNS(SVG_NS, 'ellipse');
        e.setAttribute('cx', x);
        e.setAttribute('cy', y);
        e.setAttribute('rx', '2');
        e.setAttribute('ry', '0.6');
        e.setAttribute('class', 'intro__ripple');
        el.water.appendChild(e);
        const max = (60 + i * 34) * depth;
        gsap.fromTo(
          e,
          { attr: { rx: 2, ry: 0.6 }, opacity: 0.85 },
          {
            attr: { rx: max, ry: max * 0.24 },
            opacity: 0,
            duration: 2.4,
            delay: i * 0.24,
            ease: 'power2.out',
            onComplete: () => e.remove(),
          },
        );
      }
    };
    const sealBase = () => {
      const r = el.camera.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.bottom - r.height * 0.06 };
    };

    // ---- Estados iniciales ----
    const R0 = Math.min(window.innerWidth, window.innerHeight) * 0.42;
    gsap.set(el.film, { opacity: 0, scale: INTRO.cameraZoom[0] });
    gsap.set([el.logo, el.reflection, el.glow, el.ring, el.tagline, el.grade, ...el.hud], { opacity: 0 });
    gsap.set([...el.title1, ...el.title2], { yPercent: 115 });
    gsap.set(el.progress, { scaleX: 0, transformOrigin: '0 50%' });
    gsap.set(el.logo, { y: 34, scale: 0.9, filter: 'blur(14px)' });
    gsap.set(el.ringCircle, { attr: { r: (RING_R * R0) / (S / 2) } });
    gsap.set(el.letters, { opacity: 0, y: 22 });
    gsap.set(el.shine, { xPercent: -320, rotate: 22 });

    // ---- Salida ----
    const finish = () => {
      html.classList.remove('intro-active');
      behind.forEach((n) => n.removeAttribute('inert'));
      setScrollLocked(false);
      window.__tucargoIntro = false;
      window.dispatchEvent(new Event(INTRO_DONE_EVENT));
      onDone?.();
    };

    // El sitio aparece en cascada (fade + desliza de abajo arriba)
    const cascade = () => {
      const header = document.querySelector('.header');
      const items = ['.hero__eyebrow', '.hero__title-wrap', '.hero__lead', '.hero__ctas', '.hero__facts', '.hero__scroll']
        .map((s) => document.querySelector(s))
        .filter(Boolean);
      if (header) gsap.fromTo(header, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.6, ease: 'power2.out', clearProps: 'opacity,visibility' });
      gsap.fromTo(
        items,
        { y: 50, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 1.2, stagger: 0.1, delay: 0.2, ease: 'power4.out', clearProps: 'transform,opacity,visibility' },
      );
      const scene = document.querySelector('.hero .hs');
      if (scene) gsap.fromTo(scene, { opacity: 0 }, { opacity: 1, duration: 1.6, ease: 'power2.out', clearProps: 'opacity' });
    };

    const exit = (fast = false) => {
      if (exiting) return;
      exiting = true;
      markIntroSeen();
      tl.pause();

      // Movimiento reducido o salto antes de que aparezca el sello: fundido simple
      if (reduce || !sealed) {
        cascade();
        gsap.to(root, { opacity: 0, duration: reduce ? 0.5 : T.skipDuration, ease: 'power2.inOut', onComplete: finish });
        return;
      }

      const d = fast ? T.skipDuration : T.exitDuration;
      const target = document.querySelector('.header .logo__badge');
      const xt = gsap.timeline({ onComplete: finish });
      // el logo queda plano y nítido; se apagan textos, reflejo y brillo
      xt.to(el.tilt, { rotateX: 0, rotateY: 0, x: 0, y: 0, duration: d * 0.3, ease: 'power2.out' }, 0);
      xt.to(el.logo, { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)', duration: d * 0.25 }, 0);
      xt.to([el.text, el.reflection, el.glow, el.grade, el.skip, ...el.hud, ...el.title1, ...el.title2], { opacity: 0, duration: d * 0.3, ease: 'power1.out' }, 0);
      // se abren las barras de cine
      xt.to(el.barTop, { yPercent: -100, duration: d * 0.7, ease: 'expo.inOut' }, 0);
      xt.to(el.barBottom, { yPercent: 100, duration: d * 0.7, ease: 'expo.inOut' }, 0);
      // el logo se desliza hasta su sitio exacto en el header
      xt.add(() => {
        if (target && target.getBoundingClientRect().width > 0) {
          Flip.fit(el.camera, target, { scale: true, duration: d * 0.78, ease: 'expo.inOut' });
        } else {
          gsap.to(el.camera, { opacity: 0, scale: 0.6, duration: d * 0.5 });
        }
      }, d * 0.12);
      xt.to(el.ring, { opacity: 0, duration: d * 0.4 }, d * 0.5);
      xt.to([el.film, el.mist, el.grain, el.vignette, el.water], { opacity: 0, duration: d * 0.7, ease: 'power2.inOut' }, d * 0.2);
      xt.add(cascade, d * 0.25);
      xt.to({}, { duration: 0 }, d * 0.9);
    };

    // ---- Línea de tiempo principal ----
    // Timecode de película (24 fps) durante la intro
    const pad = (n) => String(n).padStart(2, '0');
    const tl = gsap.timeline({
      paused: true,
      onUpdate: () => {
        const f = Math.floor(tl.time() * 24);
        el.timecode.textContent = `00:00:${pad(Math.floor(f / 24))}:${pad(f % 24)}`;
      },
    });
    if (reduce) {
      gsap.set([el.barTop, el.barBottom, el.grain], { opacity: 0 });
      gsap.set(el.film, { scale: 1 });
      gsap.set(el.logo, { y: 0, scale: 1, filter: 'none' });
      tl.to(el.film, { opacity: 1, duration: 0.6 }, 0);
      tl.to(el.logo, { opacity: 1, duration: 0.6, ease: 'power1.out' }, 0.2);
      tl.call(() => exit(true), null, 2);
    } else {
      // 1) La película aparece desde negro con un dolly lento durante toda la intro
      tl.to(el.film, { opacity: 1, duration: T.filmInDuration, ease: 'power2.out' }, 0);
      tl.to(el.film, { scale: INTRO.cameraZoom[1], duration: T.exit + 0.5, ease: 'sine.inOut' }, 0);
      tl.to(mist.fx, { alpha: 0.6, duration: 2, ease: 'sine.inOut' }, 0);
      tl.to(el.hud, { opacity: 1, duration: 0.9, ease: 'power2.out', stagger: 0.08 }, 0.3);
      tl.to(el.progress, { scaleX: 1, duration: T.exit, ease: 'none' }, 0);
      // 2) Titulares con máscara (ritmo de tráiler)
      tl.to(el.grade, { opacity: 1, duration: 1, ease: 'power2.out' }, T.title1 - 0.3);
      tl.to(el.title1, { yPercent: 0, duration: 1.1, ease: 'expo.out', stagger: 0.09 }, T.title1);
      tl.to(el.title1, { yPercent: -115, duration: 0.6, ease: 'power3.in', stagger: 0.05 }, T.title1Out);
      tl.to(el.title2, { yPercent: 0, duration: 1.1, ease: 'expo.out', stagger: 0.12 }, T.title2);
      const km = { v: 0 };
      tl.to(
        km,
        { v: KM, duration: 1.2, ease: 'power3.out', onUpdate: () => (el.km.textContent = formatInt(Math.round(km.v))) },
        T.title2 + 0.1,
      );
      tl.add(scrambleTo(el.place, HUD_TO, 0.9), T.title2 + 0.2); // el HUD «viaja» a Caracas
      tl.to(el.title2, { yPercent: -115, duration: 0.6, ease: 'power3.in', stagger: 0.05 }, T.title2Out);
      tl.to(el.grade, { opacity: 0, duration: 0.8, ease: 'power2.inOut' }, T.title2Out);
      // 2) En medio del mar: ondas, el aro se cierra y el sello emerge del agua
      tl.call(() => {
        const b = sealBase();
        ripple(b.x, b.y, { scale: 1.3, rings: 4 });
      }, null, T.ripples);
      tl.to(el.ring, { opacity: 1, duration: 0.6, ease: 'power1.out' }, T.ring);
      tl.to(el.ringCircle, { attr: { r: RING_R }, duration: T.ringDuration, ease: 'expo.inOut' }, T.ring);
      tl.to(el.glow, { opacity: 1, duration: 1.4, ease: 'power2.out' }, T.logo - 0.2);
      tl.to(
        el.logo,
        { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)', duration: T.logoDuration, ease: 'power4.out' },
        T.logo,
      );
      tl.set(el.logo, { filter: 'none' }, T.logo + T.logoDuration);
      tl.to(el.reflection, { opacity: 1, duration: 1.2, ease: 'power2.out' }, T.logo + 0.4);
      tl.call(() => (sealed = true), null, T.logo + 0.5);
      // 3) «TUCARGO» letra a letra y brillo
      tl.to(el.letters, { opacity: 1, y: 0, duration: 0.8, ease: 'power4.out', stagger: T.letterStagger }, T.letters);
      tl.to(el.tagline, { opacity: 1, duration: 0.8, ease: 'power2.out' }, T.letters + 0.5);
      tl.to(el.shine, { xPercent: 320, duration: 1.1, ease: 'power2.inOut' }, T.shine);
      // 4) Salida
      tl.call(() => exit(false), null, T.exit);
    }

    // Arranca cuando la película puede reproducirse (con un máximo de espera)
    Promise.race([videoReady, new Promise((r) => setTimeout(r, INTRO.video.maxWait * 1000))]).then(() => {
      if (exiting) return;
      video.play?.().catch(() => {});
      tl.play();
    });

    // ---- Interacción: parallax 3D lento ----
    const tiltX = gsap.quickTo(el.tilt, 'rotateX', { duration: 1.8, ease: 'power3.out' });
    const tiltY = gsap.quickTo(el.tilt, 'rotateY', { duration: 1.8, ease: 'power3.out' });
    const filmX = gsap.quickTo(el.video, 'x', { duration: 2.2, ease: 'power3.out' });
    const filmY = gsap.quickTo(el.video, 'y', { duration: 2.2, ease: 'power3.out' });
    const aim = (nx, ny) => {
      if (exiting || reduce) return;
      nx = Math.max(-1, Math.min(1, nx));
      ny = Math.max(-1, Math.min(1, ny));
      tiltY(nx * INTRO.tiltMax);
      tiltX(-ny * INTRO.tiltMax);
      filmX(-nx * INTRO.filmParallax);
      filmY(-ny * INTRO.filmParallax * 0.5);
      mist?.setParallax(nx, ny);
    };
    const onMove = (e) => aim((e.clientX / window.innerWidth) * 2 - 1, (e.clientY / window.innerHeight) * 2 - 1);
    const onOrient = (e) => e.gamma != null && aim(e.gamma / 35, (e.beta - 45) / 35);
    if (window.DeviceOrientationEvent && typeof window.DeviceOrientationEvent.requestPermission !== 'function') {
      window.addEventListener('deviceorientation', onOrient);
    }

    // ---- Interacción: un clic en el agua crea ondas ----
    let gyroAsked = false;
    const onDown = (e) => {
      if (exiting || reduce || e.target.closest('button')) return;
      // iOS pide permiso para el giroscopio en el primer toque
      const D = window.DeviceOrientationEvent;
      if (!gyroAsked && D && typeof D.requestPermission === 'function') {
        gyroAsked = true;
        D.requestPermission()
          .then((s) => s === 'granted' && window.addEventListener('deviceorientation', onOrient))
          .catch(() => {});
      }
      // el mar ocupa la pantalla por debajo del horizonte (≈ 22 % de la altura)
      if (e.clientY > window.innerHeight * 0.22) ripple(e.clientX, e.clientY);
    };
    const onKey = (e) => {
      if (e.key === 'Escape') exit(true);
    };
    const onSkip = () => exit(true);

    root.addEventListener('pointermove', onMove);
    root.addEventListener('pointerdown', onDown);
    window.addEventListener('keydown', onKey);
    el.skip.addEventListener('click', onSkip);

    return () => {
      root.removeEventListener('pointermove', onMove);
      root.removeEventListener('pointerdown', onDown);
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('deviceorientation', onOrient);
      el.skip.removeEventListener('click', onSkip);
      tl.kill();
      mist?.destroy();
      video.pause();
      if (!exiting) {
        // desmontaje inesperado: no dejar el sitio bloqueado
        html.classList.remove('intro-active');
        behind.forEach((n) => n.removeAttribute('inert'));
        setScrollLocked(false);
        window.dispatchEvent(new Event(INTRO_DONE_EVENT));
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={rootRef}
      className="intro"
      role="dialog"
      aria-modal="true"
      aria-label="Introducción de TUCARGO"
      style={{ '--seal': `${S}px`, '--focus-x': INTRO.video.focusX }}
    >
      {/* 1) Película */}
      <div className="intro__film" aria-hidden="true">
        <video className="intro__video" poster={asset(INTRO.video.poster)} muted playsInline autoPlay preload="auto" disablePictureInPicture>
          {sources.map((s) => (
            <source key={s.src} src={asset(s.src)} type={s.type} />
          ))}
        </video>
        <div className="intro__grade" />
      </div>
      <canvas className="intro__mist" aria-hidden="true" />
      <svg className="intro__water" aria-hidden="true" />

      {/* 2) Titulares */}
      <div className="intro__grade--titles" aria-hidden="true" />
      <div className="intro__titles" aria-hidden="true">
        <div className="intro__title intro__title--1">
          <p className="intro__eyebrow">
            <Mask>Desde {siteConfig.foundedYear}</Mask>
          </p>
          <p className="intro__headline">
            <Mask>De Alemania</Mask>
            <Mask>a Venezuela.</Mask>
          </p>
        </div>
        <div className="intro__title intro__title--2">
          <p className="intro__headline intro__headline--num">
            <Mask>
              <b className="intro__km">0</b>
              <small> km</small>
            </Mask>
          </p>
          <p className="intro__sub">
            <Mask>Ninguna distancia es suficiente.</Mask>
          </p>
        </div>
      </div>

      {/* 2–3) Sello en medio del mar */}
      <div className="intro__stage">
        <div className="intro__tilt">
          <div className="intro__camera">
            <div className="intro__glow" aria-hidden="true" />
            <svg className="intro__ring" viewBox="0 0 100 100" aria-hidden="true">
              <circle cx="50" cy="50" r={RING_R} vectorEffect="non-scaling-stroke" />
            </svg>
            <div className="intro__logo">
              <img src={LOGO_SRC} alt="TUCARGO Düsseldorf" width="512" height="512" decoding="async" />
              <div className="intro__shine" aria-hidden="true">
                <span />
              </div>
            </div>
            <div className="intro__reflection" aria-hidden="true">
              <img src={LOGO_SRC} alt="" />
            </div>
          </div>
        </div>
        <div className="intro__text" aria-hidden="true">
          <p className="intro__word">
            {[...'TUCARGO'].map((c, i) => (
              <span key={i}>{c}</span>
            ))}
          </p>
          <p className="intro__tagline">Tu carga, en buenas manos.</p>
        </div>
      </div>

      <div className="intro__grain" aria-hidden="true" />
      <div className="intro__vignette" aria-hidden="true" />
      {/* Barras de cine con HUD */}
      <div className="intro__bar intro__bar--top">
        <span className="intro__hud" aria-hidden="true">
          TUCARGO <i>—</i> {origin.label} → {CARACAS.label}
        </span>
        <span className="intro__hud intro__place" aria-hidden="true">
          {HUD_FROM}
        </span>
      </div>
      <div className="intro__bar intro__bar--bottom">
        <span className="intro__hud intro__timecode" aria-hidden="true">
          00:00:00:00
        </span>
        <span className="intro__hud intro__progress" aria-hidden="true">
          <span />
        </span>
        <button type="button" className="intro__skip">
          Saltar intro <kbd>Esc</kbd>
        </button>
      </div>
    </div>
  );
}
