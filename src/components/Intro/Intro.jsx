import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { Flip } from 'gsap/Flip';
import { Volume2, VolumeX } from 'lucide-react';
import { INTRO, CINEMATIC_EASE } from './introConfig';
import { createIntroEngine } from './introEngine';
import { createIntroSound } from './introSound';
import { siteConfig } from '../../config/siteConfig';
import { INTRO_DONE_EVENT, markIntroSeen } from '../../lib/intro';
import { setScrollLocked, scrollToTop } from '../../lib/scroll';
import { isDesktopMotion } from '../../hooks/useMotionPreference';
import './Intro.css';

gsap.registerPlugin(Flip);

const asset = (path) => `${import.meta.env.BASE_URL}${path}`;
const LOGO_SRC = asset(siteConfig.brand.logo.webp[512]);
const TAGLINE = `Alemania → Venezuela · desde ${siteConfig.foundedYear}`;
const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&*+<>';
const RING_R = 49; // radio del contorno en el viewBox 0..100
const RING_LEN = 2 * Math.PI * RING_R;
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

/** Textura de grano de película (se genera una vez). */
function grainTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 160;
  const g = c.getContext('2d');
  const img = g.createImageData(160, 160);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = Math.random() * 255;
    img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
    img.data[i + 3] = 255;
  }
  g.putImageData(img, 0, 0);
  return `url(${c.toDataURL('image/png')})`;
}

/** Texto que se revela letra a letra con efecto «scramble». */
function scrambleTo(el, text, duration) {
  const o = { p: 0 };
  return gsap.to(o, {
    p: 1,
    duration,
    ease: 'none',
    onStart: () => gsap.set(el, { opacity: 1 }),
    onUpdate: () => {
      const n = Math.floor(o.p * text.length);
      let out = text.slice(0, n);
      for (let i = n; i < Math.min(text.length, n + 7); i++) {
        out += text[i] === ' ' ? ' ' : GLYPHS[(Math.random() * GLYPHS.length) | 0];
      }
      el.textContent = out;
    },
    onComplete: () => {
      el.textContent = text;
    },
  });
}

/**
 * Intro cinematográfica (splash screen) con el logo oficial del header.
 * Secuencia: oscuridad → revelación → impacto → cámara → salida al header (FLIP).
 * El sitio se carga detrás en paralelo; al terminar, el logo vuela a su sitio
 * exacto en el header y el contenido entra en cascada.
 */
export default function Intro({ onDone }) {
  const rootRef = useRef(null);
  const [soundOn, setSoundOn] = useState(INTRO.sound);
  const soundRef = useRef(null);
  const mobile = typeof window !== 'undefined' && window.matchMedia('(max-width: 767px), (pointer: coarse)').matches;

  useEffect(() => {
    const root = rootRef.current;
    const $ = (s) => root.querySelector(s);
    const html = document.documentElement;
    const T = INTRO.timing;
    const prefersReduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const reduce = prefersReduce && (INTRO.respectReducedMotionOnDesktop || !isDesktopMotion());
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    // ---- Estado global mientras dura la intro ----
    window.__tucargoIntro = true;
    html.classList.add('intro-active');
    html.classList.remove('intro-pending');
    scrollToTop();
    setScrollLocked(true);
    const behind = [...root.parentElement.children].filter((el) => el !== root);
    behind.forEach((el) => el.setAttribute('inert', ''));
    root.style.setProperty('--grain', grainTexture());
    root.classList.toggle('has-cursor', finePointer && !reduce);
    root.classList.toggle('is-reduced', reduce);

    const el = {
      bg: $('.intro__bg'),
      canvas: $('.intro__canvas'),
      stage: $('.intro__stage'),
      camera: $('.intro__camera'),
      fly: $('.intro__fly'),
      tilt: $('.intro__tilt'),
      logo: $('.intro__logo'),
      badge: $('.intro__badge'),
      glow: $('.intro__glow'),
      ring: $('.intro__ring'),
      ringCircle: $('.intro__ring circle'),
      caR: $('.intro__ca--r'),
      caC: $('.intro__ca--c'),
      sweep: $('.intro__sweep span'),
      reflection: $('.intro__reflection'),
      shadow: $('.intro__shadow'),
      text: $('.intro__text'),
      word: $('.intro__word'),
      tagline: $('.intro__tagline'),
      flash: $('.intro__flash'),
      grain: $('.intro__grain'),
      vignette: $('.intro__vignette'),
      barTop: $('.intro__bar--top'),
      barBottom: $('.intro__bar--bottom'),
      ui: root.querySelectorAll('.intro__ui > *'),
      counter: $('.intro__counter'),
      hint: $('.intro__hint'),
      cursor: $('.intro__cursor'),
      warp: $('#intro-warp feDisplacementMap'),
    };

    const sound = createIntroSound();
    soundRef.current = sound;
    const engine = reduce ? null : createIntroEngine(el.canvas, { mobile });
    const t0 = performance.now();
    let exiting = false;
    let holding = false;
    let lastInteract = 0;
    let delayed = null;
    const cleanups = [];

    // Centro del logo para las explosiones
    const logoCenter = () => {
      const r = el.fly.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2, r: r.width / 2 };
    };
    const syncOrigin = () => {
      const c = logoCenter();
      engine?.setOrigin(c.x, c.y);
    };

    // ---- Estados iniciales ----
    gsap.set(el.logo, { opacity: 0, scale: 1.4, filter: 'blur(40px)' });
    gsap.set(el.ringCircle, { strokeDasharray: RING_LEN, strokeDashoffset: RING_LEN });
    gsap.set([el.glow, el.reflection, el.shadow, el.word, el.tagline, el.hint, el.caR, el.caC, el.flash], { opacity: 0 });
    gsap.set(el.sweep, { xPercent: -260, rotate: 24 });

    // ---- Preloader real (logo, fuentes y carga completa de la página) ----
    const logoReady = el.badge.decode ? el.badge.decode().catch(() => {}) : Promise.resolve();
    const pageLoaded =
      document.readyState === 'complete' ? Promise.resolve() : new Promise((r) => window.addEventListener('load', r, { once: true }));
    const tasks = [logoReady, document.fonts?.ready ?? Promise.resolve(), pageLoaded];
    const progress = { target: 0, shown: 0 };
    tasks.forEach((p) =>
      Promise.race([p, new Promise((r) => setTimeout(r, 8000))]).then(() => {
        progress.target += 100 / tasks.length;
      }),
    );
    const tickCounter = () => {
      progress.shown += (progress.target - progress.shown) * 0.09 + (progress.shown < progress.target ? 0.15 : 0);
      progress.shown = Math.min(progress.shown, progress.target);
      el.counter.textContent = `${String(Math.round(progress.shown)).padStart(3, '0')}%`;
      if (progress.shown >= 99.5) {
        el.counter.textContent = '100%';
        gsap.ticker.remove(tickCounter);
        gsap.to(el.counter, { opacity: 0, duration: 0.6, delay: 0.5 });
      }
    };
    gsap.ticker.add(tickCounter);
    cleanups.push(() => gsap.ticker.remove(tickCounter));

    // ---- Salida: el logo vuela a su sitio en el header (FLIP) y entra el sitio ----
    const finish = () => {
      html.classList.remove('intro-active');
      behind.forEach((n) => n.removeAttribute('inert'));
      setScrollLocked(false);
      window.__tucargoIntro = false;
      window.dispatchEvent(new Event(INTRO_DONE_EVENT));
      onDone?.();
    };

    const cascade = () => {
      const header = document.querySelector('.header');
      const items = ['.hero__eyebrow', '.hero__title-wrap', '.hero__lead', '.hero__ctas', '.hero__facts', '.hero__scroll']
        .map((s) => document.querySelector(s))
        .filter(Boolean);
      if (header) gsap.fromTo(header, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5, ease: 'power1.out', clearProps: 'opacity,visibility' });
      gsap.fromTo(
        items,
        { y: 48, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 1, stagger: 0.09, delay: 0.15, ease: 'power3.out', clearProps: 'transform,opacity,visibility' },
      );
      const scene = document.querySelector('.hero .hs');
      if (scene) gsap.fromTo(scene, { opacity: 0 }, { opacity: 1, duration: 1.4, ease: 'power1.out', clearProps: 'opacity' });
    };

    const exit = (fast = false) => {
      if (exiting) return;
      exiting = true;
      markIntroSeen();
      delayed?.kill();
      tl.pause();
      gsap.killTweensOf([el.camera, el.tilt, el.stage]);
      if (engine) gsap.to(engine.fx, { timeScale: 1, trails: 0, duration: 0.3 });
      sound.whoosh(0.9);

      if (reduce) {
        gsap.to(root, { opacity: 0, duration: 0.5, ease: 'power1.inOut', onComplete: finish });
        return;
      }
      const d = fast ? T.skipDuration : T.exitDuration;
      const target = document.querySelector('.header .logo__badge');
      const xt = gsap.timeline({ onComplete: finish });
      // 1) la cámara vuelve a su sitio y el logo queda nítido
      xt.to([el.camera, el.tilt, el.stage], { x: 0, y: 0, rotateX: 0, rotateY: 0, scale: 1, duration: d * 0.28, ease: 'power2.out' }, 0);
      xt.to(el.logo, { opacity: 1, scale: 1, filter: 'blur(0px)', duration: d * 0.28, ease: 'power2.out' }, 0);
      xt.to([el.glow, el.ring, el.reflection, el.shadow, el.text, el.hint, ...el.ui], { opacity: 0, duration: d * 0.3, ease: 'power1.out' }, 0);
      // 2) se abren las barras de letterbox
      xt.to(el.barTop, { yPercent: -100, duration: d * 0.6, ease: 'power3.inOut' }, d * 0.12);
      xt.to(el.barBottom, { yPercent: 100, duration: d * 0.6, ease: 'power3.inOut' }, d * 0.12);
      // 3) el logo encoge y vuela al header
      xt.add(() => {
        if (target && target.getBoundingClientRect().width > 0) {
          Flip.fit(el.fly, target, { scale: true, duration: d * 0.66, ease: 'power3.inOut' });
        } else {
          gsap.to(el.fly, { opacity: 0, scale: 0.6, duration: d * 0.5 });
        }
      }, d * 0.3);
      // 4) el fondo se disuelve y el sitio entra en cascada
      xt.to([el.bg, el.canvas, el.grain, el.vignette], { opacity: 0, duration: d * 0.6, ease: 'power2.inOut' }, d * 0.36);
      xt.add(cascade, d * 0.3);
      xt.to({}, { duration: 0 }, d);
    };

    // Salida automática salvo que el usuario esté jugando con la intro
    const maybeExit = () => {
      const idle = performance.now() - lastInteract > 1600;
      const waited = (performance.now() - t0) / 1000 > T.maxWait;
      if ((!holding && idle) || waited) exit(false);
      else delayed = gsap.delayedCall(0.5, maybeExit);
    };

    // ---- Línea de tiempo principal ----
    const tl = gsap.timeline({ paused: true });
    if (reduce) {
      gsap.set(el.logo, { scale: 1, filter: 'none' });
      gsap.set([el.ring, el.barTop, el.barBottom, el.grain], { opacity: 0 });
      tl.to(el.logo, { opacity: 1, duration: 0.6, ease: 'power1.out' }, 0.1);
      tl.to(el.word, { opacity: 1, duration: 0.6 }, 0.3);
      tl.add(() => (el.word.textContent = 'TUCARGO'), 0.3);
      tl.call(() => exit(true), null, 2);
    } else {
      // 1) Oscuridad: el haz de luz ilumina el polvo
      tl.to(engine.fx, { beam: 1, duration: 1.8, ease: 'sine.inOut' }, T.beamIn);
      // 2) Revelación en cámara lenta
      tl.call(() => sound.whoosh(1.5), null, Math.max(0, T.reveal - 0.2));
      tl.to(el.ringCircle, { strokeDashoffset: 0, duration: 1.1, ease: CINEMATIC_EASE }, T.ringDraw);
      tl.to(el.logo, { opacity: 1, scale: 1, filter: 'blur(0px)', duration: T.revealDuration, ease: CINEMATIC_EASE }, T.reveal);
      tl.set(el.logo, { filter: 'none' }, T.reveal + T.revealDuration);
      tl.to(el.glow, { opacity: 1, duration: 1.2, ease: 'power1.out' }, T.reveal + 0.3);
      tl.to(el.ring, { opacity: 0.35, duration: 0.8 }, T.reveal + T.revealDuration - 0.2);
      tl.add(scrambleTo(el.word, 'TUCARGO', 0.9), T.wordmark);
      tl.add(scrambleTo(el.tagline, TAGLINE, 1.2), T.tagline);
      // 3) Impacto: destello especular, aberración cromática, sacudida y explosión
      tl.call(
        () => {
          syncOrigin();
          engine.burst(mobile ? INTRO.particles.burst.mobile : INTRO.particles.burst.desktop, { power: 1 });
          sound.boom();
          el.glow.classList.add('is-breathing');
        },
        null,
        T.impact,
      );
      tl.to(el.sweep, { xPercent: 260, duration: 0.85, ease: 'power2.inOut' }, T.impact - 0.05);
      tl.fromTo(el.flash, { opacity: 0 }, { opacity: 0.55, duration: 0.07, yoyo: true, repeat: 1, ease: 'power1.out' }, T.impact);
      const A = INTRO.aberration;
      tl.fromTo(el.caR, { opacity: 0, x: 0 }, { opacity: 0.9, x: -A, duration: 0.06 }, T.impact);
      tl.fromTo(el.caC, { opacity: 0, x: 0 }, { opacity: 0.9, x: A, duration: 0.06 }, T.impact);
      tl.to([el.caR, el.caC], { opacity: 0, x: 0, duration: 0.32, ease: 'power2.out' }, T.impact + 0.14);
      const S = INTRO.shake;
      tl.to(
        el.camera,
        {
          keyframes: [
            { x: S, y: -S * 0.6 },
            { x: -S * 0.8, y: S * 0.5 },
            { x: S * 0.5, y: S * 0.3 },
            { x: -S * 0.25, y: -S * 0.2 },
            { x: 0, y: 0 },
          ],
          duration: 0.45,
          ease: 'none',
        },
        T.impact,
      );
      tl.fromTo(el.logo, { scale: 1.07 }, { scale: 1, duration: 0.9, ease: 'elastic.out(1, 0.45)' }, T.impact);
      tl.fromTo(el.hint, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' }, T.hint);
      // 4) Cámara: dolly in + giro en Y, con reflejo en el «suelo»
      tl.to([el.reflection, el.shadow], { opacity: 1, duration: 1, ease: 'power1.out' }, T.camera - 0.3);
      tl.to(
        el.camera,
        { rotateY: INTRO.cameraTurn, rotateX: 3, scale: INTRO.cameraZoom, duration: T.cameraDuration, ease: 'sine.inOut' },
        T.camera,
      );
      // 5) Salida
      tl.call(maybeExit, null, T.exit);
    }

    // Arranca cuando el logo está listo (máximo 1,2 s de espera)
    Promise.race([logoReady, new Promise((r) => setTimeout(r, 1200))]).then(() => {
      if (!exiting) tl.play();
    });

    // ---- Interacción ----
    const tiltX = gsap.quickTo(el.tilt, 'rotateX', { duration: 0.8, ease: 'power3.out' });
    const tiltY = gsap.quickTo(el.tilt, 'rotateY', { duration: 0.8, ease: 'power3.out' });
    const pullX = gsap.quickTo(el.tilt, 'x', { duration: 0.8, ease: 'power3.out' });
    const pullY = gsap.quickTo(el.tilt, 'y', { duration: 0.8, ease: 'power3.out' });
    const curX = gsap.quickTo(el.cursor, 'x', { duration: 0.35, ease: 'power3.out' });
    const curY = gsap.quickTo(el.cursor, 'y', { duration: 0.35, ease: 'power3.out' });

    const aim = (nx, ny) => {
      tiltY(clamp(nx, -1, 1) * INTRO.tiltMax);
      tiltX(clamp(-ny, -1, 1) * INTRO.tiltMax);
      engine?.setParallax(nx, ny);
    };

    const onMove = (e) => {
      if (exiting || reduce) return;
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = (e.clientY / window.innerHeight) * 2 - 1;
      aim(nx, ny);
      engine?.setPointer(e.clientX, e.clientY);
      if (!finePointer) return;
      // cursor con efecto magnético cerca del logo
      const c = logoCenter();
      const dx = e.clientX - c.x;
      const dy = e.clientY - c.y;
      const dist = Math.hypot(dx, dy);
      const magnet = dist < c.r * 1.6;
      el.cursor.classList.toggle('is-magnet', magnet);
      const k = magnet ? 0.45 * (1 - dist / (c.r * 1.6)) : 0;
      curX(e.clientX - dx * k);
      curY(e.clientY - dy * k);
      pullX(magnet ? dx * 0.06 : 0);
      pullY(magnet ? dy * 0.06 : 0);
      el.cursor.style.opacity = '1';
    };
    const onLeave = () => {
      engine?.clearPointer();
      el.cursor.style.opacity = '0';
      pullX(0);
      pullY(0);
    };

    // Giroscopio (móvil): el parallax sigue la inclinación del teléfono
    const onOrient = (e) => {
      if (exiting || e.gamma == null) return;
      aim(e.gamma / 30, (e.beta - 45) / 30);
    };
    let gyroAsked = false;
    const askGyro = () => {
      if (gyroAsked || reduce) return;
      gyroAsked = true;
      const D = window.DeviceOrientationEvent;
      if (D && typeof D.requestPermission === 'function') {
        D.requestPermission()
          .then((s) => s === 'granted' && window.addEventListener('deviceorientation', onOrient))
          .catch(() => {});
      }
    };
    if (window.DeviceOrientationEvent && typeof window.DeviceOrientationEvent.requestPermission !== 'function') {
      window.addEventListener('deviceorientation', onOrient);
    }

    // Bullet time: todo se ralentiza con zoom y estelas de movimiento
    const setBullet = (on) => {
      holding = on;
      root.classList.toggle('is-bullet', on);
      gsap.to(tl, { timeScale: on ? INTRO.bulletTime : 1, duration: 0.45, ease: 'power2.out', overwrite: true });
      if (engine) gsap.to(engine.fx, { timeScale: on ? INTRO.bulletTime : 1, trails: on ? 1 : 0, duration: 0.45, overwrite: 'auto' });
      gsap.to(el.stage, { scale: on ? 1.12 : 1, duration: on ? 0.9 : 0.6, ease: 'power3.out', overwrite: true });
    };

    // Onda de choque al pulsar el logo
    const shockwave = () => {
      syncOrigin();
      for (let i = 0; i < 2; i++) {
        const ring = document.createElement('span');
        ring.className = 'intro__ripple';
        el.tilt.appendChild(ring);
        gsap.fromTo(
          ring,
          { scale: 0.7, opacity: 0.95 },
          { scale: 4.4, opacity: 0, duration: 1.5, delay: i * 0.14, ease: 'power2.out', onComplete: () => ring.remove() },
        );
      }
      el.logo.style.filter = 'url(#intro-warp)';
      gsap.fromTo(
        el.warp,
        { attr: { scale: 48 } },
        { attr: { scale: 0 }, duration: 0.9, ease: 'power2.out', onComplete: () => (el.logo.style.filter = '') },
      );
      gsap.fromTo(el.logo, { scale: 0.92 }, { scale: 1, duration: 1, ease: 'elastic.out(1, 0.4)' });
      gsap.fromTo(el.flash, { opacity: 0 }, { opacity: 0.25, duration: 0.08, yoyo: true, repeat: 1 });
      engine?.burst(mobile ? INTRO.particles.clickBurst.mobile : INTRO.particles.clickBurst.desktop, { power: 0.75 });
      sound.boom();
    };

    let holdTimer = 0;
    let downOnLogo = false;
    const isUi = (e) => e.target.closest('button');
    const onDown = (e) => {
      if (exiting || isUi(e)) return;
      askGyro();
      const c = logoCenter();
      downOnLogo = Math.hypot(e.clientX - c.x, e.clientY - c.y) < c.r * 1.15;
      clearTimeout(holdTimer);
      if (!reduce) holdTimer = setTimeout(() => setBullet(true), INTRO.holdDelay * 1000);
    };
    const onUp = (e) => {
      if (exiting || isUi(e)) return;
      clearTimeout(holdTimer);
      lastInteract = performance.now();
      if (holding) {
        setBullet(false);
        return;
      }
      const revealed = tl.time() >= T.reveal + T.revealDuration * 0.6;
      if (downOnLogo && revealed) shockwave();
      else if (tl.time() >= T.hint || reduce) exit(false);
      else engine?.burst(70, { x: e.clientX, y: e.clientY, power: 0.45, radius: 6 });
    };
    const onCancel = () => {
      clearTimeout(holdTimer);
      if (holding) setBullet(false);
    };
    const onKey = (e) => {
      if (e.key === 'Escape') exit(true);
    };

    root.addEventListener('pointermove', onMove);
    root.addEventListener('pointerleave', onLeave);
    root.addEventListener('pointerdown', onDown);
    root.addEventListener('pointerup', onUp);
    root.addEventListener('pointercancel', onCancel);
    window.addEventListener('keydown', onKey);
    window.addEventListener('resize', syncOrigin);

    // Botones
    const onSkip = () => exit(true);
    const onEnter = () => exit(false);
    $('.intro__skip').addEventListener('click', onSkip);
    el.hint.addEventListener('click', onEnter);
    // El resto de la página queda «inert»: con Tab el foco va directo a los controles de la intro

    cleanups.push(() => {
      root.removeEventListener('pointermove', onMove);
      root.removeEventListener('pointerleave', onLeave);
      root.removeEventListener('pointerdown', onDown);
      root.removeEventListener('pointerup', onUp);
      root.removeEventListener('pointercancel', onCancel);
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', syncOrigin);
      window.removeEventListener('deviceorientation', onOrient);
      clearTimeout(holdTimer);
    });

    return () => {
      cleanups.forEach((fn) => fn());
      tl.kill();
      delayed?.kill();
      engine?.destroy();
      sound.dispose();
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

  const toggleSound = () => {
    const next = !soundOn;
    soundRef.current?.toggle(next);
    setSoundOn(next);
  };

  return (
    <div ref={rootRef} className="intro" role="dialog" aria-modal="true" aria-label="Introducción de TUCARGO" style={{ '--intro-logo': `${mobile ? INTRO.logoSize.mobile : INTRO.logoSize.desktop}px` }}>
      <div className="intro__bg" />
      <canvas className="intro__canvas" aria-hidden="true" />

      <div className="intro__stage">
        <div className="intro__camera">
          <div className="intro__fly">
            <div className="intro__tilt">
              <div className="intro__logo">
                <div className="intro__glow" aria-hidden="true" />
                <svg className="intro__ring" viewBox="0 0 100 100" aria-hidden="true">
                  <circle cx="50" cy="50" r={RING_R} />
                </svg>
                <img className="intro__badge" src={LOGO_SRC} alt="TUCARGO Düsseldorf" width="512" height="512" decoding="async" />
                <img className="intro__ca intro__ca--r" src={LOGO_SRC} alt="" aria-hidden="true" />
                <img className="intro__ca intro__ca--c" src={LOGO_SRC} alt="" aria-hidden="true" />
                <div className="intro__sweep" aria-hidden="true">
                  <span />
                </div>
              </div>
              <div className="intro__reflection" aria-hidden="true">
                <img src={LOGO_SRC} alt="" />
              </div>
              <div className="intro__shadow" aria-hidden="true" />
            </div>
          </div>
        </div>
        <div className="intro__text" aria-hidden="true">
          <p className="intro__word">TUCARGO</p>
          <p className="intro__tagline">{TAGLINE}</p>
        </div>
      </div>

      <div className="intro__grain" aria-hidden="true" />
      <div className="intro__vignette" aria-hidden="true" />
      <div className="intro__flash" aria-hidden="true" />
      <div className="intro__bar intro__bar--top" aria-hidden="true" />
      <div className="intro__bar intro__bar--bottom" aria-hidden="true" />

      <div className="intro__ui">
        <span className="intro__counter" aria-hidden="true">
          000%
        </span>
        <div className="intro__controls">
          <button type="button" className="intro__btn intro__btn--icon" onClick={toggleSound} aria-pressed={soundOn} aria-label={soundOn ? 'Silenciar sonido' : 'Activar sonido'}>
            {soundOn ? <Volume2 size={16} aria-hidden="true" /> : <VolumeX size={16} aria-hidden="true" />}
          </button>
          <button type="button" className="intro__btn intro__skip">
            Saltar intro <kbd>Esc</kbd>
          </button>
        </div>
        <button type="button" className="intro__hint">
          {mobile ? 'Toca para entrar' : 'Haz clic para entrar'}
        </button>
      </div>

      <div className="intro__cursor" aria-hidden="true">
        <span />
      </div>

      {/* Filtros: separación RGB (aberración cromática) y distorsión de la onda de choque */}
      <svg className="intro__defs" width="0" height="0" aria-hidden="true" focusable="false">
        <filter id="intro-ca-r" colorInterpolationFilters="sRGB">
          <feColorMatrix type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" />
        </filter>
        <filter id="intro-ca-c" colorInterpolationFilters="sRGB">
          <feColorMatrix type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0" />
        </filter>
        <filter id="intro-warp" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.018" numOctaves="2" seed="3" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="0" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>
    </div>
  );
}
