import React from 'react';
import atelierMasterCraftsman from '../../assets/atelier_master_craftsman.jpg';
import { Award, ShieldCheck, Check } from 'lucide-react';

export default function HeritageSection() {
  return (
    <section className="w-full bg-[#08090C] py-20 sm:py-28 px-6 sm:px-12 border-b border-white/10" aria-labelledby="heritage-title">
      <div className="max-w-[1600px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Text */}
          <div className="lg:col-span-6 flex flex-col justify-center">
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-gray-400 mb-3">
              One Century of Mastery
            </span>
            <h2
              id="heritage-title"
              className="text-3xl sm:text-5xl font-bold text-white tracking-tight leading-tight"
            >
              Generations of <br />
              <span className="platinum-gradient-text font-light">Horological Devotion</span>
            </h2>
            
            <p className="text-sm sm:text-base text-gray-300 leading-relaxed mt-6 font-normal">
              For over a century, our family-owned watchmaking house has pioneered the art of chronometer timekeeping. Passed down through generations, our methods preserve the sanctity of hand-finishing, utilizing tools and techniques refined over one hundred and fifty years.
            </p>
            
            <p className="text-sm sm:text-base text-gray-400 leading-relaxed mt-4 font-normal">
              Every ticking escapement tells a story of stubborn devotion to quality. We seek not to chase fleeting trends, but to engineer perpetual statements of excellence that are handed down as heirlooms.
            </p>

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center text-black">
                  <Check size={12} strokeWidth={3} />
                </div>
                <span className="text-xs text-gray-200">100% In-House Manufacture</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center text-black">
                  <Check size={12} strokeWidth={3} />
                </div>
                <span className="text-xs text-gray-200">Certified Official Testing</span>
              </div>
            </div>
          </div>

          {/* Right Image (Master Watchmaker Photo) */}
          <div className="lg:col-span-6">
            <div className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden bg-[#0E1015] border border-white/15 shadow-2xl group">
              <img
                src={atelierMasterCraftsman}
                alt="Master Swiss watchmaker assembling a tourbillon movement"
                className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 p-5 bg-black/60 backdrop-blur-md rounded-2xl border border-white/10">
                <p className="text-xs text-gray-200 italic leading-relaxed">
                  "A watch from our atelier is not merely an instrument of measurement; it is an intimate reflection of the artisan who shaped it."
                </p>
                <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-2 font-bold">
                  — Master Horologist, Chronos Manufacture
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
