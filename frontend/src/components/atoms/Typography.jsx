import React from 'react';

export const Eyebrow = ({ children, className = '' }) => (
  <p className={`eyebrow ${className}`}>{children}</p>
);

export const Title = ({ children, as: Tag = 'h2', className = '' }) => (
  <Tag className={`title ${className}`}>{children}</Tag>
);

export const Lede = ({ children, className = '' }) => (
  <p className={`lede ${className}`}>{children}</p>
);

export const TamilText = ({ children, className = '' }) => (
  <p className={`tamil-title ${className}`} lang="ta">{children}</p>
);
