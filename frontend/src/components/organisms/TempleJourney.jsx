import React from 'react';
import { Eyebrow, Title, Lede } from '../atoms/Typography';
import { TempleCard } from '../molecules/TempleCard';

export const TempleJourney = ({ temples = [] }) => {
  const templeList = Array.isArray(temples) ? temples : [];

  return (
    <section className="band temples" id="temples">
      <div className="wrap">
        <Eyebrow>The journey</Eyebrow>
        <Title>Six temples, one Yaagam</Title>
        <Lede>
          The box visits all six Arupadai Veedu temples, then reaches Thiruttani for the final Yaagam on 15 November.
        </Lede>
        <div className="temple-grid">
          {templeList.length === 0 ? (
            <div style={{ color: 'var(--muted)', gridColumn: '1 / -1', textAlign: 'center', padding: '30px 0' }}>
              Loading sacred pilgrimage temples from database...
            </div>
          ) : (
            templeList.map((temple, index) => (
              <TempleCard
                key={temple._id || index}
                index={index}
                ta={temple.ta}
                en={temple.en}
                where={temple.where}
                isFinal={temple.isFinal}
                flag={temple.flag}
              />
            ))
          )}
        </div>
      </div>
    </section>
  );
};

export default TempleJourney;
