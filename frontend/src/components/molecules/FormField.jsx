import React from 'react';
import Label from '../atoms/Label';
import Input from '../atoms/Input';

export const FormField = ({
  id,
  label,
  type = 'text',
  value,
  onChange,
  error,
  placeholder,
  required = false,
  autoComplete,
  inputMode,
  as = 'input',
  rows,
  className = '',
  style = {}
}) => {
  return (
    <div className={`fld ${className}`} style={style}>
      <Label htmlFor={id} required={required}>
        {label}
      </Label>
      <Input
        id={id}
        type={type}
        as={as}
        rows={rows}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        autoComplete={autoComplete}
        inputMode={inputMode}
        invalid={Boolean(error)}
      />
      <p className="err" id={`e-${id}`} role="alert">
        {error || ''}
      </p>
    </div>
  );
};

export default FormField;
