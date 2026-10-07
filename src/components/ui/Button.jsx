import { forwardRef } from 'react';
import { LoaderCircle } from 'lucide-react';
import './Button.css';

/**
 * Botón del design system.
 * variant: primary | secondary | ghost | whatsapp | accent
 * size: sm | md | lg
 * Renderiza <a> si recibe `href`.
 */
const Button = forwardRef(function Button(
  {
    variant = 'primary',
    size = 'md',
    href,
    loading = false,
    disabled = false,
    iconLeft,
    iconRight,
    block = false,
    className = '',
    children,
    ...rest
  },
  ref,
) {
  const cls = [
    'btn',
    `btn--${variant}`,
    `btn--${size}`,
    block && 'btn--block',
    loading && 'is-loading',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const content = (
    <>
      {loading && <LoaderCircle className="btn__spinner" size={18} aria-hidden="true" />}
      {!loading && iconLeft}
      <span className="btn__label">{children}</span>
      {!loading && iconRight && <span className="btn__icon-right">{iconRight}</span>}
    </>
  );

  if (href) {
    const external = /^https?:/.test(href);
    return (
      <a
        ref={ref}
        href={href}
        className={cls}
        {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        {...rest}
      >
        {content}
      </a>
    );
  }

  return (
    <button
      ref={ref}
      type="button"
      className={cls}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {content}
    </button>
  );
});

export default Button;
