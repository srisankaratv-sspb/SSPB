import React, { useState, useEffect } from 'react';
import { HeroSection } from '../components/organisms/HeroSection';
import { ProductContents } from '../components/organisms/ProductContents';
import { TempleJourney } from '../components/organisms/TempleJourney';
import { CertificateSection } from '../components/organisms/CertificateSection';
import { OrderForm } from '../components/organisms/OrderForm';
import { orderService } from '../services/orderService';
import { api } from '../services/apiClient';

export const HomePage = () => {
  const [product, setProduct] = useState(null);
  const [settings, setSettings] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const prodRes = await orderService.getPublicProduct();
        if (prodRes.success && prodRes.data) {
          setProduct(prodRes.data);
        }

        // Fetch public settings if available
        try {
          const settingsRes = await api.get('/admin/settings');
          if (settingsRes.success && settingsRes.data) {
            const settingsMap = {};
            settingsRes.data.forEach((s) => {
              settingsMap[s.key] = s.value;
            });
            setSettings(settingsMap);
          }
        } catch (e) {
          // Public settings fallback
        }
      } catch (err) {
        console.warn('[HomePage] Failed to fetch live product details:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const countdownTarget = settings.countdown_target_date || product?.eventDate || '2026-11-15T00:00:00+05:30';

  return (
    <>
      <HeroSection
        product={product}
        countdownDate={countdownTarget}
        eventLocation={product?.eventLocation || 'Thiruttani'}
        eventDateFormatted="15 November 2026"
      />
      <ProductContents items={product?.contents} />
      <TempleJourney temples={product?.temples} />
      <CertificateSection config={product?.certificateConfig} />
      <OrderForm product={product} settings={settings} />
    </>
  );
};

export default HomePage;
