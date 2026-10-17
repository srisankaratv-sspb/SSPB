import React from 'react';
import { Header } from '../organisms/Header';
import { Footer } from '../organisms/Footer';

export const PublicLayout = ({ children }) => {
  return (
    <div className="public-layout">
      <Header />
      <main id="top">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default PublicLayout;
