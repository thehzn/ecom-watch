import React from 'react';
import luxuryWatchHero from '../../assets/luxury_watch_hero.png';

export default function HeroSection() {
  return (
    <section className="w-full relative overflow-hidden" aria-label="Hero Banner">
      <div className="w-full h-[350px] sm:h-[450px] md:h-[550px] lg:h-[650px]">
        <img
          src={luxuryWatchHero}
          alt="Luxury premium watch close-up displaying craftsmanship"
          className="w-full h-full object-cover object-center block"
          loading="eager"
        />
      </div>
    </section>
  );
}
