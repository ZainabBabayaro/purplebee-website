import { forwardRef, useId } from 'react'

// ============================================================================
// Accessible form primitives.
// Every input is associated with its label via htmlFor/id, describes its hint
// and error via aria-describedby, and marks invalid state with aria-invalid.
// ============================================================================

const baseField =
  'mt-2 w-full rounded-xl border bg-ivory px-4 py-3 text-ink placeholder:text-stone-light/70 transition-colors focus:outline-none'
const okBorder = 'border-line focus:border-plum-400'
const errBorder = 'border-red-400 focus:border-red-500'

function Label({ id, label, required }) {
  return (
    <label htmlFor={id} className="text-sm font-medium text-ink">
      {label}
      {required && <span className="ml-1 text-plum-500" aria-hidden="true">*</span>}
    </label>
  )
}

function ErrorText({ id, children }) {
  if (!children) return null
  return (
    <p id={id} role="alert" className="mt-1.5 text-xs text-red-600">
      {children}
    </p>
  )
}

function Hint({ id, children }) {
  if (!children) return null
  return <p id={id} className="mt-1.5 text-xs text-stone">{children}</p>
}

export const Input = forwardRef(function Input(
  { label, error, hint, required, className = '', id, ...props },
  ref,
) {
  const autoId = useId()
  const fieldId = id || autoId
  const hintId = hint ? `${fieldId}-hint` : undefined
  const errId = error ? `${fieldId}-err` : undefined
  return (
    <div className={className}>
      <Label id={fieldId} label={label} required={required} />
      <input
        ref={ref}
        id={fieldId}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={[hintId, errId].filter(Boolean).join(' ') || undefined}
        required={required}
        className={`${baseField} ${error ? errBorder : okBorder}`}
        {...props}
      />
      <Hint id={hintId}>{hint}</Hint>
      <ErrorText id={errId}>{error}</ErrorText>
    </div>
  )
})

export const Textarea = forwardRef(function Textarea(
  { label, error, hint, required, rows = 4, className = '', id, ...props },
  ref,
) {
  const autoId = useId()
  const fieldId = id || autoId
  const hintId = hint ? `${fieldId}-hint` : undefined
  const errId = error ? `${fieldId}-err` : undefined
  return (
    <div className={className}>
      <Label id={fieldId} label={label} required={required} />
      <textarea
        ref={ref}
        id={fieldId}
        rows={rows}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={[hintId, errId].filter(Boolean).join(' ') || undefined}
        required={required}
        className={`${baseField} ${error ? errBorder : okBorder} resize-y`}
        {...props}
      />
      <Hint id={hintId}>{hint}</Hint>
      <ErrorText id={errId}>{error}</ErrorText>
    </div>
  )
})

export const Select = forwardRef(function Select(
  { label, error, hint, required, options = [], placeholder, className = '', id, ...props },
  ref,
) {
  const autoId = useId()
  const fieldId = id || autoId
  const hintId = hint ? `${fieldId}-hint` : undefined
  const errId = error ? `${fieldId}-err` : undefined
  return (
    <div className={className}>
      <Label id={fieldId} label={label} required={required} />
      <select
        ref={ref}
        id={fieldId}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={[hintId, errId].filter(Boolean).join(' ') || undefined}
        required={required}
        className={`${baseField} ${error ? errBorder : okBorder} appearance-none`}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <Hint id={hintId}>{hint}</Hint>
      <ErrorText id={errId}>{error}</ErrorText>
    </div>
  )
})
