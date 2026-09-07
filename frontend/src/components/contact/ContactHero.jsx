// import React from 'react';

// export default function ContactHero() {
//   return (
//     <section className="w-full text-center py-8 md:py-12" aria-labelledby="contact-hero-title">
//       <div className="max-w-[672px] mx-auto px-4">
//         <h1
//           id="contact-hero-title"
//           className="font-caslon text-3xl md:text-[40px] font-normal text-black mb-2 leading-tight">
//           Inquiry & Concierge
//         </h1>
//         <p className="font-inter text-base md:text-[18px] font-normal text-[#5D5E63] leading-relaxed">
//           Connect with our concierge team for personalized assistance, product inquiries, and guidance.
//         </p>
//       </div>
//     </section>
//   );
// }
import React from 'react';
import { Sparkles } from 'lucide-react';

export default function ContactHero() {
  return (
    <section className="w-full text-center py-8 md:py-12" aria-labelledby="contact-hero-title">
      <div className="max-w-[672px] mx-auto px-4 flex flex-col items-center">
        {/* <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-[10px] font-bold uppercase tracking-[0.25em] text-gray-300 mb-4">
          <Sparkles size={12} />
          Concierge & Salon
        </div> */}
        <h1
          id="contact-hero-title"
          className="text-3xl md:text-[40px] font-bold text-white mb-2 leading-tight tracking-tight"
        >
          Inquiry & Concierge
        </h1>
        <p className="text-base md:text-[18px] font-normal text-gray-400 leading-relaxed">
          Connect with our concierge team for personalized assistance, product inquiries, and guidance.
        </p>
      </div>
    </section>
  );
}