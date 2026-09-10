// import React from 'react';
// import ContactHero from '../components/contact/ContactHero';
// import InquiryForm from '../components/contact/InquiryForm';
// import ContactInformation from '../components/contact/ContactInformation';

// export default function Contact() {
//   return (
//     <div className="w-full bg-[#F9F9F9] min-h-screen">
//       <main className="max-w-[1280px] mx-auto px-6 md:px-16 lg:px-24 py-12 md:py-20 select-text">
//         <ContactHero />

//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-16 lg:gap-[96px] mt-12 items-start">
//           <div className="w-full">
//             <InquiryForm />
//           </div>

//           <div className="w-full">
//             <ContactInformation />
//           </div>
//         </div>
//       </main>
//     </div>
//   );
// }
import React from 'react';
import ContactHero from '../components/contact/ContactHero';
import InquiryForm from '../components/contact/InquiryForm';
import ContactInformation from '../components/contact/ContactInformation';

export default function Contact() {
  return (
    <div className="w-full bg-[#08090C] text-white min-h-screen font-['Plus_Jakarta_Sans'] selection:bg-white selection:text-black relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-[radial-gradient(circle,_rgba(255,255,255,0.05)_0%,_transparent_70%)] pointer-events-none" />

      <main className="max-w-[1280px] mx-auto px-6 md:px-16 lg:px-24 py-12 md:py-20 select-text relative">
        <ContactHero />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-16 lg:gap-[96px] mt-12 items-start">
          <div className="w-full">
            <InquiryForm />
          </div>

          <div className="w-full">
            <ContactInformation />
          </div>
        </div>
      </main>
    </div>
  );
}