import React from 'react';
import InformationCard from './InformationCard';

export default function PrivacyPolicySection() {
  const cards = [
    {
      icon: 'devices',
      title: 'Device Information',
      text: 'Technical information such as browser, device type, IP-related information, and interaction data may be collected to improve website functionality and security.'
    },
    {
      icon: 'shopping_bag',
      title: 'Order Information',
      text: 'Information related to purchases, shipping, billing, and order history may be collected to process and manage orders.'
    },
    {
      icon: 'person',
      title: 'Account Information',
      text: 'Account details such as name and email may be collected when users create an account.'
    },
    {
      icon: 'mail',
      title: 'Communication Information',
      text: 'Information provided when contacting customer support or concierge services may be collected.'
    }
  ];

  return (
    <section className="w-full py-6 select-text" aria-labelledby="privacy-policy-section-title">
      {/* Policy Heading */}
      <h2
        id="privacy-policy-section-title"
        className="font-caslon text-2xl font-normal text-black mb-6"
      >
        Privacy Policy
      </h2>

      {/* Supporting Paragraph */}
      <p className="font-inter text-base font-normal leading-6 text-[#444748]">
        We believe that transparency is the foundation of any luxury service. This section details how we gather, manage, and process your personal credentials when visiting our online space or purchasing our timepieces.
      </p>

      {/* Subsection Heading */}
      <h3 className="font-inter text-[12px] font-semibold tracking-[0.1em] uppercase text-black mt-[32px] mb-4">
        Personal Information We Collect
      </h3>

      {/* Information Cards Responsive Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mt-4">
        {cards.map((card, index) => (
          <InformationCard
            key={index}
            icon={card.icon}
            title={card.title}
            text={card.text}
          />
        ))}
      </div>
    </section>
  );
}
