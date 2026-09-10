// import React from 'react';

// export default function InformationCard({ icon, title, text }) {
//   return (
//     <div className="bg-white border border-[#C4C7C7] p-8 flex flex-col items-start rounded-[2px]">
//       {/* Icon */}
//       <span
//         className="material-symbols-outlined text-[24px] text-black mb-4 select-none"
//         aria-hidden="true"
//       >
//         {icon}
//       </span>

//       {/* Title */}
//       <h3 className="font-inter text-base font-semibold text-black mb-2">
//         {title}
//       </h3>

//       {/* Text */}
//       <p className="font-inter text-[12px] font-normal leading-relaxed text-[#444748]">
//         {text}
//       </p>
//     </div>
//   );
// }
import React from 'react';

export default function InformationCard({ icon: Icon, title, text }) {
  return (
    <div className="bg-[#0E1015] border border-white/10 rounded-2xl p-8 flex flex-col items-start">
      {/* Icon */}
      <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center mb-4">
        <Icon size={18} strokeWidth={1.75} className="text-white" aria-hidden="true" />
      </div>

      {/* Title */}
      <h3 className="text-base font-semibold text-white mb-2">
        {title}
      </h3>

      {/* Text */}
      <p className="text-[12px] font-normal leading-relaxed text-gray-400">
        {text}
      </p>
    </div>
  );
}