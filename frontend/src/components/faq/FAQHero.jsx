import React from 'react';
import FAQSearch from './FAQSearch';

export default function FAQHero({ searchText, setSearchText }) {
  return (
    <section className="w-full bg-[#F9F9F9] py-16 px-5 flex justify-center text-center" aria-label="FAQ Support Search">
      <div className="w-full max-w-[1280px]">
        <h1 className="font-caslon text-3xl md:text-[40px] font-normal text-black leading-tight mb-4">
          How can we assist you?
        </h1>
        <p className="font-inter text-base md:text-lg font-normal leading-7 md:leading-[28px] text-[#5D5E63] max-w-2xl mx-auto">
          Find answers to common questions about orders, care, returns, warranty, and our services.
        </p>
        <FAQSearch searchText={searchText} setSearchText={setSearchText} />
      </div>
    </section>
  );
}
