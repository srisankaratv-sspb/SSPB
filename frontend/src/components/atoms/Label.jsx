import React from 'react';

export const Label = ({ htmlFor, children, required = false, className = '' }) => {
  return (
    <label htmlFor={htmlFor} className={className}>
      {children}
      {required && <span style={{ color: 'var(--err)', marginLeft: 4 }}>*</span>}
    </label>
  );
};

export default Label;
