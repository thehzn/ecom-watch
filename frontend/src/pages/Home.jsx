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

import categoryLuxuryWatch from '../assets/category_luxury_watch.jpg';
import categoryHeritageWatch from '../assets/category_heritage_watch.jpg';
import categorySportWatch from '../assets/category_sport_watch.jpg';
import categoryContemporaryWatch from '../assets/category_contemporary_watch.jpg';
import heroWatchImg from '../assets/luxury_titanium_watch.jpg';

const COLLECTIONS = [
  {
    tag: 'PRECIOUS METALS & PLATINUM',
    title: 'Luxury Haute Horlogerie',
    desc: 'Precious 950 platinum, 18K solid gold, and skeletonized sapphire dials hand-finished to perfection.',
    to: '/categories?category=Luxury#luxury',
    image: categoryLuxuryWatch,
  },
  {
    tag: 'VINTAGE SWISS ARCHIVES',
    title: 'Heritage Classic',
    desc: 'Vintage Swiss enamel dials, blued steel Breguet hands, and historic manufacture calibres reissued.',
    to: '/categories?category=Heritage#heritage',
    image: categoryHeritageWatch,
  },
  {
    tag: 'MOTORSPORT & HIGH PERFORMANCE',
    title: 'Sport & Chronograph',
    desc: 'Forged carbon, matte titanium, ceramic tachymeter bezels, and racing chronographs.',
    to: '/categories?category=Sport#sport',
    image: categorySportWatch,
  },
  {
    tag: 'AVANT-GARDE ARCHITECTURE',
    title: 'Contemporary Architectural',
    desc: 'Open-worked geometric flying tourbillons and minimalist titanium monobloc architecture.',
    to: '/categories?category=Contemporary#contemporary',
    image: categoryContemporaryWatch,
  },
];

const FALLBACK_TRENDING = [
  {
    _id: 'stealth-1',
    modelName: 'Aura Tourbillon Chrono 42mm',
    brand: 'Chronos',
    price: 18500,
    caseMaterial: 'Grade 5 Titanium & Fluted Bezel',
    glassType: 'Anti-Reflective Sapphire',
    category: 'Contemporary',
    badge: 'New 2026 Model',
    mainImage: categoryContemporaryWatch,
  },
  {
    _id: 'stealth-2',
    modelName: 'Royal Skeleton Platinum 40',
    brand: 'Chronos',
    price: 43800,
    caseMaterial: '950 Solid Platinum',
    glassType: 'Double Domed Sapphire',
    category: 'Luxury',
    badge: 'Masterpiece',
    mainImage: categoryLuxuryWatch,
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
    mainImage: categoryHeritageWatch,
  },
  {
    _id: 'stealth-4',
    modelName: 'Forged Carbon Sport Chrono',
    brand: 'Chronos',
    price: 24500,
    caseMaterial: 'Forged Carbon & Titanium',
    glassType: 'Curved Sapphire',
    category: 'Sport',
    badge: 'Limited 1/50',
    mainImage: categorySportWatch,
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
    <div className="min-h-screen bg-[#08090C] text-white selection:bg-[#C5A880] selection:text-black font-['Plus_Jakarta_Sans']">
      
      {/* 1. CINEMATIC TITANIUM TOURBILLON HERO SECTION */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-gradient-to-b from-[#0B0D12] via-[#08090C] to-[#0B0D12] px-6 sm:px-12 py-16 sm:py-20 border-b border-white/10">
        
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] sm:w-[1000px] h-[700px] sm:h-[1000px] bg-[radial-gradient(circle,_rgba(197,168,128,0.06)_0%,_rgba(8,9,12,0)_70%)] pointer-events-none animate-stealth-pulse" />
        
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="w-[35%] h-full bg-gradient-to-r from-transparent via-white/5 to-transparent blur-2xl animate-titanium-sweep" />
        </div>

        <div className="relative max-w-[1600px] mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center z-10">
          
          <div className="lg:col-span-6 flex flex-col items-center lg:items-start text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-[#C5A880]/30 backdrop-blur-md mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C5A880] animate-ping" />
              <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#E4CA99]">
                Calibre 9820 • Flying Tourbillon Chrono
              </span>
            </div>

            <h1 className="font-caslon text-4xl sm:text-6xl xl:text-7xl font-normal leading-[1.08] tracking-tight text-white uppercase">
              Aerospace Titanium <br />
              <span className="platinum-gradient-text italic font-normal">Open-Worked Tourbillon</span>
            </h1>

            <p className="mt-6 text-sm sm:text-base text-gray-300 leading-relaxed max-w-lg font-normal">
              Machined from solid Grade 5 aerospace titanium with an open-worked flying tourbillon, fluted bezel, and luminescent markers. Engineered in Geneva to withstand 300 meters of hydrostatic pressure.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
              <Link
                to="/shop"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-white hover:bg-[#F3F3F4] text-black text-xs font-semibold uppercase tracking-[0.2em] px-8 py-4 rounded-lg transition-all duration-300 shadow-[0_4px_20px_rgba(255,255,255,0.15)] hover:scale-[1.02] active:scale-[0.98] group"
              >
                <span>Explore Timepieces</span>
                <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform text-black" />
              </Link>

              <Link
                to="/about"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 border border-white/20 hover:border-[#C5A880] text-white hover:text-[#E4CA99] text-xs font-medium uppercase tracking-[0.2em] px-8 py-4 rounded-lg bg-white/5 backdrop-blur-md hover:bg-white/10 transition-all duration-300"
              >
                <span>The Manufacture</span>
              </Link>
            </div>

            <div className="mt-12 pt-8 border-t border-white/10 grid grid-cols-3 gap-6 text-left w-full max-w-lg">
              <div>
                <p className="font-caslon text-xl sm:text-2xl font-normal text-white">72 H</p>
                <p className="text-[10px] text-[#C5A880] uppercase tracking-widest mt-0.5">Twin Power Reserve</p>
              </div>
              <div>
                <p className="font-caslon text-xl sm:text-2xl font-normal text-white">300 M</p>
                <p className="text-[10px] text-[#C5A880] uppercase tracking-widest mt-0.5">Triplock Hermetic</p>
              </div>
              <div>
                <p className="font-caslon text-xl sm:text-2xl font-normal text-white">Grade 5</p>
                <p className="text-[10px] text-[#C5A880] uppercase tracking-widest mt-0.5">Aerospace Titanium</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 relative flex items-center justify-center">
            <div className="absolute w-[380px] sm:w-[500px] h-[380px] sm:h-[500px] rounded-full border border-white/10 pointer-events-none" />
            <div className="absolute w-[320px] sm:w-[440px] h-[320px] sm:h-[440px] rounded-full border border-dashed border-white/20 pointer-events-none" />

            <div className="relative z-10 animate-stealth-float p-4">
              <div className="relative w-[300px] sm:w-[420px] xl:w-[470px] aspect-square rounded-3xl overflow-hidden bg-[#0A0B0E] border border-white/20 shadow-2xl">
                <img
                  src={heroWatchImg}
                  alt="Chronos Stealth Titanium Chronograph"
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                  loading="eager"
                />
              </div>
            </div>

            <div className="absolute left-0 sm:left-2 top-8 bg-[#0F1116]/95 backdrop-blur-xl border border-white/25 px-4 py-3 rounded-2xl shadow-2xl z-20 hidden sm:block">
              <p className="text-[9px] uppercase tracking-widest text-gray-400 font-bold">CASE ARCHITECTURE</p>
              <p className="text-xs font-semibold text-white mt-0.5">Grade 5 Titanium & Fluted Bezel</p>
            </div>

            <div className="absolute right-0 sm:right-2 bottom-8 bg-[#0F1116]/95 backdrop-blur-xl border border-white/25 px-4 py-3 rounded-2xl shadow-2xl z-20 hidden sm:block">
              <p className="text-[9px] uppercase tracking-widest text-gray-400 font-bold">ESCAPEMENT</p>
              <p className="text-xs font-semibold text-white mt-0.5">Flying Tourbillon • -2/+2 sec/day</p>
            </div>

            <div className="absolute -bottom-6 sm:bottom-0 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/70 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/15 text-[10px] text-gray-300">
              <Play size={10} className="fill-white text-white" />
              <span>Geneva Manufacture Masterpiece</span>
            </div>
          </div>

        </div>
      </section>

      {/* 2. SUPERLATIVE STANDARDS STRIP */}
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

      {/* 3. TRENDING SECTION */}
      <section className="w-full py-20 sm:py-28 px-6 sm:px-12 max-w-[1600px] mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-6">
          <div>
            <span className="text-[#C5A880] text-xs font-semibold uppercase tracking-[0.25em] block mb-2">
              Featured Selection
            </span>
            <h2 className="font-caslon text-3xl sm:text-5xl font-normal tracking-tight text-white">
              Trending Timepieces
            </h2>
          </div>

          <Link
            to="/shop"
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-white hover:text-[#C5A880] transition-colors group"
          >
            <span>View All Configurations</span>
            <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {trendingProducts.map((product) => {
            const isWishlisted = wishlistItems.some((w) => w._id === product._id);
            return (
              <div
                key={product._id}
                onClick={() => navigate(`/product/${product._id}`)}
                className="group relative bg-[#0E1017] border border-white/10 hover:border-[#C5A880]/50 rounded-xl overflow-hidden cursor-pointer transition-all duration-300 flex flex-col justify-between hover:shadow-[0_15px_35px_rgba(0,0,0,0.8),0_0_20px_rgba(197,168,128,0.08)]"
              >
                <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#131722] p-8 flex items-center justify-center">
                  <img
                    src={product.mainImage}
                    alt={product.modelName}
                    className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />

                  <span className="absolute top-3.5 left-3.5 bg-black/80 backdrop-blur-md border border-white/15 text-[#E4CA99] text-[10px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                    {product.badge || 'New 2026'}
                  </span>

                  <button
                    onClick={(e) => handleWishlist(e, product)}
                    aria-label="Save to Wishlist"
                    className="absolute top-3.5 right-3.5 w-8 h-8 rounded-full bg-black/70 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-[#C5A880] hover:text-black transition-all"
                  >
                    <Heart size={14} className={isWishlisted ? 'fill-[#C5A880] text-[#C5A880]' : ''} />
                  </button>

                  <div className="absolute bottom-3 inset-x-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                    <span className="w-full block bg-white text-black text-[11px] font-semibold uppercase tracking-wider py-2.5 rounded-lg text-center shadow-lg hover:bg-[#F3F3F4]">
                      Configure Model
                    </span>
                  </div>
                </div>

                <div className="p-5 flex flex-col gap-2">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#C5A880]">
                    {product.category || 'Oyster Perpetual'}
                  </span>

                  <h3 className="font-caslon text-lg font-normal text-white group-hover:text-[#E4CA99] transition-colors line-clamp-1">
                    {product.modelName}
                  </h3>

                  <p className="text-xs text-gray-400 font-normal">
                    {product.caseMaterial || 'Titanium & Platinum'} · {product.glassType || 'Sapphire'}
                  </p>

                  <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between">
                    <span className="text-base font-semibold text-white">
                     ₹{Number(product.price).toLocaleString()}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] uppercase tracking-wider text-gray-300 font-medium group-hover:text-[#C5A880] transition-colors">
                      Details <ArrowUpRight size={13} />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. THE 4 CORE COLLECTIONS: Luxury, Heritage, Sport, Contemporary */}
      <section className="w-full py-20 bg-[#060709] border-t border-white/10">
        <div className="max-w-[1600px] mx-auto px-6 sm:px-12">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-[#C5A880]">
              The Configurations
            </span>
            <h2 className="font-caslon mt-2 text-3xl sm:text-5xl font-normal text-white tracking-tight">
              Curated Collections
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {COLLECTIONS.map((c) => (
              <Link
                key={c.title}
                to={c.to}
                className="group relative block h-[460px] sm:h-[520px] rounded-xl overflow-hidden border border-white/15 hover:border-[#C5A880]/60 transition-all duration-500 shadow-2xl"
              >
                <img
                  src={c.image}
                  alt={c.title}
                  className="h-full w-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent transition-opacity" />

                <div className="absolute bottom-0 left-0 right-0 p-8 sm:p-12 flex flex-col items-start text-white">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#C5A880]">
                    {c.tag}
                  </span>

                  <h3 className="font-caslon mt-1 text-2xl sm:text-3xl text-white font-normal group-hover:text-[#E4CA99] transition-colors">
                    {c.title}
                  </h3>

                  <p className="mt-2 text-xs sm:text-sm text-gray-300 max-w-md line-clamp-2 leading-relaxed">
                    {c.desc}
                  </p>

                  <div className="mt-5 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-white group-hover:text-[#C5A880] transition-colors">
                    <span className="border-b border-[#C5A880] pb-0.5">
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

      {/* 5. CRAFTSMANSHIP SPOTLIGHT */}
      <section className="w-full py-24 px-6 sm:px-12 max-w-[1600px] mx-auto">
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-[#0F1116] to-[#08090C] border border-white/15 p-8 sm:p-16 shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 flex flex-col">
              <span className="text-xs font-semibold uppercase tracking-[0.25em] text-[#C5A880]">
                Inside the Manufacture
              </span>

              <h2 className="font-caslon mt-3 text-3xl sm:text-5xl font-normal text-white tracking-tight leading-tight">
                Superlative Precision in <br />
                <span className="platinum-gradient-text italic font-normal">Every Single Calibre</span>
              </h2>

              <p className="mt-6 text-sm sm:text-base text-gray-300 leading-relaxed font-normal">
                Every component is conceived, developed and produced in-house in Switzerland to the most stringent standards. From casting titanium alloys to final chronometric testing, perfection is perpetual.
              </p>

              <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#C5A880] flex items-center justify-center text-black">
                    <Check size={12} strokeWidth={3} />
                  </div>
                  <span className="text-xs text-white">Perpetual Self-Winding Rotor</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#C5A880] flex items-center justify-center text-black">
                    <Check size={12} strokeWidth={3} />
                  </div>
                  <span className="text-xs text-white">Silicon Anti-Magnetic Hairspring</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#C5A880] flex items-center justify-center text-black">
                    <Check size={12} strokeWidth={3} />
                  </div>
                  <span className="text-xs text-white">Paraflex Shock Absorbers</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#C5A880] flex items-center justify-center text-black">
                    <Check size={12} strokeWidth={3} />
                  </div>
                  <span className="text-xs text-white">Ceramic Scratchproof Bezel</span>
                </div>
              </div>

              <div className="mt-10">
                <Link
                  to="/about"
                  className="inline-flex items-center gap-3 bg-white text-black hover:bg-[#F3F3F4] text-xs font-semibold uppercase tracking-[0.18em] px-8 py-3.5 rounded-lg transition-all shadow-md active:scale-[0.98]"
                >
                  <span>Our Horology Philosophy</span>
                  <ArrowRight size={15} />
                </Link>
              </div>
            </div>

            <div className="lg:col-span-6 relative flex items-center justify-center">
              <div className="relative w-full aspect-square max-w-lg rounded-xl overflow-hidden border border-white/15 shadow-2xl">
                <img
                  src={categoryHeritageWatch}
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
