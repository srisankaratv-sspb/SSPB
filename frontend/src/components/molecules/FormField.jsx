import React from 'react';
import Label from '../atoms/Label';
import Input from '../atoms/Input';

export const FormField = ({
  id,
  label,
  type = 'text',
  value,
  onChange,
  onBlur,
  error,
  helperText,
  placeholder,
  required = false,
  autoComplete,
  inputMode,
  maxLength,
  as = 'input',
  rows,
  className = '',
  style = {}
}) => {
  return (
    <div className={`fld ${className}`} style={style}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Label htmlFor={id} required={required}>
          {label}
        </Label>
        {maxLength && (
          <span style={{ fontSize: '0.74rem', color: 'var(--muted)', opacity: 0.8 }}>
            {value?.length || 0}/{maxLength}
          </span>
        )}
      </div>
      <Input
        id={id}
        type={type}
        as={as}
        rows={rows}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        required={required}
        autoComplete={autoComplete}
        inputMode={inputMode}
        maxLength={maxLength}
        invalid={Boolean(error)}
      />
      {error ? (
        <p className="err" id={`e-${id}`} role="alert" style={{ marginTop: 4, display: 'flex', alignItems: 'center', gap: 5 }}>
          <span aria-hidden="true">⚠️</span>
          <span>{error}</span>
        </p>
      ) : helperText ? (
        <p className="fld-helper" style={{ fontSize: '0.78rem', color: 'var(--muted)', marginTop: 4, opacity: 0.8 }}>
          {helperText}
        </p>
      ) : null}
    </div>
  );
};

export default FormField;
