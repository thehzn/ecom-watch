import React from 'react';
import heritageWatch from '../../assets/heritage-watch.jpg';

export default function HeritageSection() {
  return (
    <section className="w-full bg-white py-16 md:py-24" aria-labelledby="heritage-title">
      <div className="max-w-[1280px] mx-auto px-6 md:px-16 lg:px-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-[64px] items-center">
          <div className="flex flex-col justify-center">
            <h2
              id="heritage-title"
              className="font-caslon text-4xl md:text-[40px] font-normal text-black leading-tight"
            >
              Generations of Heritage
            </h2>
            <p className="font-inter text-base font-normal leading-[28px] text-[#5D5E63] mt-6">
              For over a century, our family-owned watchmaking house has pioneered the art of precise timekeeping. Passed down through generations, our methods preserve the sanctity of hand-finishing, utilizing tools and techniques that have remained virtually unchanged for over one hundred and fifty years.
            </p>
            <p className="font-inter text-base font-normal leading-[28px] text-[#5D5E63] mt-4">
              Every ticking movement tells the story of stubborn devotion to quality. We seek not to chase temporary trends, but to build perpetual statements of excellence that can be proudly passed down as heirlooms for generations to come.
            </p>
          </div>

          <div className="w-full h-[300px] sm:h-[400px] lg:h-[480px]">
            <img
              src={heritageWatch}
              alt="Close-up of a vintage watch movement showcasing heritage horology craftsmanship"
              className="w-full h-full object-cover rounded-[2px]"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
