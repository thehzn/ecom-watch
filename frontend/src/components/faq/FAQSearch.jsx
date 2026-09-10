// import React from 'react';

// export default function FAQSearch({ searchText, setSearchText }) {
//   return (
//     <div className="mx-auto mt-8 w-full max-w-[672px]">
//       <div className="relative flex items-center border-b border-[#C4C7C7] px-4 py-4 bg-transparent focus-within:border-black transition-colors duration-200">
//         <span className="material-symbols-outlined text-[#5D5E63] mr-3 select-none" aria-hidden="true">
//           search
//         </span>
//         <input
//           type="text"
//           placeholder="Search frequently asked questions"
//           value={searchText}
//           onChange={(e) => setSearchText(e.target.value)}
//           className="w-full bg-transparent font-inter text-base text-[#5D5E63] outline-none placeholder:text-[#9A9C9C]"
//           aria-label="Search frequently asked questions"
//         />
//       </div>
//     </div>
//   );
// }
import React from 'react';
import { Search } from 'lucide-react';

export default function FAQSearch({ searchText, setSearchText }) {
  return (
    <div className="mx-auto mt-8 w-full max-w-[672px]">
      <div className="relative flex items-center rounded-full bg-[#141720] border border-white/15 focus-within:border-white px-5 py-4 transition-colors duration-200">
        <Search size={18} className="text-gray-400 mr-3 shrink-0" aria-hidden="true" />
        <input
          type="text"
          placeholder="Search frequently asked questions"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="w-full bg-transparent text-base text-white outline-none placeholder:text-gray-600"
          aria-label="Search frequently asked questions"
        />
      </div>
    </div>
  );
}