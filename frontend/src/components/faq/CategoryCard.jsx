import React from 'react';

export default function CategoryCard({ icon, title, targetId }) {
  const handleClick = (e) => {
    e.preventDefault();
    const el = document.getElementById(targetId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <button
      onClick={handleClick}
      className="flex flex-col items-center justify-center bg-[#F3F3F4] border border-[#C4C7C7] p-6 text-center cursor-pointer transition-all duration-300 hover:opacity-85 hover:-translate-y-[1px] focus:outline-none focus:ring-1 focus:ring-[#000000] w-full min-h-[140px]"
    >
      <span className="material-symbols-outlined text-black text-3xl mb-3 select-none" aria-hidden="true">
        {icon}
      </span>
      <span className="font-inter text-xs font-medium uppercase tracking-[0.10em] text-black">
        {title}
      </span>
    </button>
  );
}
