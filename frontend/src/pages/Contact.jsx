import React from 'react';
import ContactHero from '../components/contact/ContactHero';
import InquiryForm from '../components/contact/InquiryForm';
import ContactInformation from '../components/contact/ContactInformation';

export default function Contact() {
  return (
    <div className="w-full bg-[#F9F9F9] min-h-screen">
      <main className="max-w-[1280px] mx-auto px-6 md:px-16 lg:px-24 py-12 md:py-20 select-text">
        <ContactHero />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-16 lg:gap-[96px] mt-12 items-start">
          <div className="w-full">
            <InquiryForm />
          </div>

          <div className="w-full">
            <ContactInformation />
          </div>
        </div>
      </main>
    </div>
  );
}
