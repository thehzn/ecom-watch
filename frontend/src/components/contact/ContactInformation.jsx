import React from 'react';
import ContactCard from './ContactCard';

export default function ContactInformation() {
  const contacts = [
    {
      icon: 'mail',
      title: 'Email',
      info: 'concierge@chronos.com'
    },
    {
      icon: 'location_on',
      title: 'Atelier',
      info: 'Chronos Atelier, Ernakulam, Kerala, India'
    },
    {
      icon: 'call',
      title: 'Phone',
      info: '+91 00000 00000'
    },
    {
      icon: 'schedule',
      title: 'Working Hours',
      info: 'Monday – Saturday, 10:00 AM – 6:00 PM'
    }
  ];

  return (
    <section className="w-full" aria-labelledby="contact-info-title">
      <h2
        id="contact-info-title"
        className="font-caslon text-2xl font-normal text-black mb-6">
        Contact Information
      </h2>

      <div className="flex flex-col space-y-4">
        {contacts.map((contact, index) => (
          <ContactCard
            key={index}
            icon={contact.icon}
            title={contact.title}
            info={contact.info}
          />
        ))}
      </div>
    </section>
  );
}
