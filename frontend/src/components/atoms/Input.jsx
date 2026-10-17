import React from 'react';

export const Input = ({
  id,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  invalid = false,
  readOnly = false,
  inputMode,
  autoComplete,
  className = '',
  as = 'input',
  rows = 3,
  ...props
}) => {
  if (as === 'textarea') {
    return (
      <textarea
        id={id}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        readOnly={readOnly}
        autoComplete={autoComplete}
        aria-invalid={invalid ? 'true' : 'false'}
        rows={rows}
        className={className}
        {...props}
      />
    );
  }

  return (
    <input
      id={id}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      readOnly={readOnly}
      inputMode={inputMode}
      autoComplete={autoComplete}
      aria-invalid={invalid ? 'true' : 'false'}
      className={className}
      {...props}
    />
  );
};

export default Input;
