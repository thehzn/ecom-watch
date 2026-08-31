import React from 'react';
import HeroSection from '../components/about/HeroSection';
import HeritageSection from '../components/about/HeritageSection';
import ArtSection from '../components/about/ArtSection';
import InnovationSection from '../components/about/InnovationSection';
import CTASection from '../components/about/CTASection';

export default function About() {
  return (
    <article className="w-full bg-[#08090C] text-white min-h-screen flex flex-col font-['Plus_Jakarta_Sans'] selection:bg-white selection:text-black">
      <HeroSection />
      <HeritageSection />
      <ArtSection />
      <InnovationSection />
      <CTASection />
    </article>
  );
}
