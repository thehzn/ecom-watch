import React from 'react';
import manufactureHeroMovement from '../../assets/manufacture_hero_movement.jpg';

export default function HeroSection() {
  return (
    <section className="w-full relative overflow-hidden bg-gradient-to-b from-[#0B0D12] via-[#08090C] to-[#0B0D12] border-b border-white/10 py-16 sm:py-24 px-6 sm:px-12" aria-label="Manufacture Hero Banner">
      
      {/* Radial Titanium Ambient Light */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] sm:w-[1000px] h-[700px] sm:h-[1000px] bg-[radial-gradient(circle,_rgba(255,255,255,0.08)_0%,_rgba(8,9,12,0)_70%)] pointer-events-none animate-stealth-pulse" />

      {/* Sweeping Light Reflection Glint */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="w-[35%] h-full bg-gradient-to-r from-transparent via-white/10 to-transparent blur-2xl animate-titanium-sweep" />
      </div>

      <div className="relative max-w-[1600px] mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center z-10">
        
        {/* Left Headline & Manifesto */}
        <div className="lg:col-span-6 flex flex-col items-center lg:items-start text-center lg:text-left">
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-md mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
            <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-gray-200">
              The Manufacture • Geneva Atelier
            </span>
          </div>

          <h1 className="text-4xl sm:text-6xl xl:text-7xl font-bold leading-[1.05] tracking-tight text-white">
            THE PURSUIT OF <br />
            <span className="platinum-gradient-text font-light">PERPETUAL ART</span>
          </h1>

          <p className="mt-6 text-sm sm:text-base text-gray-300 leading-relaxed max-w-lg font-normal">
            Deep within the Vallée de Joux, our independent master watchmakers hand-craft mechanical calibers to the thousandth of a millimeter, uniting ancestral finishing with modern aerospace metallurgy.
          </p>

          <div className="mt-10 grid grid-cols-3 gap-6 pt-8 border-t border-white/10 w-full max-w-md text-left">
            <div>
              <p className="text-xl sm:text-2xl font-bold text-white">1924</p>
              <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-0.5">Established</p>
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-bold text-white">100%</p>
              <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-0.5">Hand-Finished</p>
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-bold text-white">Geneva</p>
              <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-0.5">Manufacture</p>
            </div>
          </div>

        </div>

        {/* Right 8K Tourbillon Movement Photo */}
        <div className="lg:col-span-6 relative flex items-center justify-center">
          <div className="relative w-full aspect-[16/10] max-w-xl rounded-3xl overflow-hidden bg-[#0E1015] border border-white/20 shadow-2xl group">
            
            <img
              src={manufactureHeroMovement}
              alt="Haute Horlogerie Handcrafted Movement"
              className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
              loading="eager"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

            <div className="absolute bottom-5 left-6 right-6 flex items-center justify-between">
              <span className="bg-black/70 backdrop-blur-md px-3.5 py-1.5 rounded-lg border border-white/15 text-[10px] uppercase tracking-widest text-white font-bold">
                Calibre 9820 Flying Tourbillon
              </span>
              <span className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">
                In-House Atelier
              </span>
            </div>

          </div>
        </div>

      </div>

    </section>
  );
}
