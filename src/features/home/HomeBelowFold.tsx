import React from 'react';
import { BestsellersSlider } from './BestsellersSlider';
import { DepthCarousel } from '../../components/DepthCarousel/DepthCarousel';
import { PersonalizeBanner } from './PersonalizeBanner';
import { Footer } from '../../components/Footer/Footer';

export const HomeBelowFold: React.FC = () => {
  return (
    <>
      {/* Section 3: Bestselling Collection */}
      <BestsellersSlider />

      {/* Section 4: Depth Carousel of All 11 Categories */}
      <section className="categories-section" id="categories" aria-labelledby="categories-title">
        <div className="container categories__header">
          <span className="categories__eyebrow">EXPLORE OUR CATEGORIES</span>
          <h2 className="categories__title title-lined" id="categories-title">
            A Gift for Every Moment
          </h2>
        </div>
        <DepthCarousel />
      </section>

      {/* Section 6: Personalize Banner & Trust Strip */}
      <PersonalizeBanner />

      {/* Shared Site Footer */}
      <Footer />
    </>
  );
};

export default HomeBelowFold;
