import { siteConfig } from '../../config/siteConfig';
import './Logo.css';

const asset = (path) => `${import.meta.env.BASE_URL}${path}`;

/**
 * Logotipo oficial de Tucargo: insignia circular + wordmark.
 * size: alto de la insignia en px. compact: oculta «Düsseldorf».
 */
export default function Logo({ size = 48, compact = false, wordmark, className = '' }) {
  const { logo } = siteConfig.brand;
  const showText = wordmark ?? logo.showWordmark;
  const srcSet = `${asset(logo.webp[128])} 128w, ${asset(logo.webp[256])} 256w, ${asset(logo.webp[512])} 512w`;

  return (
    <span className={`logo ${className}`} style={{ '--logo-size': `${size}px` }}>
      <picture>
        <source type="image/webp" srcSet={srcSet} sizes={`${size}px`} />
        <img
          className="logo__badge"
          src={asset(logo.png)}
          alt={showText ? '' : siteConfig.legalName}
          width={size}
          height={size}
          decoding="async"
        />
      </picture>
      {showText && (
        <span className="logo__text">
          {/* Cada letra flota como sobre una ola (onda que recorre la palabra) */}
          <span className="logo__word" aria-label="TUCARGO">
            {[...'TUCARGO'].map((c, i) => (
              <span key={i} className="logo__wave" style={{ '--i': i }} aria-hidden="true">
                {c}
              </span>
            ))}
          </span>
          {!compact && <span className="logo__sub">Düsseldorf</span>}
        </span>
      )}
    </span>
  );
}
