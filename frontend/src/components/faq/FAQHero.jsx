// import React from 'react';
// import FAQSearch from './FAQSearch';

// export default function FAQHero({ searchText, setSearchText }) {
//   return (
//     <section className="w-full bg-[#F9F9F9] py-16 px-5 flex justify-center text-center" aria-label="FAQ Support Search">
//       <div className="w-full max-w-[1280px]">
//         <h1 className="font-caslon text-3xl md:text-[40px] font-normal text-black leading-tight mb-4">
//           How can we assist you?
//         </h1>
//         <p className="font-inter text-base md:text-lg font-normal leading-7 md:leading-[28px] text-[#5D5E63] max-w-2xl mx-auto">
//           Find answers to common questions about orders, care, returns, warranty, and our services.
//         </p>
//         <FAQSearch searchText={searchText} setSearchText={setSearchText} />
//       </div>
//     </section>
//   );
// }
import React from 'react';
import { Sparkles } from 'lucide-react';
import FAQSearch from './FAQSearch';

export default function FAQHero({ searchText, setSearchText }) {
  return (
    <section className="w-full py-16 px-5 flex justify-center text-center relative" aria-label="FAQ Support Search">
      <div className="w-full max-w-[1280px] flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-[10px] font-bold uppercase tracking-[0.25em] text-gray-300 mb-4">
          <Sparkles size={12} />
          Client Support
        </div>
        <h1 className="text-3xl md:text-[40px] font-bold text-white leading-tight mb-4 tracking-tight">
          How can we assist you?
        </h1>
        <p className="text-base md:text-lg font-normal leading-7 md:leading-[28px] text-gray-400 max-w-2xl mx-auto">
          Find answers to common questions about orders, care, returns, warranty, and our services.
        </p>
        <FAQSearch searchText={searchText} setSearchText={setSearchText} />
      </div>
    </section>
  );
}
