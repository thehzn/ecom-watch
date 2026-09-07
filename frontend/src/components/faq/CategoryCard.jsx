// import React from 'react';

// export default function CategoryCard({ icon, title, targetId }) {
//   const handleClick = (e) => {
//     e.preventDefault();
//     const el = document.getElementById(targetId);
//     if (el) {
//       el.scrollIntoView({ behavior: 'smooth' });
//     }
//   };

//   return (
//     <button
//       onClick={handleClick}
//       className="flex flex-col items-center justify-center bg-[#F3F3F4] border border-[#C4C7C7] p-6 text-center cursor-pointer transition-all duration-300 hover:opacity-85 hover:-translate-y-[1px] focus:outline-none focus:ring-1 focus:ring-[#000000] w-full min-h-[140px]"
//     >
//       <span className="material-symbols-outlined text-black text-3xl mb-3 select-none" aria-hidden="true">
//         {icon}
//       </span>
//       <span className="font-inter text-xs font-medium uppercase tracking-[0.10em] text-black">
//         {title}
//       </span>
//     </button>
//   );
// }
import React from 'react';

export default function CategoryCard({ icon: Icon, title, targetId }) {
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
      className="flex flex-col items-center justify-center bg-[#0E1015] border border-white/10 rounded-2xl p-6 text-center cursor-pointer transition-all duration-300 hover:border-white/30 hover:-translate-y-[2px] focus:outline-none focus:ring-1 focus:ring-white/40 w-full min-h-[140px]"
    >
      <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center mb-3">
        <Icon size={18} strokeWidth={1.75} className="text-white" aria-hidden="true" />
      </div>
      <span className="text-xs font-semibold uppercase tracking-[0.10em] text-white">
        {title}
      </span>
    </button>
  );
}