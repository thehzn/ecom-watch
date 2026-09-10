// import React from 'react';

// export default function PrivacyHero() {
//   return (
//     <section className="max-w-4xl mx-auto bg-white px-5 py-16 text-center select-text" aria-labelledby="privacy-hero-title">
//       <h1
//         id="privacy-hero-title"
//         className="font-caslon text-3xl md:text-[40px] font-normal text-black mb-4 leading-tight"
//       >
//         Privacy & Data Protection
//       </h1>
//       <p className="font-inter text-base md:text-[18px] font-normal leading-[28px] text-[#444748] max-w-[672px] mx-auto">
//         At Chronos, we hold your trust in the highest regard. Our privacy framework is built to safeguard your personal information and ensure a secure, transparent digital experience.
//       </p>
//     </section>
//   );
// }
import React from 'react';
import { ShieldCheck } from 'lucide-react';

export default function PrivacyHero() {
  return (
    <section className="max-w-4xl mx-auto px-5 py-16 text-center select-text" aria-labelledby="privacy-hero-title">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-[10px] font-bold uppercase tracking-[0.25em] text-gray-300 mb-4">
        <ShieldCheck size={12} />
        Trust & Security
      </div>
      <h1
        id="privacy-hero-title"
        className="text-3xl md:text-[40px] font-bold text-white mb-4 leading-tight"
      >
        Privacy & Data Protection
      </h1>
      <p className="text-base md:text-[18px] font-normal leading-[28px] text-gray-400 max-w-[672px] mx-auto">
        At Chronos, we hold your trust in the highest regard. Our privacy framework is built to safeguard your personal information and ensure a secure, transparent digital experience.
      </p>
    </section>
  );
}