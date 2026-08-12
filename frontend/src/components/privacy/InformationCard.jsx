import React from 'react';

export default function InformationCard({ icon, title, text }) {
  return (
    <div className="bg-white border border-[#C4C7C7] p-8 flex flex-col items-start rounded-[2px]">
      {/* Icon */}
      <span
        className="material-symbols-outlined text-[24px] text-black mb-4 select-none"
        aria-hidden="true"
      >
        {icon}
      </span>

      {/* Title */}
      <h3 className="font-inter text-base font-semibold text-black mb-2">
        {title}
      </h3>

      {/* Text */}
      <p className="font-inter text-[12px] font-normal leading-relaxed text-[#444748]">
        {text}
      </p>
    </div>
  );
}
