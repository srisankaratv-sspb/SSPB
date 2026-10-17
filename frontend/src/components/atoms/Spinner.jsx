import React from 'react';

export const Spinner = ({ size = 24, color = 'var(--gold)' }) => (
  <svg
    style={{
      width: size,
      height: size,
      animation: 'spin 0.8s linear infinite',
      display: 'inline-block'
    }}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="3"
      strokeOpacity="0.2"
      style={{ color }}
    />
    <path
      d="M12 2a10 10 0 0 1 10 10"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      style={{ color }}
    />
  </svg>
);

export default Spinner;
