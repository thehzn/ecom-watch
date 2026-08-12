import React from 'react';
import PrivacyHero from '../components/privacy/PrivacyHero';
import PrivacyPolicySection from '../components/privacy/PrivacyPolicySection';
import TermsOfService from '../components/privacy/TermsOfService';
import CookiePolicy from '../components/privacy/CookiePolicy';
import HeritageTrust from '../components/privacy/HeritageTrust';

export default function PrivacyPolicy() {
  return (
    <div className="w-full bg-white min-h-screen">
      <main className="max-w-[896px] mx-auto px-6 py-12 md:py-20 select-text">
        <PrivacyHero />
        <div className="mt-8 flex flex-col space-y-6">
          <PrivacyPolicySection />
          <TermsOfService />
          <CookiePolicy />
          <HeritageTrust />
        </div>
      </main>
    </div>
  );
}
