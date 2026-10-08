import { useRef } from 'react';
import { animate, m, useMotionValue, useTransform } from 'framer-motion';
import { useReduceMotion } from '../../hooks/useMotionPreference';
import './ElasticSlider.css';

const MAX_STRETCH = 26; // px máximos que se estira la barra al tirar más allá del extremo

/** Resistencia elástica: cuanto más se tira, menos se estira (como una goma). */
const decay = (overflow) => MAX_STRETCH * (2 / (1 + Math.exp(-overflow / 60)) - 1);

/**
 * Control deslizante con efecto elástico (patrón «Elastic Slider» de React Bits).
 * - Arrastrar más allá de un extremo estira la barra; al soltar vuelve con un muelle.
 * - Accesible: role="slider", flechas, Re Pág/Av Pág, Inicio/Fin.
 * - `marks`: referencias sobre la barra (p. ej. límites de peso).
 */
export default function ElasticSlider({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  label,
  valueText,
  marks = [],
  startIcon,
  endIcon,
}) {
  const trackRef = useRef(null);
  const reduce = useReduceMotion();
  const stretch = useMotionValue(0); // >0 tira a la derecha, <0 a la izquierda
  const scaleX = useTransform(stretch, (s) => 1 + Math.abs(s) / (trackRef.current?.offsetWidth || 300));
  const originX = useTransform(stretch, (s) => (s < 0 ? 1 : 0));
  const startScale = useTransform(stretch, (s) => (s < 0 ? 1 + Math.abs(s) / 60 : 1));
  const endScale = useTransform(stretch, (s) => (s > 0 ? 1 + s / 60 : 1));

  const num = Number(value);
  const current = Number.isFinite(num) && value !== '' ? Math.min(max, Math.max(min, num)) : min;
  const pct = ((current - min) / (max - min)) * 100;

  const snap = (v) => {
    const s = Math.round((v - min) / step) * step + min;
    return Math.min(max, Math.max(min, Number(s.toFixed(4))));
  };

  const fromPointer = (clientX) => {
    const r = trackRef.current.getBoundingClientRect();
    const x = clientX - r.left;
    if (x < 0) stretch.set(reduce ? 0 : -decay(-x));
    else if (x > r.width) stretch.set(reduce ? 0 : decay(x - r.width));
    else stretch.set(0);
    onChange(snap(min + (Math.min(r.width, Math.max(0, x)) / r.width) * (max - min)));
  };

  const release = () => {
    if (reduce) stretch.set(0);
    else animate(stretch, 0, { type: 'spring', stiffness: 420, damping: 18 });
  };

  const onPointerDown = (e) => {
    if (e.button !== 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    fromPointer(e.clientX);
  };
  const onPointerMove = (e) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) fromPointer(e.clientX);
  };

  const onKeyDown = (e) => {
    const big = step * 10;
    const map = {
      ArrowRight: current + step,
      ArrowUp: current + step,
      ArrowLeft: current - step,
      ArrowDown: current - step,
      PageUp: current + big,
      PageDown: current - big,
      Home: min,
      End: max,
    };
    if (!(e.key in map)) return;
    e.preventDefault();
    onChange(snap(map[e.key]));
  };

  return (
    <div className="eslider">
      {startIcon && (
        <m.span className="eslider__icon" style={{ scale: startScale }} aria-hidden="true">
          {startIcon}
        </m.span>
      )}
      <div
        className="eslider__hit"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={release}
        onPointerCancel={release}
      >
        <m.div ref={trackRef} className="eslider__track" style={{ scaleX, originX }}>
          <div className="eslider__fill" style={{ width: `${pct}%` }} />
          {marks.map((mk) => (
            <span
              key={mk.value}
              className={`eslider__mark ${current >= mk.value ? 'is-passed' : ''}`}
              style={{ left: `${((mk.value - min) / (max - min)) * 100}%` }}
              aria-hidden="true"
            >
              <span className="eslider__mark-label">{mk.label}</span>
            </span>
          ))}
        </m.div>
        <m.div
          className="eslider__thumb"
          style={{ left: `${pct}%` }}
          role="slider"
          tabIndex={0}
          aria-label={label}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={current}
          aria-valuetext={valueText}
          onKeyDown={onKeyDown}
        />
      </div>
      {endIcon && (
        <m.span className="eslider__icon" style={{ scale: endScale }} aria-hidden="true">
          {endIcon}
        </m.span>
      )}
    </div>
  );
}
