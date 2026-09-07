// import React from 'react';
// import { useNavigate } from 'react-router-dom';
// import classicWatch from '../../assets/classic-watch.jpg';

// export default function FAQContactSection() {
//   const navigate = useNavigate();

//   return (
//     <section className="w-full bg-white py-16 md:py-24 px-5" aria-labelledby="contact-section-title">
//       <div className="max-w-[1280px] mx-auto">
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-[64px] items-center">
//           {/* Left Column: Text & CTA */}
//           <div className="flex flex-col items-start pr-0 lg:pr-8">
//             <h2
//               id="contact-section-title"
//               className="font-caslon text-3xl md:text-[32px] font-normal text-black mb-4 leading-tight"
//             >
//               Still have questions?
//             </h2>
//             <p className="font-inter text-base md:text-lg font-normal leading-7 md:leading-[28px] text-[#5D5E63] mb-8">
//               Our concierge team is available to help with product questions, orders, servicing, and other enquiries.
//             </p>
//             <button
//               onClick={() => navigate('/contact')}
//               className="inline-block bg-black text-white py-4 px-12 font-inter text-[12px] font-semibold uppercase tracking-[0.15em] transition-opacity duration-200 hover:opacity-85 focus:outline-none focus:ring-1 focus:ring-black cursor-pointer text-center select-none"
//             >
//               Contact Us
//             </button>
//           </div>

//           {/* Right Column: Image */}
//           <div className="w-full h-full aspect-[4/3] overflow-hidden">
//             <img
//               src={classicWatch}
//               alt="Premium classic watch craftsmanship displaying details"
//               className="w-full h-full object-cover rounded-[2px]"
//             />
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// }
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import classicWatch from '../../assets/classic-watch.jpg';

export default function FAQContactSection() {
  const navigate = useNavigate();

  return (
    <section className="w-full py-16 md:py-24 px-5 relative" aria-labelledby="contact-section-title">
      <div className="max-w-[1280px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-[64px] items-center">
          {/* Left Column: Text & CTA */}
          <div className="flex flex-col items-start pr-0 lg:pr-8">
            <h2
              id="contact-section-title"
              className="text-3xl md:text-[32px] font-bold text-white mb-4 leading-tight"
            >
              Still have questions?
            </h2>
            <p className="text-base md:text-lg font-normal leading-7 md:leading-[28px] text-gray-400 mb-8">
              Our concierge team is available to help with product questions, orders, servicing, and other enquiries.
            </p>
            <button
              onClick={() => navigate('/contact')}
              className="inline-flex items-center gap-2 bg-white hover:bg-gray-200 text-black py-4 px-9 rounded-full text-xs font-bold uppercase tracking-[0.2em] shadow-lg transition-all hover:scale-[1.01] cursor-pointer select-none"
            >
              <span>Contact Us</span>
              <ArrowRight size={15} />
            </button>
          </div>

          {/* Right Column: Image */}
          <div className="w-full h-full aspect-[4/3] overflow-hidden rounded-2xl border border-white/10">
            <img
              src={classicWatch}
              alt="Premium classic watch craftsmanship displaying details"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}