import React from 'react';
import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer>
      <div className="wrap">
        <strong>Sri Sankara TV</strong>
        <span>Soora Samhara Pooja Box · Arupadai temples to the Thiruttani Yaagam, 15 November 2026</span>
        <div style={{ marginTop: 12, display: 'flex', gap: 16, fontSize: '0.82rem', opacity: 0.75 }}>
          <Link to="/orders/track" style={{ color: 'inherit' }}>Track Your Order</Link>
          <span>·</span>
          <Link to="/admin/login" style={{ color: 'inherit' }}>Staff Portal</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
