import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

// Import distinct high-quality watch images for each collection
import classicWatch from '../assets/classic-watch.jpg';
import sportWatch from '../assets/sport-watch.jpg';
import heritageWatch from '../assets/heritage-watch.jpg';
import limitedWatch from '../assets/limited-watch.jpg';

const collections = [
  {
    label: 'Since 1965',
    title: 'Classic Collection',
    cta: 'Explore Classic',
    to: '/categories?category=Luxury%20Watch',
    filter: 'none',
    image: classicWatch,
  },
  {
    label: 'Precision Engineered',
    title: 'Sport Collection',
    cta: 'Explore Sport',
    to: '/categories?category=Contemporary',
    filter: 'grayscale(0.4)',
    image: sportWatch,
  },
  {
    label: 'Timeless Craft',
    title: 'Heritage Collection',
    cta: 'Explore Heritage',
    to: '/categories?category=Heritage',
    filter: 'sepia(0.25)',
    image: heritageWatch,
  },
  {
    label: 'Only 100 Made',
    title: 'Limited Edition',
    cta: 'Explore Limited Edition',
    to: '/categories?category=Complications',
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
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '12px',
            fontWeight: 600,
          }}
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

        <div
          className="mt-6 h-px w-12"
          style={{ backgroundColor: '#C4C7C7' }}
        />
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

export default function Home() {
  return (
    <>
      <Hero />
      <CategoryGrid />
    </>
  );
}