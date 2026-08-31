import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function CTASection() {
  return (
    <section className="w-full bg-[#0B0D12] py-20 sm:py-28 px-6 sm:px-12" aria-labelledby="cta-title">
      <div className="max-w-3xl mx-auto text-center flex flex-col items-center">
        
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-md mb-6">
          <Sparkles size={13} className="text-white" />
          <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-gray-300">
            Private Salon & Atelier
          </span>
        </div>

        <h2
          id="cta-title"
          className="text-3xl sm:text-5xl font-bold text-white tracking-tight leading-tight">
          Begin Your Horology Journey
        </h2>
        
        <p className="text-sm sm:text-base text-gray-300 mt-4 max-w-xl font-normal leading-relaxed">
          Discover the timepiece that aligns with your story. Speak with our horological experts, explore complications in person, or schedule a private showing of our heritage collection.
        </p>

        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-10 w-full sm:w-auto">
          <Link
            to="/shop"
            className="w-full sm:w-auto inline-flex justify-center items-center gap-3 bg-white hover:bg-gray-200 text-black rounded-full py-4 px-9 text-xs font-bold uppercase tracking-[0.18em] transition-all duration-300 shadow-xl"
          >
            <span>Explore Collections</span>
            <ArrowRight size={15} />
          </Link>

          <Link
            to="/contact"
            className="w-full sm:w-auto inline-flex justify-center items-center bg-transparent border border-white/30 hover:border-white text-white rounded-full py-4 px-8 text-xs font-semibold uppercase tracking-[0.18em] hover:bg-white/10 transition-all duration-300"
          >
            Schedule Private Appointment
          </Link>
        </div>

      </div>
    </section>
  );
}
