import { siteConfig } from '../../config/siteConfig';
import './Logo.css';

/**
 * Logotipo de Tucargo.
 * Si hay un logo oficial configurado en siteConfig.brand.logo, se usa ese archivo;
 * si no, se muestra el logotipo provisional (wordmark + símbolo de ruta).
 * tone: 'dark' (sobre fondo oscuro) | 'light' (sobre fondo claro)
 */
export default function Logo({ compact = false, tone = 'dark', className = '' }) {
  const { logo } = siteConfig.brand;
  const src = tone === 'light' ? logo.onLight || logo.onDark : logo.onDark || logo.onLight;

  if (src) {
    return (
      <span className={`logo logo--official ${className}`}>
        <img
          src={`${import.meta.env.BASE_URL}${src}`}
          alt={siteConfig.legalName}
          height={logo.height}
          style={{ height: logo.height, width: 'auto' }}
          decoding="async"
        />
      </span>
    );
  }

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
