import React from 'react';

export default function FAQSearch({ searchText, setSearchText }) {
  return (
    <div className="mx-auto mt-8 w-full max-w-[672px]">
      <div className="relative flex items-center border-b border-[#C4C7C7] px-4 py-4 bg-transparent focus-within:border-black transition-colors duration-200">
        <span className="material-symbols-outlined text-[#5D5E63] mr-3 select-none" aria-hidden="true">
          search
        </span>
        <input
          type="text"
          placeholder="Search frequently asked questions"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="w-full bg-transparent font-inter text-base text-[#5D5E63] outline-none placeholder:text-[#9A9C9C]"
          aria-label="Search frequently asked questions"
        />
      </div>
    </div>
  );
}
