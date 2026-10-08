/**
 * Sonido de la intro, sintetizado con Web Audio (sin archivos que descargar):
 * ambiente grave, «whoosh» y golpe grave. Desactivado por defecto: el
 * AudioContext solo se crea cuando el usuario pulsa el botón de sonido.
 */
export function createIntroSound() {
  let ac = null;
  let master = null;
  let drone = null;
  let noiseBuf = null;

  const noise = () => {
    if (noiseBuf) return noiseBuf;
    noiseBuf = ac.createBuffer(1, ac.sampleRate * 2, ac.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    return noiseBuf;
  };

  const startDrone = () => {
    if (!ac || drone) return;
    const g = ac.createGain();
    g.gain.value = 0;
    const lp = ac.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 180;
    const oscs = [55, 55.6, 82.4].map((f, i) => {
      const o = ac.createOscillator();
      o.type = i === 2 ? 'sine' : 'sawtooth';
      o.frequency.value = f;
      o.connect(lp);
      o.start();
      return o;
    });
    lp.connect(g).connect(master);
    g.gain.linearRampToValueAtTime(0.16, ac.currentTime + 1.5);
    drone = { g, oscs };
  };

  return {
    get enabled() {
      return Boolean(master) && master.gain.value > 0;
    },
    /** Activa o desactiva el sonido (llamar desde un gesto del usuario). */
    toggle(on) {
      if (on && !ac) {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return false;
        ac = new AC();
        master = ac.createGain();
        master.gain.value = 0.9;
        master.connect(ac.destination);
      }
      if (!ac) return false;
      if (on) {
        ac.resume();
        master.gain.cancelScheduledValues(ac.currentTime);
        master.gain.linearRampToValueAtTime(0.9, ac.currentTime + 0.3);
        startDrone();
      } else {
        master.gain.cancelScheduledValues(ac.currentTime);
        master.gain.linearRampToValueAtTime(0, ac.currentTime + 0.25);
      }
      return on;
    },
    whoosh(duration = 1.2) {
      if (!this.enabled) return;
      const t = ac.currentTime;
      const src = ac.createBufferSource();
      src.buffer = noise();
      const bp = ac.createBiquadFilter();
      bp.type = 'bandpass';
      bp.Q.value = 1.4;
      bp.frequency.setValueAtTime(260, t);
      bp.frequency.exponentialRampToValueAtTime(2600, t + duration * 0.7);
      bp.frequency.exponentialRampToValueAtTime(900, t + duration);
      const g = ac.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.5, t + duration * 0.6);
      g.gain.exponentialRampToValueAtTime(0.0001, t + duration);
      src.connect(bp).connect(g).connect(master);
      src.start(t);
      src.stop(t + duration + 0.05);
    },
    boom() {
      if (!this.enabled) return;
      const t = ac.currentTime;
      const o = ac.createOscillator();
      o.type = 'sine';
      o.frequency.setValueAtTime(130, t);
      o.frequency.exponentialRampToValueAtTime(34, t + 1.4);
      const g = ac.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.9, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 2.2);
      o.connect(g).connect(master);
      o.start(t);
      o.stop(t + 2.3);
      // golpe de ruido filtrado
      const src = ac.createBufferSource();
      src.buffer = noise();
      const lp = ac.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.setValueAtTime(1800, t);
      lp.frequency.exponentialRampToValueAtTime(120, t + 0.6);
      const ng = ac.createGain();
      ng.gain.setValueAtTime(0.35, t);
      ng.gain.exponentialRampToValueAtTime(0.0001, t + 0.7);
      src.connect(lp).connect(ng).connect(master);
      src.start(t);
      src.stop(t + 0.75);
    },
    /** Apaga todo suavemente y libera el audio. */
    dispose() {
      if (!ac) return;
      const t = ac.currentTime;
      master.gain.cancelScheduledValues(t);
      master.gain.setValueAtTime(master.gain.value, t);
      master.gain.linearRampToValueAtTime(0, t + 0.8);
      setTimeout(() => ac.close(), 900);
    },
  };
}
