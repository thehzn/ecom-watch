import React from 'react';
import sportWatch from '../../assets/sport-watch.jpg';
import limitedWatch from '../../assets/limited-watch.jpg';
import { Sparkles } from 'lucide-react';

export default function ArtSection() {
  return (
    <section className="w-full bg-[#0B0D12] py-20 sm:py-28 px-6 sm:px-12 border-b border-white/10" aria-labelledby="art-title">
      <div className="max-w-[1600px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

          {/* Left Dual Photography Showcase */}
          <div className="lg:col-span-6 grid grid-cols-2 gap-4 sm:gap-6 w-full">
            <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-[#0E1015] border border-white/15 shadow-2xl group">
              <img
                src={sportWatch}
                alt="Finely crafted sport edition timepiece with metal detailing"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-108"
              />
            </div>
            <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-[#0E1015] border border-white/15 shadow-2xl group mt-6 sm:mt-10">
              <img
                src={limitedWatch}
                alt="Limited edition luxury dress watch showcasing detailed watch dial"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-108"
              />
            </div>
          </div>

          {/* Right Text */}
          <div className="lg:col-span-6 flex flex-col justify-center">
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-gray-400 mb-3">
              Master Hand-Finishing
            </span>

            <h2
              id="art-title"
              className="text-3xl sm:text-5xl font-bold text-white tracking-tight leading-tight"
            >
              The Art of the <br />
              <span className="platinum-gradient-text font-light">Human Touch</span>
            </h2>

            <p className="text-sm sm:text-base text-gray-300 leading-relaxed mt-6 font-normal">
              True luxury is born from human touch. Every bridge, lever, and dial in our collection is painstakingly beveled, polished, and assembled by hand. A master watchmaker spends up to several weeks working on a single movement.
            </p>

            <p className="text-sm sm:text-base text-gray-400 leading-relaxed mt-4 font-normal">
              It is this artisan touch that gives each timepiece its individual character — a microscopic fingerprint of metal craftsmanship that distinguishes hand-assembly from factory automation.
            </p>

            <div className="mt-8 p-5 bg-[#0E1015] border border-white/10 rounded-2xl flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white shrink-0">
                <Sparkles size={18} />
              </div>
              <div>
                <p className="text-xs font-bold text-white uppercase tracking-wider">Geneva Seal Standard</p>
                <p className="text-[11px] text-gray-400 mt-0.5">Certified anglage, polishing, and perpetual balance regulation.</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
