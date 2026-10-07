/** Banderas en SVG (los emojis de bandera no se ven en Windows). */
export default function Flag({ code, size = 18, className = '' }) {
  const h = Math.round(size * 0.7);
  const common = { width: size, height: h, viewBox: '0 0 30 21', className: `flag ${className}`, role: 'img' };
  if (code === 'de') {
    return (
      <svg {...common} aria-label="Alemania">
        <rect width="30" height="7" fill="#111" />
        <rect y="7" width="30" height="7" fill="#DD0000" />
        <rect y="14" width="30" height="7" fill="#FFCE00" />
      </svg>
    );
  }
  return (
    <svg {...common} aria-label="Venezuela">
      <rect width="30" height="7" fill="#FFCC00" />
      <rect y="7" width="30" height="7" fill="#00247D" />
      <rect y="14" width="30" height="7" fill="#CF142B" />
      <g fill="#fff">
        {[...Array(8)].map((_, i) => {
          const a = Math.PI + (i * Math.PI) / 7;
          return <circle key={i} cx={15 + Math.cos(a) * 4.6} cy={12.6 + Math.sin(a) * 4.6} r="0.55" />;
        })}
      </g>
    </svg>
  );
}
