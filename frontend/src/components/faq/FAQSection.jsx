import React from 'react';
import FAQItem from './FAQItem';

export default function FAQSection({ title, id, items }) {
  if (!items || items.length === 0) return null;

  return (
    <section id={id} className="w-full bg-[#F9F9F9] py-10 md:py-16 scroll-mt-24" aria-labelledby={`${id}-title`}>
      <div className="max-w-[800px] mx-auto px-6 md:px-8">
        <h2
          id={`${id}-title`}
          className="font-caslon text-2xl font-normal text-black border-b border-[#C4C7C7] pb-4 mb-8"
        >
          {title}
        </h2>
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
