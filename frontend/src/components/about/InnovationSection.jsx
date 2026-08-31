import React from 'react';
import { ShieldCheck, Compass, Award } from 'lucide-react';

export default function InnovationSection() {
  const pillars = [
    {
      icon: Award,
      title: "Patented Escapements",
      desc: "Paramagnetic silicon balance wheels impervious to magnetic fields and temperature shifts."
    },
    {
      icon: Compass,
      title: "Material Science",
      desc: "Forged aerospace Grade 5 titanium, proprietary platinum alloys, and scratchproof Cerachrom bezels."
    },
    {
      icon: ShieldCheck,
      title: "Hermetic Architecture",
      desc: "Patented Triplock screw-down winding crowns sealed against hydrostatic depth of 300 meters."
    }
  ];

  return (
    <section className="w-full bg-[#08090C] py-20 sm:py-28 px-6 sm:px-12 border-b border-white/10" aria-labelledby="innovation-title">
      <div className="max-w-[1600px] mx-auto text-center flex flex-col items-center">

        <span className="text-xs font-bold uppercase tracking-[0.25em] text-gray-400 mb-3">
          Mechanical Horizons
        </span>

        <h2
          id="innovation-title"
          className="text-3xl sm:text-5xl font-bold text-white tracking-tight leading-tight">
          Innovation as Heritage
        </h2>

        <p className="text-sm sm:text-base text-gray-300 leading-relaxed mt-4 max-w-2xl font-normal">
          While we respect century-old traditions, we never stand still. Our Geneva research laboratory continuously explores new frontiers of metallurgy and micro-mechanics.
        </p>

        {/* 3 Technical Innovation Pillar Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mt-14 w-full text-left">
          {pillars.map((p, idx) => {
            const Icon = p.icon;
            return (
              <div
                key={idx}
                className="bg-[#0E1015] border border-white/10 hover:border-white/40 p-8 rounded-3xl transition-all duration-300 flex flex-col justify-between shadow-xl"
              >
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-white mb-6">
                    <Icon size={22} />
                  </div>
                  <h3 className="text-lg font-bold text-white">{p.title}</h3>
                  <p className="text-xs sm:text-sm text-gray-400 leading-relaxed mt-2 font-normal">
                    {p.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
