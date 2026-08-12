import React from 'react';

export default function HeritageTrust() {
  const trustIcons = ['verified_user', 'security', 'lock'];

  return (
    <section
      className="w-full border-t border-[#C4C7C7] mt-16 pt-16 select-text"
      aria-labelledby="trust-section-title">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        <div>
          <h2
            id="trust-section-title"
            className="font-caslon text-2xl font-normal text-black mb-2">
            Heritage & Trust
          </h2>
          <p className="font-inter text-base font-normal leading-6 text-[#5D5E63]">
            Since our inception, client confidentiality has remained as vital as the accuracy of our movements. We carry this devotion to trust into our online space, ensuring your digital footfalls are protected with standard-setting security frameworks.
          </p>
        </div>

        <div className="flex items-center gap-4 justify-start lg:justify-end">
          {trustIcons.map((icon, index) => (
            <div
              key={index}
              className="w-16 h-16 border border-[#C4C7C7] flex items-center justify-center rounded-[2px]"
              aria-label={`Security Badge: ${icon}`}>
              <span className="material-symbols-outlined text-[28px] text-[#5D5E63] select-none" aria-hidden="true">
                {icon}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
