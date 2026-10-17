import React from 'react';
import { Eyebrow, TamilText } from '../atoms/Typography';
import { PriceDisplay } from '../molecules/PriceDisplay';
import { Button } from '../atoms/Button';
import { useCountdown } from '../../hooks/useCountdown';
import TempleGopuramSketch from '../atoms/TempleGopuramSketch';
import CornerDiyaAccent from '../atoms/CornerDiyaAccent';
import HeroFlourish from '../atoms/HeroFlourish';

export const HeroSection = ({
  product,
  countdownDate = '2026-11-15T00:00:00+05:30',
  eventLocation = 'Thiruttani',
  eventDateFormatted = '15 November 2026'
}) => {
  const { label } = useCountdown(countdownDate);
  const priceInRupees = product?.priceInPaise ? product.priceInPaise / 100 : 2500;

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="hero">
      {/* Background Decorative Layer 1: South Indian Temple Gopuram Watermark (Left) */}
      <TempleGopuramSketch />

      {/* Background Decorative Layer 2: Brass Oil Lamp, Jasmine Flowers & Silk Accent (Bottom Left) */}
      <CornerDiyaAccent />

      {/* Background Layer 3: Warm Ambient Radial Light Spotlights */}
      <div className="hero-ambient-glow" aria-hidden="true" />

      {/* Main Two-Column Content Stage */}
      <div className="wrap hero-wrap">
        <div className="hero-grid">
          {/* Left Column (approx 45%): Editorial Devotional Typography & Actions */}
          <div className="hero-content">
            <Eyebrow>Arupadai Veedu · Soora Samhara 2026</Eyebrow>
            <TamilText>சூரசம்ஹார பூஜை</TamilText>
            <h1 className="hero-heading">
              Soora Samhara<br />Pooja Box
            </h1>
            <p className="hero-sub">
              Six vibhuti from the Arupadai temples, a Murugan keepsake statue, a rudraksh bracelet and chandan. The box travels to all six temples and to the final Yaagam at {eventLocation} on {eventDateFormatted.split(' ')[0]} {eventDateFormatted.split(' ')[1]}, and comes to you with its authentication certificate.
            </p>

            <PriceDisplay amountInRupees={priceInRupees} note="per box, one standard box" />

            <div className="cta-row">
              <Button onClick={() => scrollTo('order')} href="#order" className="btn-hero-primary">
                Reserve your box
              </Button>
              <a
                className="link-quiet hero-link-quiet"
                href="#inside"
                onClick={(e) => {
                  e.preventDefault();
                  scrollTo('inside');
                }}
              >
                See what is inside
              </a>
            </div>

            {/* Premium Yaagam Countdown Panel */}
            <div className="countdown-box">
              <strong className="countdown-days">{label}</strong>
              <span className="countdown-sep" aria-hidden="true" />
              <span className="countdown-meta">{eventDateFormatted} · {eventLocation}</span>
            </div>

            {/* Traditional 5-diamond antique gold kolam motif */}
            <HeroFlourish />
          </div>

          {/* Right Column (approx 55%): Realistic Cinematic Pooja Box Display */}
          <div className="hero-product-stage">
            <img
              src={product?.imageUrl || "/Luxury Maroon Murugan Pooja Kit.png"}
              alt="Sri Sankara TV Soora Samhara Pooja Box 2026 - Sanctified kit featuring Lord Murugan statue, 6 Arupadai vibhuti tins, rudraksh bracelet, chandan and final Yaagam box"
              className="hero-box-img"
              width="1024"
              height="1152"
              loading="eager"
              onError={(e) => {
                if (!e.target.dataset.triedFallback) {
                  e.target.dataset.triedFallback = 'true';
                  e.target.src = '/hero-product-kit.png';
                }
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
