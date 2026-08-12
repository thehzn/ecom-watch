import React from 'react';
import sportWatch from '../../assets/sport-watch.jpg';
import limitedWatch from '../../assets/limited-watch.jpg';

export default function ArtSection() {
  return (
    <section className="w-full bg-[#F9F9F9] py-16 md:py-24" aria-labelledby="art-title">
      <div className="max-w-[1280px] mx-auto px-6 md:px-16 lg:px-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-[64px] items-center">

          <div className="grid grid-cols-2 gap-4 w-full">
            <div className="h-[220px] sm:h-[320px] md:h-[380px] lg:h-[420px]">
              <img
                src={sportWatch}
                alt="Finely crafted sport edition timepiece with metal detailing"
                className="w-full h-full object-cover rounded-[2px]"
              />
            </div>
            <div className="h-[220px] sm:h-[320px] md:h-[380px] lg:h-[420px]">
              <img
                src={limitedWatch}
                alt="Limited edition luxury dress watch showcasing detailed watch dial"
                className="w-full h-full object-cover rounded-[2px]"
              />
            </div>
          </div>

          <div className="flex flex-col justify-center">
            <h2
              id="art-title"
              className="font-caslon text-4xl md:text-[40px] font-normal text-black leading-tight"
            >
              The Art of the Hand
            </h2>
            <p className="font-inter text-base font-normal leading-[28px] text-[#5D5E63] mt-6">
              True luxury is born from human touch. Every bridge, lever, and dial in our collection is painstakingly bevelled, polished, and assembled by hand. A master watchmaker spends up to several weeks working on a single movement, ensuring its mechanical heartbeat achieves unparalleled accuracy.
            </p>
            <p className="font-inter text-base font-normal leading-[28px] text-[#5D5E63] mt-4">
              It is this artisan touch that gives each timepiece its individual character—a microscopic fingerprint of metal craftsmanship that distinguishes hand-assembly from factory production.
            </p>
          </div>

        </div>
      </div>
    </section>
  );
}
