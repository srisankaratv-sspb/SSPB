import React from 'react';

export const Label = ({ htmlFor, children, required = false, style = {} }) => (
  <label
    htmlFor={htmlFor}
    style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: 4, ...style }}
  >
    {children}
    {required && <span style={{ color: '#DC2626', marginLeft: 4 }}>*</span>}
  </label>
);

export default Label;
