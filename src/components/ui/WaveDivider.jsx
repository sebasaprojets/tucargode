import './WaveDivider.css';

/** Onda repetible (dos periodos) para que el desplazamiento sea continuo. */
const wave = (y, amp, w = 2880, periods = 6) => {
  const step = w / periods;
  let d = `M0 0 H${w} V${y}`;
  for (let i = periods; i > 0; i--) {
    const x1 = step * i;
    const x0 = step * (i - 1);
    d += ` C${x1 - step * 0.25} ${y + amp}, ${x0 + step * 0.25} ${y - amp}, ${x0} ${y}`;
  }
  return `${d} Z`;
};

/**
 * Transición en forma de ola entre una sección y la siguiente.
 * `from` = color de la sección de arriba, `to` = color de la de abajo.
 * Dos capas: la ola principal y una ola azul mar de la marca por debajo,
 * que en ordenador derivan muy despacio (en móvil quedan quietas).
 */
export default function WaveDivider({ from, to }) {
  return (
    <div className="wave-divider" style={{ '--from': from, '--to': to }} aria-hidden="true">
      <svg className="wave-divider__layer wave-divider__layer--sea" viewBox="0 0 2880 100" preserveAspectRatio="none">
        <path d={wave(64, 18)} />
      </svg>
      <svg className="wave-divider__layer wave-divider__layer--main" viewBox="0 0 2880 100" preserveAspectRatio="none">
        <path d={wave(46, 24)} />
      </svg>
    </div>
  );
}
