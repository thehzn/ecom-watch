import React from 'react';

export default function ContactCard({ icon, title, info }) {
  return (
    <div className="bg-white border border-[#E2E2E2] p-6 flex items-start space-x-4 rounded-[2px]">
      <div className="flex-shrink-0 text-black leading-none">
        <span className="material-symbols-outlined text-[24px] select-none" aria-hidden="true">
          {icon}
        </span>
      </div>

      <div className="flex-col">
        <h3 className="font-inter text-[12px] font-semibold uppercase tracking-wider text-black leading-none">
          {title}
        </h3>
        <p className="font-inter text-[12px] font-normal leading-relaxed text-[#5D5E63] mt-2">
          {info}
        </p>
      </div>
    </div>
  );
}
