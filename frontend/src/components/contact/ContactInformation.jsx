
import React from 'react';
import { Mail, MapPin, Phone, Clock } from 'lucide-react';
import ContactCard from './ContactCard';

export default function ContactInformation() {
  const contacts = [
    {
      icon: Mail,
      title: 'Email',
      info: 'concierge@chronos.com'
    },
    {
      icon: MapPin,
      title: 'Atelier',
      info: 'Chronos Atelier, Ernakulam, Kerala, India'
    },
    {
      icon: Phone,
      title: 'Phone',
      info: '+91 95737 74527'
    },
    {
      icon: Clock,
      title: 'Working Hours',
      info: 'Monday – Saturday, 10:00 AM – 6:00 PM'
    }
  ];

  return (
    <section className="w-full" aria-labelledby="contact-info-title">
      <h2
        id="contact-info-title"
        className="text-2xl font-bold text-white mb-6"
      >
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