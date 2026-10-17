import React from 'react';
import Label from '../atoms/Label';
import Input from '../atoms/Input';

export const FormField = ({
  id,
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  as = 'input',
  rows = 3,
  error = '',
  helperText = '',
  style = {}
}) => {
  return (
    <div style={{ display: 'grid', gap: 4, ...style }}>
      {label && <Label htmlFor={id} required={required}>{label}</Label>}
      <Input
        id={id}
        type={type}
        as={as}
        rows={rows}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
      />
      {error && <p style={{ color: '#DC2626', fontSize: '0.8rem', margin: 0 }}>{error}</p>}
      {helperText && <p style={{ color: '#64748B', fontSize: '0.78rem', margin: 0 }}>{helperText}</p>}
    </div>
  );
};

export default FormField;
