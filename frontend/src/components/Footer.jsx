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
import { ArrowRight } from 'lucide-react';
import { useApi } from '../hooks/useApi';

const FOOTER_LINK_CLASS =
  "font-['Inter'] text-[10px] font-medium text-[#5D5E63] underline transition-colors duration-200 hover:text-black";

const COLUMN_TITLE_CLASS =
  "font-['Inter'] text-xs font-semibold uppercase tracking-[0.10em] text-black";

export default function Footer() {
  const { post } = useApi();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);

  const [status, setStatus] = useState('idle'); // idle | loading | success | error | already
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
      // Backend returns "You are already subscribed" as a 400 — treat that
      // as its own state so it doesn't read like a failure.
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
      {/* Newsletter Section */}
      <section className="w-full border-t border-[#C4C7C7]/10 bg-[#F3F3F4] py-10 sm:py-14 md:py-16">
        <div className="mx-auto w-full max-w-xl px-5 text-center">
          <h3 className="mb-3 sm:mb-4 font-['Libre_Caslon_Text'] text-xl sm:text-2xl font-normal leading-7 sm:leading-8 text-black">
            Join the inner circle
          </h3>
          <p className="mb-6 sm:mb-8 font-['Inter'] text-sm sm:text-base font-normal leading-6 text-[#5D5E63]">
            Receive early access to limited releases and bespoke events.
          </p>

          <button
            type="button"
            onClick={handleSubscribe}
            disabled={status === 'loading'}
            className="mx-auto flex w-full sm:w-auto items-center justify-center gap-2 bg-black px-8 py-3.5 font-['Inter'] text-xs font-semibold uppercase tracking-[0.10em] text-white transition-colors duration-200 hover:bg-[#2F3131] disabled:opacity-50"
          >
            {status === 'loading' ? 'Subscribing…' : 'Subscribe Now'}
            {status !== 'loading' && <ArrowRight size={16} />}
          </button>

          {status === 'error' && (
            <p className="mt-4 font-['Inter'] text-xs text-[#A32D2D]">
              {errorMessage}
            </p>
          )}

          {status === 'already' && (
            <p className="mt-4 font-['Inter'] text-xs text-[#5D5E63]">
              You're already subscribed — welcome back.
            </p>
          )}
        </div>

        {status === 'success' && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-5"
            onClick={() => setStatus('idle')}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm bg-white px-6 sm:px-8 py-8 sm:py-10 text-center"
            >
              <span className="font-['Inter'] text-[10px] font-semibold uppercase tracking-[0.20em] text-[#5D5E63]">
                Welcome
              </span>
              <h4 className="mt-3 font-['Libre_Caslon_Text'] text-xl sm:text-2xl font-normal text-black">
                You are one of us now
              </h4>
              <p className="mt-3 font-['Inter'] text-sm leading-6 text-[#5D5E63]">
                First word on limited releases and private events.
              </p>
              <button
                onClick={() => setStatus('idle')}
                className="mt-6 sm:mt-8 w-full bg-black py-3 font-['Inter'] text-xs font-semibold uppercase tracking-[0.10em] text-white transition-colors duration-200 hover:bg-[#2F3131]"
              >
                Continue
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Footer Section */}
      <footer className="w-full border-t border-[#C4C7C7]/20 bg-[#F3F3F4] py-10 sm:py-14 md:py-16">
        <div className="mx-auto grid max-w-screen-2xl grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-2 sm:gap-x-8 lg:grid-cols-4 px-5">
          {/* Brand Information */}
          <div className="col-span-2 flex flex-col gap-4 sm:gap-6 lg:col-span-1">
            <div className="font-['Libre_Caslon_Text'] text-xl sm:text-2xl font-normal leading-7 sm:leading-8 text-black">
              CHRONOS
            </div>
            <p className="max-w-[320px] font-['Inter'] text-sm sm:text-base font-normal leading-6 text-[#5D5E63]">
              Precision timepieces, crafted to be worn for generations.
            </p>
          </div>

          {/* Explore */}
          <div className="flex flex-col gap-3 sm:gap-4">
            <span className={COLUMN_TITLE_CLASS}>Explore</span>
            <Link to="/shop" className={FOOTER_LINK_CLASS}>
              Collections
            </Link>
            <Link to="/about" className={FOOTER_LINK_CLASS}>
              About Us
            </Link>
          </div>

          {/* Assistance */}
          <div className="flex flex-col gap-3 sm:gap-4">
            <span className={COLUMN_TITLE_CLASS}>Assistance</span>
            <Link to="/contact" className={FOOTER_LINK_CLASS}>
              Contact Us
            </Link>
            <Link to="/faq" className={FOOTER_LINK_CLASS}>
              FAQ
            </Link>
          </div>

          {/* Legal */}
          <div className="flex flex-col gap-3 sm:gap-4">
            <span className={COLUMN_TITLE_CLASS}>Legal</span>
            <Link to="/privacy-policy" className={FOOTER_LINK_CLASS}>
              Privacy Policy
            </Link>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="mx-auto mt-10 sm:mt-14 md:mt-16 flex max-w-screen-2xl items-center justify-center border-t border-[#C4C7C7]/10 px-5 pt-6 sm:pt-8">
          <p className="text-center font-['Inter'] text-[10px] font-medium leading-[14px] text-[#5D5E63]">
            © 2026 CHRONOS. All Rights Reserved.
          </p>
        </div>
      </footer>
    </>
  );
}