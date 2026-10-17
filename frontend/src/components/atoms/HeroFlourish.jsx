import React from 'react';

/**
 * Traditional antique gold 5-diamond kolam / rangoli motif
 * Rendered below the countdown panel in the hero section matching the reference design.
 */
export const HeroFlourish = ({ className = '', style = {} }) => {
  return (
    <div
      className={`hero-flourish ${className}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start',
        marginTop: '16px',
        opacity: 0.85,
        ...style
      }}
      aria-hidden="true"
    >
      <svg width="74" height="20" viewBox="0 0 74 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Center Diamond */}
        <path d="M37 1L44 10L37 19L30 10L37 1Z" fill="#D6A342" />
        <circle cx="37" cy="10" r="1.5" fill="#26090D" />

        {/* Medium Inner Diamonds */}
        <path d="M22 4L27 10L22 16L17 10L22 4Z" fill="#D6A342" opacity="0.8" />
        <path d="M52 4L57 10L52 16L47 10L52 4Z" fill="#D6A342" opacity="0.8" />

        {/* Small Outer Diamonds */}
        <path d="M10 7L13 10L10 13L7 10L10 7Z" fill="#D6A342" opacity="0.6" />
        <path d="M64 7L67 10L64 13L61 10L64 7Z" fill="#D6A342" opacity="0.6" />

        {/* Connecting Accents */}
        <circle cx="2" cy="10" r="1.5" fill="#D6A342" opacity="0.4" />
        <circle cx="72" cy="10" r="1.5" fill="#D6A342" opacity="0.4" />
      </svg>
    </div>
  );
};

export default HeroFlourish;
