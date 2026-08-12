import React, { useState } from 'react';
import FAQHero from '../components/faq/FAQHero';
import CategoryCards from '../components/faq/CategoryCards';
import FAQSection from '../components/faq/FAQSection';
import WatchCareSection from '../components/faq/WatchCareSection';
import FAQContactSection from '../components/faq/FAQContactSection';

const faqData = [
  {
    category: 'Orders & Shipping',
    question: 'How can I track my order?',
    answer: 'Once your order has been shipped, you will receive tracking information so you can follow its delivery status.',
  },
  {
    category: 'Orders & Shipping',
    question: 'How long does delivery take?',
    answer: 'Delivery times depend on the destination and selected shipping method. Estimated delivery information is provided during checkout.',
  },
  {
    category: 'Returns & Exchanges',
    question: 'What is your return policy?',
    answer: 'Eligible products may be returned according to the applicable return conditions. Please contact our concierge team for assistance with your return.',
  },
  {
    category: 'Watch Care',
    question: 'How should I care for my watch?',
    answer: 'Keep the watch clean and dry, avoid unnecessary exposure to extreme conditions, and follow the recommended servicing guidance for your model.',
  },
  {
    category: 'Watch Care',
    question: 'What does the warranty cover for my timepiece?',
    answer: 'Our timepieces are backed by a comprehensive warranty coverage against manufacturing and movement defects. Normal wear and tear, lens scratches, or damage from accidents are not covered.',
  },
];

export default function FAQ() {
  const [searchText, setSearchText] = useState('');

  // case-insensitive real-time search check
  const filteredFaqs = faqData.filter((item) => {
    const query = searchText.trim().toLowerCase();
    if (!query) return true;
    return (
      item.question.toLowerCase().includes(query) ||
      item.answer.toLowerCase().includes(query) ||
      item.category.toLowerCase().includes(query)
    );
  });

  const ordersShippingItems = filteredFaqs.filter(
    (item) => item.category === 'Orders & Shipping'
  );
  const returnsExchangesItems = filteredFaqs.filter(
    (item) => item.category === 'Returns & Exchanges'
  );
  const watchCareItems = filteredFaqs.filter(
    (item) => item.category === 'Watch Care'
  );

  return (
    <article className="w-full bg-[#F9F9F9] min-h-screen flex flex-col select-text">
      {/* 1. HERO SECTION */}
      <FAQHero searchText={searchText} setSearchText={setSearchText} />

      {/* 2. CATEGORY CARDS */}
      <CategoryCards />

      {/* FAQS SECTIONS RENDERING */}
      {filteredFaqs.length === 0 ? (
        <section className="py-20 text-center w-full max-w-[800px] mx-auto px-6" aria-label="No Search Results">
          <span
            className="material-symbols-outlined text-[48px] text-[#C4C7C7] mb-4 select-none"
            aria-hidden="true"
          >
            search_off
          </span>
          <h2 className="font-caslon text-xl text-black font-normal mb-2">No FAQs Found</h2>
          <p className="font-inter text-sm text-[#5D5E63]">
            We couldn't find any results matching "{searchText}". Please try another search term or inspect different categories.
          </p>
        </section>
      ) : (
        <>
          {/* 3. ORDERS & SHIPPING SECTION (FAQSection 1) */}
          <FAQSection
            title="Orders & Shipping"
            id="orders-shipping"
            items={ordersShippingItems}
          />

          {/* 4. RETURNS & EXCHANGES SECTION (FAQSection 2) */}
          <FAQSection
            title="Returns & Exchange"
            id="returns-exchanges"
            items={returnsExchangesItems}
          />

          {/* 5. WATCH CARE SECTION */}
          <WatchCareSection id="watch-care" items={watchCareItems} />
        </>
      )}

      {/* 6. CONTACT SECTION */}
      <FAQContactSection />
    </article>
  );
}
