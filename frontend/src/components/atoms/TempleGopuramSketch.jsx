import React from 'react';

/**
 * High-precision vector illustration of a South Indian Dravidian Temple Gopuram
 * Rendered with subtle antique gold linework in the hero background.
 */
export const TempleGopuramSketch = ({ className = '', style = {} }) => {
  return (
    <svg
      viewBox="0 0 320 600"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`temple-gopuram-sketch ${className}`}
      style={style}
      aria-hidden="true"
    >
      {/* Sacred Kalasams (Finials on top) */}
      <g stroke="#D6A342" strokeWidth="1.2" strokeLinecap="round">
        <path d="M160 12V32M156 22H164M158 16H162" />
        <circle cx="160" cy="18" r="2.5" />
        <path d="M142 18V34M139 26H145" />
        <circle cx="142" cy="22" r="2" />
        <path d="M178 18V34M175 26H181" />
        <circle cx="178" cy="22" r="2" />
        <path d="M126 24V36" />
        <circle cx="126" cy="28" r="1.5" />
        <path d="M194 24V36" />
        <circle cx="194" cy="28" r="1.5" />

        {/* Shikhara (Dome ridge) */}
        <path d="M116 38C136 34 184 34 204 38L214 46H106L116 38Z" />
        <line x1="106" y1="46" x2="214" y2="46" />
        <line x1="100" y1="52" x2="220" y2="52" />

        {/* Tier 1 */}
        <path d="M102 52L96 82H224L218 52" />
        <line x1="94" y1="82" x2="226" y2="82" />
        {/* Tier 1 niches & pilasters */}
        <rect x="114" y="58" width="16" height="20" rx="1" />
        <rect x="152" y="56" width="16" height="22" rx="1" />
        <rect x="190" y="58" width="16" height="20" rx="1" />

        {/* Tier 2 */}
        <path d="M92 86L84 122H236L228 86" />
        <line x1="82" y1="122" x2="238" y2="122" />
        <rect x="100" y="92" width="18" height="26" rx="1" />
        <rect x="130" y="90" width="18" height="28" rx="1" />
        <rect x="151" y="88" width="18" height="30" rx="1" />
        <rect x="172" y="90" width="18" height="28" rx="1" />
        <rect x="202" y="92" width="18" height="26" rx="1" />

        {/* Tier 3 */}
        <path d="M80 126L70 170H250L240 126" />
        <line x1="68" y1="170" x2="252" y2="170" />
        <rect x="88" y="132" width="20" height="34" rx="1" />
        <rect x="120" y="130" width="20" height="36" rx="1" />
        <rect x="150" y="128" width="20" height="38" rx="1" />
        <rect x="180" y="130" width="20" height="36" rx="1" />
        <rect x="212" y="132" width="20" height="34" rx="1" />

        {/* Tier 4 */}
        <path d="M66 174L54 226H266L254 174" />
        <line x1="52" y1="226" x2="268" y2="226" />
        <rect x="76" y="180" width="22" height="42" rx="1" />
        <rect x="110" y="178" width="22" height="44" rx="1" />
        <rect x="149" y="176" width="22" height="46" rx="1" />
        <rect x="188" y="178" width="22" height="44" rx="1" />
        <rect x="222" y="180" width="22" height="42" rx="1" />

        {/* Tier 5 */}
        <path d="M50 230L36 290H284L270 230" />
        <line x1="34" y1="290" x2="286" y2="290" />
        <rect x="62" y="238" width="24" height="48" rx="1" />
        <rect x="100" y="236" width="24" height="50" rx="1" />
        <rect x="148" y="234" width="24" height="52" rx="1" />
        <rect x="196" y="236" width="24" height="50" rx="1" />
        <rect x="234" y="238" width="24" height="48" rx="1" />

        {/* Tier 6 */}
        <path d="M32 294L16 362H304L288 294" />
        <line x1="14" y1="362" x2="306" y2="362" />
        <rect x="46" y="304" width="26" height="54" rx="1" />
        <rect x="90" y="302" width="26" height="56" rx="1" />
        <rect x="147" y="300" width="26" height="58" rx="1" />
        <rect x="204" y="302" width="26" height="56" rx="1" />
        <rect x="248" y="304" width="26" height="54" rx="1" />

        {/* Tier 7 / Base Cornice */}
        <path d="M12 366L2 444H318L308 366" />
        <line x1="0" y1="444" x2="320" y2="444" />
        <line x1="0" y1="452" x2="320" y2="452" />

        {/* Grand Gopuram Gate (Dvāra) */}
        <path d="M110 452V600" />
        <path d="M210 452V600" />
        <path d="M110 490C110 460 210 460 210 490V600H110V490Z" strokeWidth="1.5" />
        {/* Gate Torana Arch */}
        <path d="M124 502C124 480 196 480 196 502V600" strokeWidth="1" />
        <circle cx="160" cy="475" r="4" />

        {/* Decorative pilasters on gate walls */}
        <line x1="32" y1="452" x2="32" y2="600" strokeDasharray="3 3" />
        <line x1="70" y1="452" x2="70" y2="600" strokeDasharray="3 3" />
        <line x1="250" y1="452" x2="250" y2="600" strokeDasharray="3 3" />
        <line x1="288" y1="452" x2="288" y2="600" strokeDasharray="3 3" />

        {/* Horizontal frieze lines */}
        <line x1="10" y1="500" x2="110" y2="500" />
        <line x1="210" y1="500" x2="310" y2="500" />
        <line x1="10" y1="550" x2="110" y2="550" />
        <line x1="210" y1="550" x2="310" y2="550" />
      </g>
    </svg>
  );
};

export default TempleGopuramSketch;
