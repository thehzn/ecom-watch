// import { useState } from 'react';
// import { Link } from 'react-router-dom';
// import { ArrowRight } from 'lucide-react';
// import { useApi } from '../hooks/useApi';

// const FOOTER_LINK_CLASS =
//   "font-['Inter'] text-[10px] font-medium text-[#5D5E63] underline transition-colors duration-200 hover:text-black";

// const COLUMN_TITLE_CLASS =
//   "font-['Inter'] text-xs font-semibold uppercase tracking-[0.10em] text-black";

// export default function Footer() {
//   const { post } = useApi();
//   const [email, setEmail] = useState('');
//   const [status, setStatus] = useState('idle'); // idle | loading | success | error

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!email.trim()) return;
//     setStatus('loading');
//     try {
//       await post('/newsletter/subscribe', { email: email.trim() });
//       setStatus('success');
//       setEmail('');
//     } catch (err) {
//       setStatus('error');
//     }
//   };

//   return (
//     <>
//       {/* Newsletter Section */}
//       <section className="w-full border-t border-[#C4C7C7]/10 bg-[#F3F3F4] py-16">
//         <div className="mx-auto w-full max-w-xl px-5 text-center">
//           <h3 className="mb-4 font-['Libre_Caslon_Text'] text-2xl font-normal leading-8 text-black">
//             Join the inner circle
//           </h3>
//           <p className="mb-8 font-['Inter'] text-base font-normal leading-6 text-[#5D5E63]">
//             Receive early access to limited releases and bespoke events.
//           </p>

//           <form
//             onSubmit={handleSubmit}
//             className="flex w-full items-center border-b border-black pb-2"
//           >
//             <input
//               type="email"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               placeholder="ENTER YOUR EMAIL"
//               required
//               className="w-full bg-transparent font-['Inter'] text-xs font-semibold uppercase tracking-[0.10em] text-black outline-none placeholder:text-[#C4C7C7]"
//             />
//             <button
//               type="submit"
//               aria-label="Subscribe"
//               disabled={status === 'loading'}
//               className="ml-4 flex cursor-pointer items-center justify-center bg-transparent disabled:opacity-50"
//             >
//               <ArrowRight size={24} className="text-black" />
//             </button>
//           </form>

//           {status === 'error' && (
//             <p className="mt-4 font-['Inter'] text-xs text-[#A32D2D]">
//               Couldn't subscribe. Try again.
//             </p>
//           )}
//         </div>

//         {status === 'success' && (
//           <div
//             className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-5"
//             onClick={() => setStatus('idle')}
//           >
//             <div
//               onClick={(e) => e.stopPropagation()}
//               className="w-full max-w-sm bg-white px-8 py-10 text-center"
//             >
//               <span className="font-['Inter'] text-[10px] font-semibold uppercase tracking-[0.20em] text-[#5D5E63]">
//                 Welcome
//               </span>
//               <h4 className="mt-3 font-['Libre_Caslon_Text'] text-2xl font-normal text-black">
//                 You are one of us now
//               </h4>
//               <p className="mt-3 font-['Inter'] text-sm leading-6 text-[#5D5E63]">
//                 First word on limited releases and private events.
//               </p>
//               <button
//                 onClick={() => setStatus('idle')}
//                 className="mt-8 w-full bg-black py-3 font-['Inter'] text-xs font-semibold uppercase tracking-[0.10em] text-white transition-colors duration-200 hover:bg-[#2F3131]"
//               >
//                 Continue
//               </button>
//             </div>
//           </div>
//         )}
//       </section>

//       {/* Footer Section */}
//       <footer className="w-full border-t border-[#C4C7C7]/20 bg-[#F3F3F4] py-16">
//         <div className="mx-auto grid max-w-screen-2xl grid-cols-1 gap-8 px-5 lg:grid-cols-4">
//           {/* Brand Information */}
//           <div className="flex flex-col gap-6">
//             <div className="font-['Libre_Caslon_Text'] text-2xl font-normal leading-8 text-black">
//               CHRONOS
//             </div>
//             <p className="max-w-[320px] font-['Inter'] text-base font-normal leading-6 text-[#5D5E63]">
//               Precision timepieces, crafted to be worn for generations.
//             </p>
//           </div>
                  
//           {/* Explore */}
//           <div className="flex flex-col gap-4">
//             <span className={COLUMN_TITLE_CLASS}>Explore</span>
//             <Link to="/shop" className={FOOTER_LINK_CLASS}>
//               Collections
//             </Link>
//             <Link to="/about" className={FOOTER_LINK_CLASS}>
//               About Us
//             </Link>
//           </div>

//           {/* Assistance */}
//           <div className="flex flex-col gap-4">
//             <span className={COLUMN_TITLE_CLASS}>Assistance</span>
//             <Link to="/contact" className={FOOTER_LINK_CLASS}>
//               Contact Us
//             </Link>
//             <Link to="/faq" className={FOOTER_LINK_CLASS}>
//               FAQ
//             </Link>
//           </div>

//           {/* Legal */}
//           <div className="flex flex-col gap-4">
//             <span className={COLUMN_TITLE_CLASS}>Legal</span>
//             <Link to="/privacy-policy" className={FOOTER_LINK_CLASS}>
//               Privacy Policy
//             </Link>
//           </div>
//         </div>

//         {/* Bottom Footer */}
//         <div className="mx-auto mt-16 flex max-w-screen-2xl items-center justify-center border-t border-[#C4C7C7]/10 px-5 pt-8">
//           <p className="font-['Inter'] text-[10px] font-medium leading-[14px] text-[#5D5E63]">
//             © 2026 CHRONOS. All Rights Reserved.
//           </p>
//         </div>
//       </footer>
//     </>
//   );
// }

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ArrowRight, ShieldCheck, Award, Clock, Sparkles } from 'lucide-react';
import { useApi } from '../hooks/useApi';

export default function Footer() {
  const { post } = useApi();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);

  const [status, setStatus] = useState('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubscribe = async () => {
    if (!user) {
      navigate('/login', { state: { from: '/' } });
      return;
    }
    setStatus('loading');
    setErrorMessage('');
    try {
      await post('/newsletter/subscribe', { email: user.email });
      setStatus('success');
    } catch (err) {
      if ((err.message || '').toLowerCase().includes('already subscribed')) {
        setStatus('already');
      } else {
        setErrorMessage(err.message || "Couldn't subscribe. Try again.");
        setStatus('error');
      }
    }
  };

  return (
    <>
      {/* Stealth Titanium VIP Membership Strip */}
      <section className="w-full relative overflow-hidden bg-gradient-to-b from-[#08090C] to-[#0E1015] border-t border-white/10 py-16 sm:py-20">
        <div className="relative mx-auto w-full max-w-2xl px-5 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/20 bg-white/5 text-white text-[10px] tracking-[0.25em] uppercase mb-4">
            <Sparkles size={12} />
            Privé Membership
          </div>
          
          <h3 className="mb-4 text-2xl sm:text-4xl font-bold text-white leading-tight">
            Join the Chronos Private Circle
          </h3>
          
          <p className="mb-8 text-sm sm:text-base text-gray-400 leading-relaxed max-w-lg mx-auto font-normal">
            Receive confidential invitations to limited titanium editions and private atelier viewings.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
            <button
              type="button"
              onClick={handleSubscribe}
              disabled={status === 'loading'}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-white hover:bg-gray-200 text-black text-xs font-bold uppercase tracking-[0.18em] px-8 py-3.5 rounded-full transition-all disabled:opacity-50 shadow-lg"
            >
              {status === 'loading' ? 'Joining Circle...' : 'Request Private Access'}
              {status !== 'loading' && <ArrowRight size={15} />}
            </button>
          </div>

          {status === 'error' && (
            <p className="mt-4 text-xs text-red-400">{errorMessage}</p>
          )}

          {status === 'already' && (
            <p className="mt-4 text-xs text-gray-300">
              You are already an esteemed member of our private circle.
            </p>
          )}
        </div>

        {/* Modal Confirmation */}
        {status === 'success' && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md px-5"
            onClick={() => setStatus('idle')}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-[#101318] border border-white/20 p-8 sm:p-10 text-center rounded-2xl shadow-2xl"
            >
              <div className="w-12 h-12 rounded-full border border-white flex items-center justify-center mx-auto mb-4 text-white">
                <Sparkles size={20} />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-gray-300">
                Privilege Confirmed
              </span>
              <h4 className="mt-3 text-2xl font-bold text-white">
                Welcome to the Circle
              </h4>
              <p className="mt-3 text-sm leading-relaxed text-gray-400">
                You will receive confidential access to limited production runs and master horology events.
              </p>
              <button
                onClick={() => setStatus('idle')}
                className="mt-6 w-full bg-white text-black py-3 text-xs font-bold uppercase tracking-[0.15em] rounded-lg hover:bg-gray-200 transition-colors"
              >
                Proceed
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Main Luxury Footer */}
      <footer className="w-full bg-[#050608] border-t border-white/10 pt-16 pb-12">
        <div className="max-w-[1600px] mx-auto px-6 sm:px-10">
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 pb-16 border-b border-white/10">
            
            {/* Brand Manifesto */}
            <div className="lg:col-span-2 flex flex-col gap-3">
              <span className="text-2xl sm:text-3xl font-bold tracking-[0.2em] text-white">
                CHRONOS
              </span>
              <p className="text-[10px] uppercase tracking-[0.3em] text-gray-400 font-semibold">
                Geneva • Le Brassus • Zurich
              </p>
              <p className="max-w-sm text-sm text-gray-400 leading-relaxed mt-2 font-normal">
                Pioneering mechanical excellence in aerospace titanium and platinum. Every timepiece is hand-assembled to endure generations.
              </p>
            </div>

            {/* Collections */}
            <div className="flex flex-col gap-3">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-white">
                Collections
              </span>
              <Link to="/categories" className="text-xs text-gray-400 hover:text-white transition-colors">
                Grand Complications
              </Link>
              <Link to="/categories" className="text-xs text-gray-400 hover:text-white transition-colors">
                Heritage Classic
              </Link>
              <Link to="/categories" className="text-xs text-gray-400 hover:text-white transition-colors">
                Contemporary Sport
              </Link>
              <Link to="/categories" className="text-xs text-gray-400 hover:text-white transition-colors">
                Limited Editions (1/50)
              </Link>
            </div>

            {/* Haute Services */}
            <div className="flex flex-col gap-3">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-white">
                Concierge
              </span>
              <Link to="/contact" className="text-xs text-gray-400 hover:text-white transition-colors">
                Private Appointment
              </Link>
              <Link to="/faq" className="text-xs text-gray-400 hover:text-white transition-colors">
                Restoration & Care
              </Link>
              <Link to="/about" className="text-xs text-gray-400 hover:text-white transition-colors">
                Certificate of Authenticity
              </Link>
              <Link to="/contact" className="text-xs text-gray-400 hover:text-white transition-colors">
                Bespoke Commission
              </Link>
            </div>

            {/* Legal */}
            <div className="flex flex-col gap-3">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-white">
                Maison
              </span>
              <Link to="/about" className="text-xs text-gray-400 hover:text-white transition-colors">
                About the Manufacture
              </Link>
              <Link to="/privacy-policy" className="text-xs text-gray-400 hover:text-white transition-colors">
                Privacy & Confidentiality
              </Link>
              <Link to="/faq" className="text-xs text-gray-400 hover:text-white transition-colors">
                Client Terms
              </Link>
            </div>
          </div>

          {/* Bottom Trust & Copyright */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <p className="text-[11px] text-gray-500 tracking-wider">
              © 2026 CHRONOS HAUTE HORLOGERIE. ALL RIGHTS RESERVED.
            </p>
            <div className="flex items-center gap-6 text-[10px] uppercase tracking-[0.2em] text-gray-400">
              <span>Swiss Certified</span>
              <span>•</span>
              <span>100% Handcrafted</span>
              <span>•</span>
              <span>5-Year Warranty</span>
            </div>
          </div>

        </div>
      </footer>
    </>
  );
}