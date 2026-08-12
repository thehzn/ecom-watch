import React from 'react';

export default function TermsOfService() {
  const terms = [
    "Users are responsible for providing accurate account and order information.",
    "Products and services are subject to availability.",
    "Users must not misuse or interfere with the website.",
    "Orders may be cancelled or modified when necessary.",
    "Website content and brand materials remain the property of Chronos."
  ];

  return (
    <section className="w-full mt-[48px] select-text" aria-labelledby="terms-section-title">
      <h2
        id="terms-section-title"
        className="font-caslon text-2xl font-normal text-black mb-4">
        Terms of Service
      </h2>

      <p className="font-inter text-base font-normal leading-6 text-[#444748]">
        By interacting with our platform, you acknowledge and agree to comply with our Terms of Service. These rules are instituted to maintain the integrity of our watchmaking services, reservation lines, and guest portals.
      </p>

      <ul className="list-disc pl-5 font-inter text-base font-normal text-[#444748] mt-6 space-y-[16px]">
        {terms.map((term, index) => (
          <li key={index} className="leading-relaxed">
            {term}
          </li>
        ))}
      </ul>
    </section>
  );
}
