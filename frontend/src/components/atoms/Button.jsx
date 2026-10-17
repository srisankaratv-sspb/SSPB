import React from 'react';

export const Button = ({
  children,
  variant = 'primary', // 'primary', 'alt', 'mini', 'danger', 'admin'
  type = 'button',
  onClick,
  disabled = false,
  loading = false,
  href = null,
  className = '',
  target,
  rel,
  ...props
}) => {
  let buttonClasses = 'btn';
  if (variant === 'alt') buttonClasses += ' alt';
  if (variant === 'mini') buttonClasses = 'mini';
  if (className) buttonClasses += ` ${className}`;

  const content = (
    <>
      {loading && (
        <span style={{ display: 'inline-block', width: 16, height: 16, border: '2px solid currentColor', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.6s linear infinite', marginRight: 8 }}></span>
      )}
      {children}
    </>
  );

  if (href) {
    return (
      <a href={href} className={buttonClasses} target={target} rel={rel} {...props}>
        {content}
      </a>
    );
  }

  return (
    <button
      type={type}
      className={buttonClasses}
      onClick={onClick}
      disabled={disabled || loading}
      {...props}
    >
      {content}
    </button>
  );
};

export default Button;
