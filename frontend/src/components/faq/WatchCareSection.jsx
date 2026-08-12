import React from 'react';
import FAQItem from './FAQItem';

export default function WatchCareSection({ id, items }) {
  if (!items || items.length === 0) return null;

  return (
    <section id={id} className="w-full bg-[#F9F9F9] py-10 md:py-16 scroll-mt-24" aria-labelledby={`${id}-title`}>
      <div className="max-w-[800px] mx-auto px-6 md:px-8">
        <h2
          id={`${id}-title`}
          className="font-caslon text-2xl font-normal text-black border-b border-[#C4C7C7] pb-4 mb-8"
        >
          Watch Care
        </h2>

        {/* Info Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          {/* Card 1: Water Resistance */}
          <div className="bg-[#F3F3F4] p-8 flex flex-col items-start border border-[#C4C7C7]/40">
            <span className="material-symbols-outlined text-black text-2xl mb-4 select-none" aria-hidden="true">
              water_drop
            </span>
            <h3 className="font-caslon text-lg font-normal text-black mb-3">Water Resistance</h3>
            <p className="font-inter text-sm leading-6 text-[#5D5E63]">
              Water resistance is not permanent and varies by watch model. Please refer to your model's guidelines and verify that the crown is fully pushed in before any water contact.
            </p>
          </div>

          {/* Card 2: Servicing */}
          <div className="bg-[#F3F3F4] p-8 flex flex-col items-start border border-[#C4C7C7]/40">
            <span className="material-symbols-outlined text-black text-2xl mb-4 select-none" aria-hidden="true">
              build
            </span>
            <h3 className="font-caslon text-lg font-normal text-black mb-3">Servicing</h3>
            <p className="font-inter text-sm leading-6 text-[#5D5E63]">
              Scheduled professional servicing helps preserve the movement's integrity and long-term functional beauty. We suggest a periodic review every three to five years.
            </p>
          </div>
        </div>

        {/* Watch Care FAQs */}
        <div className="flex flex-col">
          {items.map((item, index) => (
            <FAQItem
              key={`${id}-item-${index}`}
              question={item.question}
              answer={item.answer}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
