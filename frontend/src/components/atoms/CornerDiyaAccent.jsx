import React from 'react';

/**
 * Traditional Brass Diya Oil Lamp, Jasmine Blossoms, and Red Zari Silk
 * Decorative corner element matching the authentic atmospheric hero scene in the reference image.
 */
export const CornerDiyaAccent = ({ className = '', style = {} }) => {
  return (
    <div
      className={`hero-corner-diya ${className}`}
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: '280px',
        height: '240px',
        pointerEvents: 'none',
        zIndex: 2,
        overflow: 'hidden',
        ...style
      }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 280 240"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: '100%', height: '100%' }}
      >
        <defs>
          {/* Flame radiant glow */}
          <radialGradient id="flameGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFF2A3" stopOpacity="1" />
            <stop offset="25%" stopColor="#F59E0B" stopOpacity="0.85" />
            <stop offset="60%" stopColor="#D9731A" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#713A20" stopOpacity="0" />
          </radialGradient>

          {/* Diya Brass Gradient */}
          <linearGradient id="brassGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FDE68A" />
            <stop offset="35%" stopColor="#D6A342" />
            <stop offset="70%" stopColor="#92400E" />
            <stop offset="100%" stopColor="#451A03" />
          </linearGradient>

          {/* Silk Maroon Gradient */}
          <linearGradient id="silkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#5B131D" />
            <stop offset="40%" stopColor="#3B0C13" />
            <stop offset="85%" stopColor="#220609" />
          </linearGradient>

          {/* Golden Zari Border Gradient */}
          <linearGradient id="zariGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#F59E0B" />
            <stop offset="25%" stopColor="#FDE68A" />
            <stop offset="50%" stopColor="#D6A342" />
            <stop offset="75%" stopColor="#FDE68A" />
            <stop offset="100%" stopColor="#B45309" />
          </linearGradient>

          <filter id="softBlur" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="6" />
          </filter>
        </defs>

        {/* 1. Draped Deep Maroon Silk Fabric with Folds */}
        <path
          d="M-20 260C10 200 40 180 80 190C120 200 150 250 180 260Z"
          fill="url(#silkGrad)"
          opacity="0.95"
        />
        <path
          d="M-40 230C-10 170 30 160 70 175C110 190 130 240 150 260Z"
          fill="url(#silkGrad)"
          opacity="0.8"
        />

        {/* Golden Zari Embroidery on Silk */}
        <path
          d="M-30 235C-2 180 34 170 72 182C108 196 126 242 144 260"
          stroke="url(#zariGrad)"
          strokeWidth="6"
          strokeLinecap="round"
          opacity="0.9"
        />
        <path
          d="M-28 240C-2 185 34 175 72 187C108 201 126 247 144 265"
          stroke="#92400E"
          strokeWidth="1.5"
          strokeDasharray="3 3"
        />

        {/* 2. Traditional Brass Lamp (Diya) Base & Body */}
        {/* Soft shadow under diya */}
        <ellipse cx="68" cy="188" rx="42" ry="14" fill="#0D0305" opacity="0.8" filter="url(#softBlur)" />

        {/* Diya Base Platter */}
        <ellipse cx="68" cy="184" rx="38" ry="10" fill="url(#brassGrad)" />
        <ellipse cx="68" cy="182" rx="34" ry="7" fill="#78350F" opacity="0.5" />

        {/* Diya Stem */}
        <path d="M64 182H72L74 165H62L64 182Z" fill="url(#brassGrad)" />
        <ellipse cx="68" cy="165" rx="10" ry="3.5" fill="url(#brassGrad)" />

        {/* Diya Oil Cup / Reservoir */}
        <ellipse cx="68" cy="158" rx="26" ry="9" fill="url(#brassGrad)" />
        <ellipse cx="68" cy="156" rx="22" ry="6" fill="#451A03" />
        <ellipse cx="68" cy="157" rx="18" ry="4" fill="#92400E" opacity="0.8" />

        {/* Diya Spout pointing up */}
        <path d="M66 154C67 146 69 146 70 154Z" fill="url(#brassGrad)" />

        {/* 3. Glowing Oil Flame */}
        {/* Large ambient flame glow */}
        <circle cx="68" cy="136" r="38" fill="url(#flameGlow)" opacity="0.65" />
        <circle cx="68" cy="136" r="22" fill="url(#flameGlow)" opacity="0.9" />

        {/* Inner Flame core */}
        <path
          d="M68 116C62 130 63 146 68 152C73 146 74 130 68 116Z"
          fill="#FFFBEB"
        />
        <path
          d="M68 122C64 133 65 144 68 149C71 144 72 133 68 122Z"
          fill="#FDE68A"
        />
        <path
          d="M68 132C66 138 66 145 68 148C70 145 70 138 68 132Z"
          fill="#F59E0B"
        />

        {/* 4. White Jasmine Flowers (Malligai) */}
        {/* Flower 1 - Left of diya */}
        <g transform="translate(108, 178) scale(0.75)">
          <ellipse cx="14" cy="4" rx="4" ry="10" transform="rotate(0 14 4)" fill="#FFFDF5" />
          <ellipse cx="14" cy="4" rx="4" ry="10" transform="rotate(72 14 4)" fill="#FFFDF5" />
          <ellipse cx="14" cy="4" rx="4" ry="10" transform="rotate(144 14 4)" fill="#FFFDF5" />
          <ellipse cx="14" cy="4" rx="4" ry="10" transform="rotate(216 14 4)" fill="#FFFDF5" />
          <ellipse cx="14" cy="4" rx="4" ry="10" transform="rotate(288 14 4)" fill="#FFFDF5" />
          <circle cx="14" cy="4" r="3.5" fill="#FBBF24" />
        </g>

        {/* Flower 2 - Near Silk edge */}
        <g transform="translate(85, 204) scale(0.65)">
          <ellipse cx="12" cy="4" rx="3.5" ry="9" transform="rotate(15 12 4)" fill="#FFFDF5" />
          <ellipse cx="12" cy="4" rx="3.5" ry="9" transform="rotate(87 12 4)" fill="#FFFDF5" />
          <ellipse cx="12" cy="4" rx="3.5" ry="9" transform="rotate(159 12 4)" fill="#FFFDF5" />
          <ellipse cx="12" cy="4" rx="3.5" ry="9" transform="rotate(231 12 4)" fill="#FFFDF5" />
          <ellipse cx="12" cy="4" rx="3.5" ry="9" transform="rotate(303 12 4)" fill="#FFFDF5" />
          <circle cx="12" cy="4" r="3" fill="#FBBF24" />
        </g>

        {/* Flower 3 - Foreground right */}
        <g transform="translate(136, 202) scale(0.85)">
          <ellipse cx="14" cy="6" rx="4.5" ry="11" transform="rotate(35 14 6)" fill="#FFFDF5" />
          <ellipse cx="14" cy="6" rx="4.5" ry="11" transform="rotate(107 14 6)" fill="#FFFDF5" />
          <ellipse cx="14" cy="6" rx="4.5" ry="11" transform="rotate(179 14 6)" fill="#FFFDF5" />
          <ellipse cx="14" cy="6" rx="4.5" ry="11" transform="rotate(251 14 6)" fill="#FFFDF5" />
          <ellipse cx="14" cy="6" rx="4.5" ry="11" transform="rotate(323 14 6)" fill="#FFFDF5" />
          <circle cx="14" cy="6" r="4" fill="#F59E0B" />
        </g>
      </svg>
    </div>
  );
};

export default CornerDiyaAccent;
