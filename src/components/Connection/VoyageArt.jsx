/**
 * Ilustraciones de la travesía, en el estilo plano del logotipo de Tucargo
 * (barco con casco rojo y cajas de carga, mar en azules del logo).
 * Coordenadas en un lienzo de 1600 × 900; horizonte en y = 600.
 */

export const HORIZON = 600;

/** Barco de carga del logo. Origen: línea de flotación, centro del barco. */
export function Ship() {
  const crate = (x, y, dark) => (
    <g key={`${x}-${y}`} transform={`translate(${x} ${y})`}>
      <rect width="34" height="32" fill={dark ? '#7A664D' : '#A6875F'} stroke="#5E4D39" strokeWidth="2" />
      <path d="M4 4 L30 28 M30 4 L4 28" stroke="#3F3326" strokeWidth="1.6" />
      <rect x="4" y="4" width="26" height="24" fill="none" stroke="#3F3326" strokeWidth="1.4" />
    </g>
  );
  return (
    <g>
      {/* Mástiles y chimenea */}
      <path d="M54 -66 V-118 M82 -66 V-112" stroke="#4F4F4F" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M70 -66 L74 -88 H88 L92 -66 Z" fill="#4F4F4F" />
      {/* Puente superior */}
      <rect x="32" y="-68" width="70" height="22" rx="3" fill="#F4F4F4" />
      {[40, 54, 68, 82].map((x) => (
        <rect key={x} x={x} y="-63" width="9" height="9" fill="#5D6170" />
      ))}
      <rect x="-6" y="-50" width="140" height="6" rx="3" fill="#4F4F4F" />
      {/* Cabina */}
      <rect x="2" y="-44" width="126" height="38" fill="#FFFFFF" />
      {[10, 24, 38, 52, 66, 80, 94, 108].map((x) => (
        <rect key={x} x={x} y="-36" width="10" height="10" fill="#5D6170" />
      ))}
      {/* Cajas de carga */}
      {crate(-118, -38, false)}
      {crate(-84, -38, true)}
      {crate(-50, -38, false)}
      {crate(-101, -70, true)}
      {crate(-67, -70, false)}
      {crate(-33, -70, true)}
      {crate(-84, -102, false)}
      {crate(-50, -102, true)}
      {/* Casco */}
      <path d="M-182 -30 Q-160 -22 -142 -6 L150 -6 L176 -32 L136 30 L-128 30 Q-158 6 -182 -30 Z" fill="#CC4D47" />
      <path d="M-140 -2 H40 Q52 10 40 24 H-118 Q-136 12 -140 -2 Z" fill="#D1756F" opacity="0.75" />
      <path d="M-112 11 H20" stroke="#FFFFFF" strokeWidth="6" strokeLinecap="round" strokeDasharray="14 10" />
      {[74, 96, 118].map((x) => (
        <circle key={x} cx={x} cy="8" r="5" fill="#FFFFFF" />
      ))}
    </g>
  );
}

/** Estela del barco (hacia la izquierda). */
export function Wake() {
  return (
    <g fill="none" stroke="#FFFFFF" strokeLinecap="round" opacity="0.75">
      <path d="M-140 32 Q-220 40 -330 34" strokeWidth="4" />
      <path d="M-120 40 Q-240 52 -400 46" strokeWidth="3" opacity="0.6" />
      <path d="M-100 46 Q-200 60 -300 58" strokeWidth="2" opacity="0.45" />
    </g>
  );
}

/** Silueta de Düsseldorf: Rheinturm, edificios de Gehry (Medienhafen) y puente atirantado. */
export function DusseldorfSkyline({ color = '#0A3E68' }) {
  return (
    <g fill={color}>
      {/* Bloques urbanos */}
      <rect x="120" y="520" width="60" height="80" />
      <rect x="185" y="490" width="44" height="110" />
      <rect x="234" y="535" width="70" height="65" />
      <rect x="308" y="505" width="38" height="95" />
      {/* Neuer Zollhof (Gehry): volúmenes ondulados */}
      <path d="M360 600 V500 Q372 470 392 488 Q408 500 412 470 V600 Z" />
      <path d="M418 600 V478 Q440 452 456 474 Q470 490 482 462 V600 Z" />
      <path d="M488 600 V506 Q504 486 520 500 Q532 510 540 494 V600 Z" />
      {/* Rheinturm (240 m): fuste, cabina y antena */}
      <path d="M612 600 L618 330 H630 L636 600 Z" />
      <ellipse cx="624" cy="318" rx="26" ry="14" />
      <rect x="606" y="300" width="36" height="10" rx="5" />
      <path d="M622 300 L624 214 L626 300 Z" />
      {/* Rheinkniebrücke: pilón y tirantes */}
      <rect x="770" y="440" width="10" height="160" />
      <g stroke={color} strokeWidth="2" opacity="0.8">
        {[0, 1, 2, 3, 4].map((i) => (
          <path key={`l${i}`} d={`M775 ${450 + i * 12} L${690 - i * 22} 592`} />
        ))}
        {[0, 1, 2, 3, 4].map((i) => (
          <path key={`r${i}`} d={`M775 ${450 + i * 12} L${860 + i * 22} 592`} />
        ))}
      </g>
      <rect x="640" y="588" width="320" height="8" />
    </g>
  );
}

/** Costa venezolana: El Ávila, grúas de Puerto Cabello, contenedores y palmeras. */
export function VenezuelaCoast({ mountain = '#0F5384', near = '#04213A' }) {
  const palm = (x, h, lean) => (
    <g key={x} stroke={near} fill="none" strokeLinecap="round">
      <path d={`M${x} 600 Q${x + lean * 0.4} ${600 - h * 0.6} ${x + lean} ${600 - h}`} strokeWidth="7" />
      <g fill={near} stroke="none" transform={`translate(${x + lean} ${600 - h})`}>
        <path d="M0 0 Q-34 -14 -62 8 Q-30 -4 0 4 Z" />
        <path d="M0 0 Q30 -20 64 -2 Q32 -8 0 4 Z" />
        <path d="M0 0 Q-18 -34 -46 -40 Q-16 -24 2 2 Z" />
        <path d="M0 0 Q20 -36 50 -36 Q20 -22 -2 2 Z" />
        <path d="M0 0 Q-40 6 -54 34 Q-30 10 2 4 Z" />
      </g>
    </g>
  );
  return (
    <g>
      {/* El Ávila (Waraira Repano) */}
      <path
        d="M560 600 C640 520 720 470 800 430 C860 400 900 360 960 345 C1010 333 1040 352 1090 340 C1150 326 1200 360 1260 392 C1340 432 1420 470 1520 520 L1640 600 Z"
        fill={mountain}
        opacity="0.55"
      />
      <path
        d="M700 600 C780 540 860 500 940 476 C1010 455 1080 470 1160 452 C1240 436 1320 470 1400 510 L1560 600 Z"
        fill={mountain}
        opacity="0.8"
      />
      {/* Grúas portuarias */}
      <g fill={near}>
        {[880, 990].map((x) => (
          <g key={x}>
            <rect x={x} y="470" width="10" height="130" />
            <rect x={x + 52} y="470" width="10" height="130" />
            <rect x={x - 40} y="462" width="150" height="12" />
            <rect x={x + 18} y="474" width="24" height="18" />
            <path d={`M${x + 30} 492 V530`} stroke={near} strokeWidth="2" />
          </g>
        ))}
        {/* Contenedores */}
        <rect x="860" y="574" width="44" height="26" fill="#CC4D47" />
        <rect x="906" y="574" width="44" height="26" fill="#019DD8" />
        <rect x="952" y="574" width="44" height="26" fill="#A6875F" />
        <rect x="883" y="548" width="44" height="26" fill="#7A664D" />
        <rect x="929" y="548" width="44" height="26" fill="#CC4D47" />
      </g>
      {palm(1180, 150, 18)}
      {palm(1250, 120, -14)}
      {palm(1330, 170, 22)}
    </g>
  );
}

/** Nube plana. */
export function Cloud({ x, y, s = 1, o = 0.9 }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} fill="#FFFFFF" opacity={o}>
      <ellipse cx="0" cy="0" rx="70" ry="26" />
      <circle cx="-30" cy="-12" r="26" />
      <circle cx="12" cy="-22" r="34" />
      <circle cx="46" cy="-6" r="22" />
    </g>
  );
}

/** Banda de olas (dos periodos de ancho para el bucle infinito). */
export function WaveBand({ y, amp, len, color, className }) {
  let d = `M0 ${y}`;
  for (let x = 0; x < 3200; x += len) {
    d += ` q ${len / 4} ${-amp} ${len / 2} 0 t ${len / 2} 0`;
  }
  d += ` V900 H0 Z`;
  return <path className={className} d={d} fill={color} />;
}

/** Gaviotas. */
export function Birds({ x, y, color = '#04213A' }) {
  return (
    <g transform={`translate(${x} ${y})`} fill="none" stroke={color} strokeWidth="2.4" strokeLinecap="round" opacity="0.7">
      <path d="M0 0 q8 -8 16 0 q8 -8 16 0" />
      <path d="M40 -22 q6 -6 12 0 q6 -6 12 0" />
      <path d="M-30 -30 q5 -5 10 0 q5 -5 10 0" />
    </g>
  );
}

export const PLANE_PATH =
  'M-8 -1.1 L4 -1.1 Q9 -1 9.5 0 Q9 1 4 1.1 L-8 1.1 Z M1 -1 L-3.5 -8.5 L-1.2 -8.5 L5 -1 Z M1 1 L-3.5 8.5 L-1.2 8.5 L5 1 Z M-6 -1 L-8.5 -4.5 L-7 -4.5 L-3.5 -1 Z M-6 1 L-8.5 4.5 L-7 4.5 L-3.5 1 Z';
