import React from 'react';

export const TempleCard = ({ ta, en, where, isFinal = false, flag = null, index }) => {
  const formattedIndex = typeof index === 'number' ? String(index + 1).padStart(2, '0') : null;

  return (
    <div className={`temple ${isFinal ? 'final' : ''}`}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <p className="ta" lang="ta">{ta}</p>
        {formattedIndex && (
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '0.9rem',
              color: isFinal ? 'var(--gold-bright)' : 'var(--gold)',
              opacity: 0.75,
              fontWeight: 600,
              letterSpacing: '0.05em'
            }}
          >
            {formattedIndex}
          </span>
        )}
      </div>
      <p className="en">{en}</p>
      <p className="where">{where}</p>
      {isFinal && flag && <span className="flag">{flag}</span>}
    </div>
  );
};

export default TempleCard;
