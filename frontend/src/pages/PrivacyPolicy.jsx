// import React from 'react';
// import PrivacyHero from '../components/privacy/PrivacyHero';
// import PrivacyPolicySection from '../components/privacy/PrivacyPolicySection';
// import TermsOfService from '../components/privacy/TermsOfService';
// import CookiePolicy from '../components/privacy/CookiePolicy';
// import HeritageTrust from '../components/privacy/HeritageTrust';

// export default function PrivacyPolicy() {
//   return (
//     <div className="w-full bg-white min-h-screen">
//       <main className="max-w-[896px] mx-auto px-6 py-12 md:py-20 select-text">
//         <PrivacyHero />
//         <div className="mt-8 flex flex-col space-y-6">
//           <PrivacyPolicySection />
//           <TermsOfService />
//           <CookiePolicy />
//           <HeritageTrust />
//         </div>
//       </main>
//     </div>
//   );
// }
import React from 'react';
import PrivacyHero from '../components/privacy/PrivacyHero';
import PrivacyPolicySection from '../components/privacy/PrivacyPolicySection';
import TermsOfService from '../components/privacy/TermsOfService';
import CookiePolicy from '../components/privacy/CookiePolicy';
import HeritageTrust from '../components/privacy/HeritageTrust';

export default function PrivacyPolicy() {
  return (
    <div className="w-full bg-[#08090C] text-white min-h-screen font-['Plus_Jakarta_Sans'] selection:bg-white selection:text-black relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-[radial-gradient(circle,_rgba(255,255,255,0.05)_0%,_transparent_70%)] pointer-events-none" />

      <main className="max-w-[896px] mx-auto px-6 py-12 md:py-20 select-text relative">
        <PrivacyHero />
        <div className="mt-8 flex flex-col space-y-6">
          <PrivacyPolicySection />
          <TermsOfService />
          <CookiePolicy />
          <HeritageTrust />
        </div>
      </main>
    </div>
  );
}