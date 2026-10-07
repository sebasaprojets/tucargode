import { useId } from 'react';
import { CircleAlert, CircleCheck, ChevronDown } from 'lucide-react';
import './Field.css';

/**
 * Campo de formulario con estados: default, focus, error, success, disabled.
 * kind: input | select | textarea
 */
export default function Field({
  label,
  kind = 'input',
  error,
  success,
  hint,
  suffix,
  required,
  options = [],
  className = '',
  ...props
}) {
  const uid = useId();
  const id = props.id ?? uid;
  const describedBy = [error && `${id}-error`, hint && `${id}-hint`].filter(Boolean).join(' ') || undefined;
  const state = error ? 'is-error' : success ? 'is-success' : '';

  const common = {
    id,
    'aria-invalid': error ? true : undefined,
    'aria-describedby': describedBy,
    required,
    ...props,
  };

  return (
    <div className={`field ${state} ${props.disabled ? 'is-disabled' : ''} ${className}`}>
      <label htmlFor={id} className="field__label">
        {label}
        {required && <span className="field__req" aria-hidden="true"> *</span>}
      </label>
      <div className="field__control">
        {kind === 'select' ? (
          <>
            <select className="field__input field__select" {...common}>
              {options.map((o) => (
                <option key={o.value} value={o.value} disabled={o.disabled}>
                  {o.label}
                </option>
              ))}
            </select>
            <ChevronDown className="field__chevron" size={18} aria-hidden="true" />
          </>
        ) : kind === 'textarea' ? (
          <textarea className="field__input field__textarea" rows={4} {...common} />
        ) : (
          <input className="field__input" {...common} />
        )}
        {suffix && <span className="field__suffix">{suffix}</span>}
        {error && <CircleAlert className="field__status" size={18} aria-hidden="true" />}
        {!error && success && <CircleCheck className="field__status field__status--ok" size={18} aria-hidden="true" />}
      </div>
      {hint && !error && (
        <p id={`${id}-hint`} className="field__hint">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="field__error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
