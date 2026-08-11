import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

// Import distinct high-quality watch images for each collection
import classicWatch from '../assets/classic-watch.jpg';
import sportWatch from '../assets/sport-watch.jpg';
import heritageWatch from '../assets/heritage-watch.jpg';
import limitedWatch from '../assets/limited-watch.jpg';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const collections = [
  {
    label: 'Since 1965',
    title: 'Classic Collection',
    cta: 'Explore Classic',
    to: '/collections/classic',
    filter: 'none',
    image: classicWatch,
  },
  {
    label: 'Precision Engineered',
    title: 'Sport Collection',
    cta: 'Explore Sport',
    to: '/collections/sport',
    filter: 'grayscale(0.4)',
    image: sportWatch,
  },
  {
    label: 'Timeless Craft',
    title: 'Heritage Collection',
    cta: 'Explore Heritage',
    to: '/collections/heritage',
    filter: 'sepia(0.25)',
    image: heritageWatch,
  },
  {
    label: 'Only 100 Made',
    title: 'Limited Edition',
    cta: 'Explore Limited Edition',
    to: '/collections/limited-edition',
    filter: 'grayscale(0.7) contrast(1.1)',
    image: limitedWatch,
  },
];

function CollectionCard({ label, title, cta, to, filter, image }) {
  return (
    <Link
      to={to}
      className="group relative block h-[600px] cursor-pointer overflow-hidden md:h-[750px]"
    >
      <img
        src={image}
        alt={title}
        className="h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105"
        style={{ filter }}
      />
      <div className="absolute inset-0 bg-black/20 transition-opacity duration-500 group-hover:bg-black/35" />

      <div className="absolute bottom-0 left-0 p-12">
        <span
          className="block uppercase"
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '12px',
            fontWeight: 600,
            letterSpacing: '0.1em',
            color: 'rgba(255,255,255,0.8)',
          }}
        >
          {label}
        </span>
        <h3
          className="mt-2 text-white"
          style={{
            fontFamily: "'Libre Caslon Text', serif",
            fontSize: '32px',
            fontWeight: 400,
            lineHeight: '40px',
          }}
        >
          {title}
        </h3>
        <span
          className="mt-4 inline-flex items-center gap-2 uppercase text-white"
          style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', fontWeight: 600 }}
        >
          <span className="border-b border-transparent transition-colors duration-300 group-hover:border-white">
            {cta}
          </span>
          <ArrowRight
            size={16}
            className="transition-transform duration-300 group-hover:translate-x-1"
          />
        </span>
      </div>
    </Link>
  );
}

function Hero() {
  return (
    <section className="w-full bg-white px-5 py-16">
      <div className="mx-auto flex max-w-[1536px] flex-col items-center text-center">
        <span
          className="uppercase"
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '12px',
            fontWeight: 600,
            letterSpacing: '0.3em',
            color: '#5D5E63',
          }}
        >
          Our Collections
        </span>
        <h1
          className="mt-4 text-black"
          style={{
            fontFamily: "'Libre Caslon Text', serif",
            fontSize: '40px',
            fontWeight: 400,
            lineHeight: '48px',
          }}
        >
          Crafted For Every Moment
        </h1>
        <div className="mt-6 h-px w-12" style={{ backgroundColor: '#C4C7C7' }} />
      </div>
    </section>
  );
}

function CategoryGrid() {
  return (
    <section className="w-full bg-white px-5 py-16 md:px-[120px] md:py-16">
      <div className="mx-auto grid max-w-[1536px] grid-cols-1 gap-8 md:grid-cols-2">
        {collections.map((c) => (
          <CollectionCard key={c.title} {...c} />
        ))}
      </div>
    </section>
  );
}

function Newsletter() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [status, setStatus] = useState('idle'); // idle | submitting | success

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !EMAIL_REGEX.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setStatus('submitting');
    try {
      const res = await fetch('http://localhost:3000/apiauth/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error((data && data.message) || 'Something went wrong');
      }
      setStatus('success');
      setEmail('');
    } catch (err) {
      setError(err.message || 'Unable to subscribe right now');
      setStatus('idle');
    }
  };

  return (
    <section
      className="w-full border-t px-5 py-16"
      style={{ backgroundColor: '#F3F3F4', borderColor: '#E2E2E2' }}
    >
      <div className="mx-auto max-w-[576px] text-center">
        <h2
          className="mb-4 text-black"
          style={{
            fontFamily: "'Libre Caslon Text', serif",
            fontSize: '24px',
            fontWeight: 400,
            lineHeight: '32px',
          }}
        >
          Join the Inner Circle
        </h2>
        <p
          className="mb-8"
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '16px',
            lineHeight: '24px',
            color: '#5D5E63',
          }}
        >
          Receive early access to limited releases and bespoke events.
        </p>

        {status === 'success' ? (
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#000000' }}>
            You're on the list. Welcome to the Maison.
          </p>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="text-left">
            <div className="relative flex items-center border-b" style={{ borderColor: '#000000' }}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ENTER YOUR EMAIL"
                className="w-full bg-transparent uppercase text-black outline-none placeholder:text-[#747878]"
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '12px',
                  fontWeight: 600,
                  letterSpacing: '0.1em',
                  padding: '12px 0px',
                }}
              />
              <button
                type="submit"
                disabled={status === 'submitting'}
                aria-label="Subscribe"
                className="text-black transition-opacity hover:opacity-60 disabled:opacity-40"
              >
                <ArrowRight size={24} />
              </button>
            </div>
            {error && (
              <p
                className="mt-2"
                style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#DC2626' }}
              >
                {error}
              </p>
            )}
          </form>
        )}
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <>
      <Hero />
      <CategoryGrid />
      <Newsletter />
    </>
  );
}