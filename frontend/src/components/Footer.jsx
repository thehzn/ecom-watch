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
              {status === 'loading'
                ? 'Joining Circle...'
                : 'Request Private Access'}

              {status !== 'loading' && <ArrowRight size={15} />}
            </button>
          </div>

          {status === 'error' && (
            <p className="mt-4 text-xs text-red-400">
              {errorMessage}
            </p>
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

              <Link
                to="/categories?category=Luxury#luxury"
                className="text-xs text-gray-400 hover:text-white transition-colors"
              >
                Luxury
              </Link>

              <Link
                to="/categories?category=Heritage#heritage"
                className="text-xs text-gray-400 hover:text-white transition-colors"
              >
                Heritage
              </Link>

              <Link
                to="/categories?category=Sport#sport"
                className="text-xs text-gray-400 hover:text-white transition-colors"
              >
                Sport
              </Link>

              <Link
                to="/categories?category=Contemporary#contemporary"
                className="text-xs text-gray-400 hover:text-white transition-colors"
              >
                Contemporary
              </Link>
            </div>

            {/* Haute Services */}
            <div className="flex flex-col gap-3">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-white">
                Concierge
              </span>

              <Link
                to="/about"
                state={{ scrollTo: 'certificate' }}
                className="text-xs text-gray-400 hover:text-white transition-colors"
              >
                Certificate of Authenticity
              </Link>

              <Link
                to="/faq"
                state={{ scrollTo: 'restoration' }}
                className="text-xs text-gray-400 hover:text-white transition-colors"
              >
                Restoration & Care
              </Link>
            </div>

            {/* Maison */}
            <div className="flex flex-col gap-3">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-white">
                Maison
              </span>

              <Link
                to="/about"
                state={{ scrollTo: 'manufacture' }}
                className="text-xs text-gray-400 hover:text-white transition-colors"
              >
                The Manufacture
              </Link>

              <Link
                to="/privacy-policy"
                state={{ scrollTo: 'privacy' }}
                className="text-xs text-gray-400 hover:text-white transition-colors"
              >
                Privacy Policy
              </Link>

              <Link
                to="/faq"
                state={{ scrollTo: 'faq' }}
                className="text-xs text-gray-400 hover:text-white transition-colors"
              >
                Client FAQ
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