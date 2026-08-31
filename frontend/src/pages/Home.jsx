import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  ArrowRight, 
  ShieldCheck, 
  Award, 
  Compass, 
  Heart, 
  Check, 
  ArrowUpRight,
  Sparkles,
  ChevronRight,
  Play
} from 'lucide-react';
import { useApi } from '../hooks/useApi';
import { addToWishlistLocal } from '../redux/wishlistSlice';

// Asset Imports
import classicWatch from '../assets/classic-watch.jpg';
import sportWatch from '../assets/sport-watch.jpg';
import heritageWatch from '../assets/heritage-watch.jpg';
import limitedWatch from '../assets/limited-watch.jpg';
import heroWatchImg from '../assets/luxury_watch_hero.png';

const COLLECTIONS = [
  {
    tag: 'TITANIUM & PLATINUM',
    title: 'Heritage Classic',
    desc: 'The purest architectural balance of Grade 5 titanium, sunray dials, and hand-beveled mechanics.',
    to: '/categories?category=Heritage',
    image: heritageWatch,
  },
  {
    tag: 'CHRONOGRAPH DYNAMICS',
    title: 'Cosmograph & Sport',
    desc: 'Forged carbon and ceramic tachymeter bezels built to endure high-performance motorsport and aviation.',
    to: '/categories?category=Contemporary',
    image: sportWatch,
  },
  {
    tag: 'GRAND COMPLICATIONS',
    title: 'Perpetual Tourbillon',
    desc: 'Multi-axis tourbillons, perpetual calendars, and mechanical storytelling at its most intricate.',
    to: '/categories?category=Complications',
    image: limitedWatch,
  },
  {
    tag: 'PRECIOUS METALS',
    title: '950 Platinum & Royal Steel',
    desc: 'Manufactured in solid platinum and brushed Oystersteel with diamond-polished hands.',
    to: '/categories?category=Luxury%20Watch',
    image: classicWatch,
  },
];

const FALLBACK_TRENDING = [
  {
    _id: 'stealth-1',
    modelName: 'Chronos Sub-Ocean Titanium 41mm',
    brand: 'Chronos',
    price: 15400,
    caseMaterial: 'Grade 5 Titanium & Ceramic',
    glassType: 'Anti-Reflective Sapphire',
    category: 'Contemporary',
    badge: 'New 2026 Model',
    mainImage: sportWatch,
  },
  {
    _id: 'stealth-2',
    modelName: 'Royal Skeleton Platinum 40',
    brand: 'Chronos',
    price: 43800,
    caseMaterial: '950 Solid Platinum',
    glassType: 'Double Domed Sapphire',
    category: 'Luxury Watch',
    badge: 'Masterpiece',
    mainImage: classicWatch,
  },
  {
    _id: 'stealth-3',
    modelName: 'Octo Heritage Monolith',
    brand: 'Chronos',
    price: 35200,
    caseMaterial: 'Brushed Oystersteel',
    glassType: 'Beveled Sapphire',
    category: 'Heritage',
    badge: 'Collector Choice',
    mainImage: heritageWatch,
  },
  {
    _id: 'stealth-4',
    modelName: 'Perpetual Celestial Tourbillon',
    brand: 'Chronos',
    price: 72000,
    caseMaterial: 'Titanium & White Gold',
    glassType: 'Curved Sapphire',
    category: 'Complications',
    badge: 'Limited 1/50',
    mainImage: limitedWatch,
  },
];

export default function Home() {
  const { get, post } = useApi();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [trendingProducts, setTrendingProducts] = useState([]);
  const [loadingTrending, setLoadingTrending] = useState(true);

  const wishlistItems = useSelector((state) => state.wishlist?.items || []);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const data = await get('/apiproduct/getallproducts');
        if (data?.products && data.products.length > 0) {
          setTrendingProducts(data.products.slice(0, 4));
        } else {
          setTrendingProducts(FALLBACK_TRENDING);
        }
      } catch {
        setTrendingProducts(FALLBACK_TRENDING);
      } finally {
        setLoadingTrending(false);
      }
    };
    fetchTrending();
  }, [get]);

  const handleWishlist = async (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await post(`/apiwishlist/addwishlist/${product._id}`);
    } catch {
      // ignore
    }
    dispatch(addToWishlistLocal(product));
  };

  return (
    <div className="min-h-screen bg-[#08090C] text-white selection:bg-white selection:text-black font-['Plus_Jakarta_Sans']">
      
      {/* ---------------- 1. CINEMATIC STEALTH TITANIUM HERO SECTION ---------------- */}
      <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden bg-gradient-to-b from-[#0B0D12] via-[#08090C] to-[#0B0D12] px-6 sm:px-12 py-16 border-b border-white/10">
        
        {/* Radial Titanium Spotlight */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] sm:w-[1000px] h-[700px] sm:h-[1000px] bg-[radial-gradient(circle,_rgba(255,255,255,0.07)_0%,_rgba(8,9,12,0)_70%)] pointer-events-none animate-stealth-pulse" />
        
        {/* Sweeping Light Reflection */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="w-[35%] h-full bg-gradient-to-r from-transparent via-white/10 to-transparent blur-2xl animate-titanium-sweep" />
        </div>

        <div className="relative max-w-[1600px] mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center z-10">
          
          {/* Left Text Column */}
          <div className="lg:col-span-6 flex flex-col items-center lg:items-start text-center lg:text-left">
            
            {/* Pill Tag */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-md mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
              <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-gray-200">
                Grade 5 Titanium • 2026 Collection
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-6xl xl:text-7xl font-bold leading-[1.05] tracking-tight text-white">
              ENGINEERED <br />
              <span className="platinum-gradient-text font-light">PERFECTION</span>
            </h1>

            {/* Description */}
            <p className="mt-6 text-sm sm:text-base text-gray-300 leading-relaxed max-w-lg font-normal">
              A benchmark of high-precision Swiss horology. Machined from solid aerospace titanium and platinum, crafted to outlast the generations that wear it.
            </p>

            {/* Action Buttons */}
            <div className="mt-10 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
              <Link
                to="/shop"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-white hover:bg-gray-200 text-black text-xs font-bold uppercase tracking-[0.2em] px-9 py-4 rounded-full transition-all duration-300 shadow-[0_0_30px_rgba(255,255,255,0.25)] hover:scale-105 group"
              >
                <span>Explore Timepieces</span>
                <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform text-black" />
              </Link>

              <Link
                to="/about"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 border border-white/25 hover:border-white text-white text-xs font-semibold uppercase tracking-[0.2em] px-8 py-4 rounded-full bg-white/5 backdrop-blur-md hover:bg-white/15 transition-all duration-300"
              >
                <span>The Manufacture</span>
              </Link>
            </div>

            {/* Technical Highlights Bar */}
            <div className="mt-12 pt-8 border-t border-white/10 grid grid-cols-3 gap-6 text-left w-full max-w-lg">
              <div>
                <p className="text-lg sm:text-xl font-bold text-white">72 H</p>
                <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-0.5">Power Reserve</p>
              </div>
              <div>
                <p className="text-lg sm:text-xl font-bold text-white">300 M</p>
                <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-0.5">Water Sealed</p>
              </div>
              <div>
                <p className="text-lg sm:text-xl font-bold text-white">CAL. 9820</p>
                <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-0.5">Manufacture Engine</p>
              </div>
            </div>

          </div>

          {/* Right Floating Timepiece Video Showcase */}
          <div className="lg:col-span-6 relative flex items-center justify-center">
            
            {/* Precision Rings */}
            <div className="absolute w-[360px] sm:w-[480px] h-[360px] sm:h-[480px] rounded-full border border-white/10 pointer-events-none" />
            <div className="absolute w-[300px] sm:w-[420px] h-[300px] sm:h-[420px] rounded-full border border-dashed border-white/20 pointer-events-none" />

            {/* Floating Watch */}
            <div className="relative z-10 animate-stealth-float">
              <img
                src={heroWatchImg}
                alt="Chronos Stealth Titanium Masterpiece"
                className="w-[300px] sm:w-[420px] xl:w-[480px] object-contain drop-shadow-[0_35px_60px_rgba(0,0,0,0.95)]"
              />
            </div>

            {/* Floating Titanium Spec Badges */}
            <div className="absolute left-0 sm:left-4 top-10 bg-[#0F1116]/90 backdrop-blur-xl border border-white/20 px-4 py-3 rounded-xl shadow-2xl z-20 hidden sm:block">
              <p className="text-[9px] uppercase tracking-widest text-gray-400 font-bold">CASE ALLOY</p>
              <p className="text-xs font-semibold text-white mt-0.5">Grade 5 Titanium & Platinum</p>
            </div>

            <div className="absolute right-0 sm:right-4 bottom-8 bg-[#0F1116]/90 backdrop-blur-xl border border-white/20 px-4 py-3 rounded-xl shadow-2xl z-20 hidden sm:block">
              <p className="text-[9px] uppercase tracking-widest text-gray-400 font-bold">ACCURACY</p>
              <p className="text-xs font-semibold text-white mt-0.5">-2/+2 sec/day Superlative</p>
            </div>

            {/* Simulation Tag */}
            <div className="absolute -bottom-6 sm:bottom-0 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/15 text-[10px] text-gray-300">
              <Play size={10} className="fill-white text-white" />
              <span>Cinematic 3D Simulation</span>
            </div>

          </div>

        </div>
      </section>

      {/* ---------------- 2. SUPERLATIVE STANDARDS STRIP ---------------- */}
      <section className="w-full bg-[#0C0E12] border-b border-white/10 py-8 px-6 sm:px-12">
        <div className="max-w-[1600px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center sm:text-left">
          
          <div className="flex flex-col sm:flex-row items-center gap-3.5">
            <div className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white shrink-0">
              <Award size={18} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-white">Superlative Chronometer</p>
              <p className="text-[11px] text-gray-400 mt-0.5">Official Geneva Testing</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3.5">
            <div className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white shrink-0">
              <ShieldCheck size={18} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-white">5-Year Guarantee</p>
              <p className="text-[11px] text-gray-400 mt-0.5">International Warranty</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3.5">
            <div className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white shrink-0">
              <Compass size={18} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-white">Hermetic Sealed</p>
              <p className="text-[11px] text-gray-400 mt-0.5">Triplock Crown Protection</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3.5">
            <div className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white shrink-0">
              <Sparkles size={18} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-white">Hand Assembled</p>
              <p className="text-[11px] text-gray-400 mt-0.5">Manufacture Standard</p>
            </div>
          </div>

        </div>
      </section>

      {/* ---------------- 3. FEATURED TIMEPIECES (TRENDING SECTION) ---------------- */}
      <section className="w-full py-20 sm:py-28 px-6 sm:px-12 max-w-[1600px] mx-auto">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-6">
          <div>
            <span className="text-gray-400 text-xs font-bold uppercase tracking-[0.25em] block mb-2">
              Featured Selection
            </span>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white">
              Trending Timepieces
            </h2>
          </div>

          <Link
            to="/shop"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-white hover:text-gray-300 transition-colors group"
          >
            <span>View All Configurations</span>
            <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Timepiece Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {trendingProducts.map((product) => {
            const isWishlisted = wishlistItems.some((w) => w._id === product._id);
            return (
              <div
                key={product._id}
                onClick={() => navigate(`/product/${product._id}`)}
                className="group relative bg-[#0E1015] border border-white/10 hover:border-white/40 rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 flex flex-col justify-between hover:shadow-[0_15px_35px_rgba(0,0,0,0.8),0_0_20px_rgba(255,255,255,0.06)]"
              >
                {/* Watch Showcase Image Box */}
                <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#141720] p-8 flex items-center justify-center">
                  <img
                    src={product.mainImage}
                    alt={product.modelName}
                    className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-108"
                  />

                  {/* Badge */}
                  <span className="absolute top-4 left-4 bg-black/80 backdrop-blur-md border border-white/20 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md">
                    {product.badge || 'New 2026'}
                  </span>

                  {/* Wishlist Button */}
                  <button
                    onClick={(e) => handleWishlist(e, product)}
                    aria-label="Save to Wishlist"
                    className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/70 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all"
                  >
                    <Heart size={15} className={isWishlisted ? 'fill-white text-white' : ''} />
                  </button>

                  {/* Configure Bar */}
                  <div className="absolute bottom-3 inset-x-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                    <span className="w-full block bg-white text-black text-[11px] font-bold uppercase tracking-wider py-2.5 rounded-lg text-center shadow-lg">
                      Configure Model
                    </span>
                  </div>
                </div>

                {/* Details */}
                <div className="p-5 flex flex-col gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
                    {product.category || 'Oyster Perpetual'}
                  </span>

                  <h3 className="text-lg font-bold text-white group-hover:text-gray-200 transition-colors line-clamp-1">
                    {product.modelName}
                  </h3>

                  <p className="text-xs text-gray-400 font-normal">
                    {product.caseMaterial || 'Titanium & Platinum'} · {product.glassType || 'Sapphire'}
                  </p>

                  <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between">
                    <span className="text-base font-bold text-white">
                      ${Number(product.price).toLocaleString()}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] uppercase tracking-wider text-gray-300 font-bold group-hover:text-white transition-colors">
                      Details <ArrowUpRight size={14} />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </section>

      {/* ---------------- 4. PILLAR COLLECTIONS ---------------- */}
      <section className="w-full py-20 bg-[#060709] border-t border-white/10">
        <div className="max-w-[1600px] mx-auto px-6 sm:px-12">
          
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-[0.3em] text-gray-400">
              The Configurations
            </span>
            <h2 className="mt-2 text-3xl sm:text-5xl font-bold text-white tracking-tight">
              Curated Collections
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {COLLECTIONS.map((c) => (
              <Link
                key={c.title}
                to={c.to}
                className="group relative block h-[460px] sm:h-[520px] rounded-2xl overflow-hidden border border-white/15 hover:border-white/50 transition-all duration-500 shadow-2xl"
              >
                <img
                  src={c.image}
                  alt={c.title}
                  className="h-full w-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent transition-opacity" />

                <div className="absolute bottom-0 left-0 right-0 p-8 sm:p-12 flex flex-col items-start text-white">
                  <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-gray-300">
                    {c.tag}
                  </span>

                  <h3 className="mt-1 text-2xl sm:text-3xl text-white font-bold group-hover:text-gray-200 transition-colors">
                    {c.title}
                  </h3>

                  <p className="mt-2 text-xs sm:text-sm text-gray-300 max-w-md line-clamp-2 leading-relaxed">
                    {c.desc}
                  </p>

                  <div className="mt-5 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-white group-hover:text-gray-300 transition-colors">
                    <span className="border-b border-white pb-0.5">
                      Discover Collection
                    </span>
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>

        </div>
      </section>

      {/* ---------------- 5. MANUFACTURE CRAFTSMANSHIP SPOTLIGHT ---------------- */}
      <section className="w-full py-24 px-6 sm:px-12 max-w-[1600px] mx-auto">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#0F1116] to-[#08090C] border border-white/15 p-8 sm:p-16 shadow-2xl">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-6 flex flex-col">
              <span className="text-xs font-bold uppercase tracking-[0.25em] text-gray-400">
                Inside the Manufacture
              </span>

              <h2 className="mt-3 text-3xl sm:text-5xl font-bold text-white tracking-tight leading-tight">
                Superlative Precision in <br />
                <span className="platinum-gradient-text font-light">Every Single Calibre</span>
              </h2>

              <p className="mt-6 text-sm sm:text-base text-gray-300 leading-relaxed font-normal">
                Every component is conceived, developed and produced in-house in Switzerland to the most stringent standards. From casting titanium alloys to final chronometric testing, perfection is perpetual.
              </p>

              <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center text-black">
                    <Check size={12} strokeWidth={3} />
                  </div>
                  <span className="text-xs text-white">Perpetual Self-Winding Rotor</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center text-black">
                    <Check size={12} strokeWidth={3} />
                  </div>
                  <span className="text-xs text-white">Silicon Anti-Magnetic Hairspring</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center text-black">
                    <Check size={12} strokeWidth={3} />
                  </div>
                  <span className="text-xs text-white">Paraflex Shock Absorbers</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center text-black">
                    <Check size={12} strokeWidth={3} />
                  </div>
                  <span className="text-xs text-white">Ceramic Scratchproof Bezel</span>
                </div>
              </div>

              <div className="mt-10">
                <Link
                  to="/about"
                  className="inline-flex items-center gap-3 bg-white text-black hover:bg-gray-200 text-xs font-bold uppercase tracking-[0.18em] px-8 py-3.5 rounded-full transition-all shadow-lg"
                >
                  <span>Our Horology Philosophy</span>
                  <ArrowRight size={15} />
                </Link>
              </div>
            </div>

            <div className="lg:col-span-6 relative flex items-center justify-center">
              <div className="relative w-full aspect-square max-w-lg rounded-2xl overflow-hidden border border-white/15 shadow-2xl">
                <img
                  src={heritageWatch}
                  alt="Manufacture Watch Movement"
                  className="w-full h-full object-cover filter brightness-95 hover:scale-105 transition-transform duration-700"
                />
              </div>
            </div>

          </div>

        </div>
      </section>

    </div>
  );
}