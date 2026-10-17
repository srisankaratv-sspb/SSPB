import React from 'react';
import { Eyebrow, Title, Lede } from '../atoms/Typography';

export const ProductContents = ({ items = [] }) => {
  const contentsList = Array.isArray(items) ? items : [];

  return (
    <section className="band" id="inside">
      <div className="wrap inside-grid">
        <div>
          <Eyebrow>Inside the box</Eyebrow>
          <Title>Five things, blessed along the way</Title>
          <Lede>
            Everything is packed as one box and travels together from temple to temple, ending at the Yaagam in Thiruttani.
          </Lede>
        </div>
        <ul className="items">
          {contentsList.length === 0 ? (
            <li style={{ padding: '24px 0', color: 'var(--muted)' }}>
              Loading contents from temple registry...
            </li>
          ) : (
            contentsList.map((item, index) => (
              <li key={item._id || index}>
                <span className="qty">{item.qty}</span>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </section>
  );
};

export default ProductContents;
