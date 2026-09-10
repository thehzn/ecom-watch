// import React, { useState, useId } from 'react';

// export default function FAQItem({ question, answer }) {
//   const [isOpen, setIsOpen] = useState(false);
//   const contentId = useId();

//   return (
//     <div className="border-b border-[#C4C7C7] py-6">
//       <button
//         onClick={() => setIsOpen(!isOpen)}
//         aria-expanded={isOpen}
//         aria-controls={contentId}
//         className="flex w-full cursor-pointer items-center justify-between text-left focus:outline-none"
//       >
//         <span className="font-inter text-base md:text-lg font-normal text-black pr-4">
//           {question}
//         </span>
//         <span
//           className={`material-symbols-outlined text-[#5D5E63] transform transition-transform duration-300 select-none ${
//             isOpen ? 'rotate-180' : ''
//           }`}
//           aria-hidden="true"
//         >
//           keyboard_arrow_down
//         </span>
//       </button>
//       <div
//         id={contentId}
//         className={`transition-all duration-300 ease-in-out ${
//           isOpen ? 'mt-4 max-h-[500px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
//         }`}
//       >
//         <p className="font-inter text-[#5D5E63] text-sm md:text-base leading-6 md:leading-7">
//           {answer}
//         </p>
//       </div>
//     </div>
//   );
// }
import React, { useState, useId } from 'react';
import { ChevronDown } from 'lucide-react';

export default function FAQItem({ question, answer }) {
  const [isOpen, setIsOpen] = useState(false);
  const contentId = useId();

  return (
    <div className="border-b border-white/10 py-6">
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-controls={contentId}
        className="flex w-full cursor-pointer items-center justify-between text-left focus:outline-none"
      >
        <span className="text-base md:text-lg font-normal text-white pr-4">
          {question}
        </span>
        <ChevronDown
          size={20}
          className={`text-gray-400 shrink-0 transform transition-transform duration-300 ${
            isOpen ? 'rotate-180' : ''
          }`}
          aria-hidden="true"
        />
      </button>
      <div
        id={contentId}
        className={`transition-all duration-300 ease-in-out ${
          isOpen ? 'mt-4 max-h-[500px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
        }`}
      >
        <p className="text-gray-400 text-sm md:text-base leading-6 md:leading-7">
          {answer}
        </p>
      </div>
    </div>
  );
}