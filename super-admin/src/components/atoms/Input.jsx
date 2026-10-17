import React from 'react';

export const Input = ({
  id,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  as = 'input',
  rows = 3,
  className = '',
  style = {},
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
        rows={rows}
        className={`admin-textarea ${className}`}
        style={style}
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
      className={`admin-input ${className}`}
      style={style}
      {...props}
    />
  );
};

export default Input;
