import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function CTASection() {
  const navigate = useNavigate();

  const handleAtelierClick = (e) => {
    e.preventDefault();
    console.log("Visit an Atelier clicked. Navigation handler is ready and marked for future integration.");
  };

  return (
    <section className="w-full bg-white py-20 px-6" aria-labelledby="cta-title">
      <div className="max-w-[700px] mx-auto text-center flex flex-col items-center">
        <h2
          id="cta-title"
          className="font-caslon text-4xl md:text-[40px] font-normal text-black leading-tight">
          Begin Your Journey
        </h2>
        <p className="font-inter text-base font-normal leading-[28px] text-[#5D5E63] mt-4 max-w-xl">
          Discover the watch that aligns with your story. Speak with our horological experts, explore our complications in person, or schedule a private showing of our heritage collection.
        </p>
        <div className="flex flex-col sm:flex-row justify-center items-stretch sm:items-center gap-4 mt-10 w-full sm:w-auto">
          <Link
            to="/shop"
            className="inline-flex justify-center items-center bg-black text-white border-none rounded-[4px] py-4 px-8 font-inter text-sm font-semibold tracking-wider hover:bg-neutral-800 transition duration-300"
          >
            Explore Collections
          </Link>

          <button
            onClick={handleAtelierClick}
            className="inline-flex justify-center items-center bg-white text-black border border-black rounded-[4px] py-4 px-8 font-inter text-sm font-semibold tracking-wider hover:bg-neutral-50 transition duration-300 cursor-pointer">
            Visit an Atelier
          </button>
        </div>

      </div>
    </section>
  );
}
