import './Logo.css';

/**
 * Logotipo provisional (wordmark + símbolo de ruta).
 * Para usar el logotipo oficial, coloca el archivo en /public/brand/ y
 * sustituye el <svg> por <img src="/brand/logo.svg" alt="Tucargo" />.
 */
export default function Logo({ compact = false, className = '' }) {
  return (
    <span className={`logo ${className}`}>
      <svg className="logo__mark" viewBox="0 0 40 40" aria-hidden="true">
        <rect width="40" height="40" rx="11" fill="var(--color-primary)" />
        <path d="M9 27c6-1 12-6.5 16.5-14" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" fill="none" />
        <path d="M20.5 12.2l6.2-.9-.9 6.2" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <circle cx="9" cy="27" r="3" fill="var(--color-accent)" />
      </svg>
      <span className="logo__text">
        <span className="logo__word">TUCARGO</span>
        {!compact && <span className="logo__sub">Düsseldorf</span>}
      </span>
    </span>
  );
}
