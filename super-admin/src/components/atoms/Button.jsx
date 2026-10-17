import React from 'react';

export const Button = ({
  children,
  variant = 'primary', // 'primary', 'secondary', 'danger', 'alt'
  type = 'button',
  onClick,
  disabled = false,
  loading = false,
  className = '',
  style = {},
  ...props
}) => {
  let btnClass = 'btn-admin';
  if (variant === 'primary') btnClass += ' btn-admin-primary';
  else if (variant === 'danger') btnClass += ' btn-admin-danger';
  else btnClass += ' btn-admin-secondary';

  if (className) btnClass += ` ${className}`;

  return (
    <button
      type={type}
      className={btnClass}
      onClick={onClick}
      disabled={disabled || loading}
      style={style}
      {...props}
    >
      {loading && (
        <span
          style={{
            display: 'inline-block',
            width: 14,
            height: 14,
            border: '2px solid currentColor',
            borderTopColor: 'transparent',
            borderRadius: '50%',
            animation: 'spin 0.6s linear infinite'
          }}
        />
      )}
      {children}
    </button>
  );
};

export default Button;
