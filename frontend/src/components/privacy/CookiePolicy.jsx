import React from 'react';

export default function CookiePolicy() {
  const handlePreferencesClick = () => {
    console.log("Cookie Preferences panel opened. Trigger local cookie state settings.");
    alert("Cookie settings panel is ready and marked for integration.");
  };

  return (
    <section
      className="w-full bg-[#F3F3F4] border border-[#C4C7C7] p-8 md:p-10 mt-10 rounded-[2px] select-text"
      aria-labelledby="cookie-section-title">
      <h2
        id="cookie-section-title"
        className="font-caslon text-2xl font-normal text-black mb-4">
        Cookie Policy
      </h2>

      <p className="font-inter text-base font-normal leading-6 text-[#444748]">
        We use cookies and similar technologies to remember your preferences, understand how you interact with our website, optimize page loading performance, and deliver a seamless personal browsing experience.
      </p>

      <button
        onClick={handlePreferencesClick}
        className="mt-6 bg-black text-white hover:opacity-90 px-10 py-4 font-inter text-[12px] font-semibold uppercase tracking-wider transition-opacity duration-300 cursor-pointer block" >
        Cookie Preferences
      </button>
    </section>
  );
}
