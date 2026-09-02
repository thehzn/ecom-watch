const fs = require('fs');
const path = require('path');

const targetDir = '/Users/shahan/Documents/ecom-watch';
const files = {};

// =========================================================================
// 1. backend/controllers/ProductControllers.js
// =========================================================================
files['backend/controllers/ProductControllers.js'] = `import Product from "../models/ProductModel.js";
import cloudinary from "../config/cloudinary.js";
import fs from "fs";

export const addProduct = async (req, res) => {
  try {
    const { modelName, sku, brand, modelNumber, category, productFor, price, stock, description, caseMaterial, glassType, strapBracelet } = req.body;

    if (!modelName || !sku || !brand || !modelNumber || !category || !price || !stock || !description) {
      return res.status(400).json({ status: false, message: "All required fields are required" });
    }

    if (!req.files?.mainImage) {
      return res.status(400).json({ status: false, message: "Main image is required" });
    }

    const existingProduct = await Product.findOne({ sku });
    if (existingProduct) {
      return res.status(400).json({ status: false, message: "SKU already exists" });
    }

    let mainImageUrl = "";
    let imageUrls = [];

    const mainImageFile = req.files.mainImage[0];
    const mainImage = await cloudinary.uploader.upload(mainImageFile.path, {
      folder: "Products/MainImage",
    });
    mainImageUrl = mainImage.secure_url;

    if (fs.existsSync(mainImageFile.path)) {
      fs.unlinkSync(mainImageFile.path);
    }

    if (req.files.images && req.files.images.length > 0) {
      for (const file of req.files.images) {
        const uploadedImage = await cloudinary.uploader.upload(file.path, {
          folder: "Products/Images",
        });
        imageUrls.push(uploadedImage.secure_url);
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      }
    }

    const product = await Product.create({
      modelName,
      sku,
      brand,
      modelNumber,
      category,
      productFor,
      price,
      stock,
      description,
      caseMaterial,
      glassType,
      strapBracelet,
      mainImage: mainImageUrl,
      images: imageUrls,
    });

    return res.status(200).json({ status: true, message: "Product added successfully", product });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

export const getAllProducts = async (req, res) => {
  try {
    const { category, productFor, caseMaterial, search } = req.query;
    const filter = {};

    if (category && category !== 'All') {
      const catLower = category.toLowerCase().trim();
      if (catLower === 'luxury' || catLower === 'luxury watch') {
        filter.category = { $regex: /luxury/i };
      } else if (catLower === 'sport') {
        filter.category = { $regex: /sport|contemporary/i };
      } else if (catLower === 'heritage') {
        filter.category = { $regex: /heritage/i };
      } else if (catLower === 'contemporary') {
        filter.category = { $regex: /contemporary|sport/i };
      } else {
        filter.category = { $regex: new RegExp(`^${category}`, 'i') };
      }
    }

    if (productFor && productFor !== 'All') {
      filter.productFor = productFor;
    }

    if (caseMaterial && caseMaterial !== 'All Materials') {
      filter.caseMaterial = caseMaterial;
    }

    if (search) {
      filter.$or = [
        { modelName: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
        { caseMaterial: { $regex: search, $options: 'i' } },
      ];
    }

    const products = await Product.find(filter).sort({ createdAt: -1 });
    return res.status(200).json({ status: true, message: "Products fetched successfully", products });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

export const getSingleProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ status: false, message: "Product not found" });
    return res.status(200).json({ status: true, message: "Product fetched successfully", product });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedProduct = await Product.findByIdAndUpdate(id, req.body, { returnDocument: "after" });
    if (!updatedProduct) {
      return res.status(404).json({ status: false, message: "Product not found" });
    }
    return res.status(200).json({ status: true, message: "Product updated successfully", product: updatedProduct });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ status: false, message: "Product not found" });
    }
    await Product.findByIdAndDelete(id);
    return res.status(200).json({ status: true, message: "Product deleted successfully" });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};
`;

// =========================================================================
// 2. frontend/src/components/Footer.jsx
// =========================================================================
files['frontend/src/components/Footer.jsx'] = `import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ArrowRight, ShieldCheck, Award, Clock, Sparkles } from 'lucide-react';
import { useApi } from '../hooks/useApi';

export default function Footer() {
  const { post } = useApi();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);

  const [status, setStatus] = useState('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubscribe = async () => {
    if (!user) {
      navigate('/login', { state: { from: '/' } });
      return;
    }
    setStatus('loading');
    setErrorMessage('');
    try {
      await post('/newsletter/subscribe', { email: user.email });
      setStatus('success');
    } catch (err) {
      if ((err.message || '').toLowerCase().includes('already subscribed')) {
        setStatus('already');
      } else {
        setErrorMessage(err.message || "Couldn't subscribe. Try again.");
        setStatus('error');
      }
    }
  };

  return (
    <>
      {/* Stealth Titanium VIP Membership Strip */}
      <section className="w-full relative overflow-hidden bg-gradient-to-b from-[#08090C] to-[#0E1015] border-t border-white/10 py-16 sm:py-20">
        <div className="relative mx-auto w-full max-w-2xl px-5 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/20 bg-white/5 text-white text-[10px] tracking-[0.25em] uppercase mb-4">
            <Sparkles size={12} />
            Privé Membership
          </div>
          
          <h3 className="mb-4 text-2xl sm:text-4xl font-bold text-white leading-tight">
            Join the Chronos Private Circle
          </h3>
          
          <p className="mb-8 text-sm sm:text-base text-gray-400 leading-relaxed max-w-lg mx-auto font-normal">
            Receive confidential invitations to limited titanium editions and private atelier viewings.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
            <button
              type="button"
              onClick={handleSubscribe}
              disabled={status === 'loading'}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-white hover:bg-gray-200 text-black text-xs font-bold uppercase tracking-[0.18em] px-8 py-3.5 rounded-full transition-all disabled:opacity-50 shadow-lg"
            >
              {status === 'loading' ? 'Joining Circle...' : 'Request Private Access'}
              {status !== 'loading' && <ArrowRight size={15} />}
            </button>
          </div>

          {status === 'error' && (
            <p className="mt-4 text-xs text-red-400">{errorMessage}</p>
          )}

          {status === 'already' && (
            <p className="mt-4 text-xs text-gray-300">
              You are already an esteemed member of our private circle.
            </p>
          )}
        </div>

        {/* Modal Confirmation */}
        {status === 'success' && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md px-5"
            onClick={() => setStatus('idle')}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-[#101318] border border-white/20 p-8 sm:p-10 text-center rounded-2xl shadow-2xl"
            >
              <div className="w-12 h-12 rounded-full border border-white flex items-center justify-center mx-auto mb-4 text-white">
                <Sparkles size={20} />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-gray-300">
                Privilege Confirmed
              </span>
              <h4 className="mt-3 text-2xl font-bold text-white">
                Welcome to the Circle
              </h4>
              <p className="mt-3 text-sm leading-relaxed text-gray-400">
                You will receive confidential access to limited production runs and master horology events.
              </p>
              <button
                onClick={() => setStatus('idle')}
                className="mt-6 w-full bg-white text-black py-3 text-xs font-bold uppercase tracking-[0.15em] rounded-lg hover:bg-gray-200 transition-colors"
              >
                Proceed
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Main Luxury Footer */}
      <footer className="w-full bg-[#050608] border-t border-white/10 pt-16 pb-12">
        <div className="max-w-[1600px] mx-auto px-6 sm:px-10">
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 pb-16 border-b border-white/10">
            
            {/* Brand Manifesto */}
            <div className="lg:col-span-2 flex flex-col gap-3">
              <span className="text-2xl sm:text-3xl font-bold tracking-[0.2em] text-white">
                CHRONOS
              </span>
              <p className="text-[10px] uppercase tracking-[0.3em] text-gray-400 font-semibold">
                Geneva • Le Brassus • Zurich
              </p>
              <p className="max-w-sm text-sm text-gray-400 leading-relaxed mt-2 font-normal">
                Pioneering mechanical excellence in aerospace titanium and platinum. Every timepiece is hand-assembled to endure generations.
              </p>
            </div>

            {/* Collections: Luxury, Heritage, Sport, Contemporary */}
            <div className="flex flex-col gap-3">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-white">
                Collections
              </span>
              <Link to="/categories?category=Luxury#luxury" className="text-xs text-gray-400 hover:text-white transition-colors">
                Luxury
              </Link>
              <Link to="/categories?category=Heritage#heritage" className="text-xs text-gray-400 hover:text-white transition-colors">
                Heritage
              </Link>
              <Link to="/categories?category=Sport#sport" className="text-xs text-gray-400 hover:text-white transition-colors">
                Sport
              </Link>
              <Link to="/categories?category=Contemporary#contemporary" className="text-xs text-gray-400 hover:text-white transition-colors">
                Contemporary
              </Link>
            </div>

            {/* Haute Services */}
            <div className="flex flex-col gap-3">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-white">
                Concierge
              </span>
              <Link to="/enquiry" className="text-xs text-gray-400 hover:text-white transition-colors">
                Private Appointment
              </Link>
              <Link to="/enquiry" className="text-xs text-gray-400 hover:text-white transition-colors">
                Bespoke Commission
              </Link>
              <Link to="/about" className="text-xs text-gray-400 hover:text-white transition-colors">
                Certificate of Authenticity
              </Link>
              <Link to="/faq" className="text-xs text-gray-400 hover:text-white transition-colors">
                Restoration &amp; Care
              </Link>
            </div>

            {/* Maison */}
            <div className="flex flex-col gap-3">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-white">
                Maison
              </span>
              <Link to="/about" className="text-xs text-gray-400 hover:text-white transition-colors">
                The Manufacture
              </Link>
              <Link to="/privacy-policy" className="text-xs text-gray-400 hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <Link to="/faq" className="text-xs text-gray-400 hover:text-white transition-colors">
                Client FAQ
              </Link>
            </div>
          </div>

          {/* Bottom Trust & Copyright */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <p className="text-[11px] text-gray-500 tracking-wider">
              © 2026 CHRONOS HAUTE HORLOGERIE. ALL RIGHTS RESERVED.
            </p>
            <div className="flex items-center gap-6 text-[10px] uppercase tracking-[0.2em] text-gray-400">
              <span>Swiss Certified</span>
              <span>•</span>
              <span>100% Handcrafted</span>
              <span>•</span>
              <span>5-Year Warranty</span>
            </div>
          </div>

        </div>
      </footer>
    </>
  );
}
`;

// =========================================================================
// 3. frontend/src/pages/Categories.jsx
// =========================================================================
files['frontend/src/pages/Categories.jsx'] = `import { useState, useCallback, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight, Sparkles, Heart } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useApi } from '../hooks/useApi';
import { addToWishlistLocal } from '../redux/wishlistSlice';

import categoryLuxuryWatch from '../assets/category_luxury_watch.jpg';
import categoryHeritageWatch from '../assets/category_heritage_watch.jpg';
import categorySportWatch from '../assets/category_sport_watch.jpg';
import categoryContemporaryWatch from '../assets/category_contemporary_watch.jpg';

const LIMIT = 12;

const COLLECTIONS = [
  {
    category: 'Luxury',
    id: 'luxury',
    label: 'Collection I',
    title: 'Luxury Haute Horlogerie',
    description:
      'Precious 950 platinum, solid white gold, and skeletonized sapphire dials hand-finished to perfection.',
    image: categoryLuxuryWatch,
  },
  {
    category: 'Heritage',
    id: 'heritage',
    label: 'Collection II',
    title: 'Heritage Classics',
    description:
      'Vintage Swiss enamel dials, blued steel Breguet hands, and historic manufacture archives reissued.',
    image: categoryHeritageWatch,
  },
  {
    category: 'Sport',
    id: 'sport',
    label: 'Collection III',
    title: 'Sport & Chronograph',
    description:
      'Forged carbon, matte titanium, ceramic tachymeters, and high-performance racing calibres.',
    image: categorySportWatch,
  },
  {
    category: 'Contemporary',
    id: 'contemporary',
    label: 'Collection IV',
    title: 'Contemporary Architectural',
    description:
      'Open-worked geometric flying tourbillons and minimalist titanium monobloc architecture.',
    image: categoryContemporaryWatch,
  },
];

function ProductCard({ product }) {
  const { post } = useApi();
  const dispatch = useDispatch();
  const details = [product.caseMaterial, product.glassType].filter(Boolean).join(' · ');

  const wishlisted = useSelector((state) =>
    state.wishlist.items.some((item) => item._id === product._id)
  );

  const handleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (wishlisted) return;
    try {
      await post(\`/apiwishlist/addwishlist/\${product._id}\`);
      dispatch(addToWishlistLocal(product));
    } catch {
      // ignore
    }
  };

  return (
    <Link
      to={\`/product/\${product._id}\`}
      className="group block bg-[#0E1015] border border-white/10 hover:border-white/40 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl flex flex-col justify-between"
    >
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#141720] p-8 flex items-center justify-center">
        <img
          src={product.mainImage}
          alt={product.modelName}
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-108"
        />
        <button
          onClick={handleWishlist}
          className="absolute right-3.5 top-3.5 w-8 h-8 rounded-full bg-black/70 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all"
        >
          <Heart size={14} className={wishlisted ? "fill-white text-white" : ""} />
        </button>
      </div>
      <div className="p-5 flex flex-col gap-1.5">
        <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400">
          {product.category || 'Haute Horlogerie'}
        </span>
        <h3 className="text-base font-bold text-white group-hover:text-gray-200 transition-colors line-clamp-1">
          {product.modelName}
        </h3>
        {details && (
          <p className="text-xs text-gray-400 line-clamp-1">{details}</p>
        )}
        <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-between">
          <p className="text-sm font-bold text-white">
            \${Number(product.price).toLocaleString()}
          </p>
          <span className="text-[10px] uppercase tracking-wider text-gray-300 font-bold group-hover:text-white">
            Configure &rarr;
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function Categories() {
  const { get } = useApi();
  const [searchParams] = useSearchParams();
  const initialCategory = searchParams.get('category');
  const listingRef = useRef(null);

  const [selectedCategory, setSelectedCategory] = useState(initialCategory || 'Luxury');
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState('');

  const totalPages = Math.max(1, Math.ceil(products.length / LIMIT));
  const pagedProducts = products.slice((page - 1) * LIMIT, page * LIMIT);

  const fetchCategory = useCallback(
    async (category) => {
      setLoading(true);
      setFetchError('');
      setSelectedCategory(category);
      setPage(1);
      try {
        const params = new URLSearchParams({ category });
        const data = await get(\`/apiproduct/getallproducts?\${params.toString()}\`);
        setProducts(data.products || []);
      } catch {
        setFetchError('Unable to load this collection right now.');
        setProducts([]);
      } finally {
        setLoading(false);
      }
    },
    [get]
  );

  useEffect(() => {
    if (initialCategory) {
      const match = COLLECTIONS.find(
        (c) => c.category.toLowerCase() === initialCategory.toLowerCase()
      );
      if (match) {
        fetchCategory(match.category);
        const el = document.getElementById(match.id);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      } else {
        fetchCategory(initialCategory);
      }
    } else {
      fetchCategory('Luxury');
    }
  }, [initialCategory, fetchCategory]);

  const handleExplore = (category, id) => {
    fetchCategory(category);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#08090C] text-white font-['Plus_Jakarta_Sans']">
      
      {/* Hero */}
      <section className="w-full bg-[#0B0D12] border-b border-white/10 px-6 py-16 sm:py-24 text-center relative overflow-hidden">
        <div className="relative mx-auto flex max-w-3xl flex-col items-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-[10px] font-bold uppercase tracking-[0.25em] text-gray-300 mb-3">
            <Sparkles size={12} />
            Haute Horlogerie Pillars
          </div>
          <h1 className="text-4xl sm:text-6xl font-bold text-white tracking-tight">
            The Collections
          </h1>
          <p className="mt-4 text-sm sm:text-base text-gray-300 font-normal leading-relaxed">
            Explore our four foundational horology collections: Luxury, Heritage, Sport, and Contemporary.
          </p>
        </div>
      </section>

      {/* Collection Highlights */}
      <div className="max-w-[1600px] mx-auto px-6 py-16 flex flex-col gap-16">
        {COLLECTIONS.map((c, idx) => (
          <div
            id={c.id}
            key={c.category}
            className={\`grid grid-cols-1 lg:grid-cols-12 gap-10 items-center bg-[#0E1015] border rounded-3xl p-8 sm:p-12 transition-all scroll-mt-28 \${
              selectedCategory.toLowerCase() === c.category.toLowerCase()
                ? 'border-white/50 shadow-[0_0_30px_rgba(255,255,255,0.1)]'
                : 'border-white/10'
            } \${idx % 2 === 1 ? 'lg:flex-row-reverse' : ''}\`}
          >
            <div className={\`lg:col-span-6 \${idx % 2 === 1 ? 'lg:order-2' : ''}\`}>
              <div className="aspect-square rounded-2xl overflow-hidden border border-white/15 shadow-2xl bg-[#141720]">
                <img
                  src={c.image}
                  alt={c.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                />
              </div>
            </div>

            <div className={\`lg:col-span-6 flex flex-col items-start \${idx % 2 === 1 ? 'lg:order-1' : ''}\`}>
              <span className="text-xs font-bold uppercase tracking-[0.25em] text-gray-400">
                {c.label}
              </span>
              <h2 className="mt-2 text-3xl sm:text-4xl text-white font-bold tracking-tight">
                {c.title}
              </h2>
              <p className="mt-4 text-sm sm:text-base text-gray-300 font-normal leading-relaxed">
                {c.description}
              </p>
              <button
                onClick={() => handleExplore(c.category, c.id)}
                className={\`mt-8 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] px-8 py-3.5 rounded-full transition-all shadow-lg \${
                  selectedCategory.toLowerCase() === c.category.toLowerCase()
                    ? 'bg-white text-black'
                    : 'bg-white/10 text-white hover:bg-white hover:text-black border border-white/20'
                }\`}
              >
                <span>{selectedCategory.toLowerCase() === c.category.toLowerCase() ? 'Viewing Collection' : 'Select Collection'}</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Product Listing for Selected Collection */}
      <section ref={listingRef} className="w-full border-t border-white/10 bg-[#0B0D12] px-6 py-16">
        <div className="max-w-[1600px] mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-gray-400">
                Active Catalog
              </span>
              <h2 className="text-2xl sm:text-4xl font-bold text-white tracking-tight">
                {selectedCategory} Timepieces
              </h2>
            </div>
            <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">
              {products.length} models available
            </p>
          </div>

          {loading && (
            <div className="py-20 text-center">
              <div className="w-10 h-10 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-sm text-gray-400">Loading {selectedCategory} models…</p>
            </div>
          )}

          {!loading && fetchError && (
            <p className="py-16 text-center text-sm text-red-400">{fetchError}</p>
          )}

          {!loading && !fetchError && products.length === 0 && (
            <div className="bg-[#0E1015] border border-white/10 rounded-2xl p-12 text-center max-w-lg mx-auto">
              <p className="text-sm text-gray-300">
                No timepieces currently listed under {selectedCategory}.
              </p>
              <Link
                to="/shop"
                className="mt-4 inline-block text-xs uppercase font-bold text-white underline tracking-wider"
              >
                Explore Full Catalog
              </Link>
            </div>
          )}

          {!loading && !fetchError && products.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
              {pagedProducts.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          )}

          {!loading && !fetchError && totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-12 pt-6 border-t border-white/10">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white hover:border-white transition-colors disabled:opacity-30"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-xs uppercase tracking-wider font-semibold text-gray-400">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white hover:border-white transition-colors disabled:opacity-30"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      </section>

    </div>
  );
}
`;

// =========================================================================
// 4. frontend/src/pages/Home.jsx
// =========================================================================
files['frontend/src/pages/Home.jsx'] = `import { useEffect, useState } from 'react';
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
      await post(\`/apiwishlist/addwishlist/\${product._id}\`);
    } catch {
      // ignore
    }
    dispatch(addToWishlistLocal(product));
  };

  return (
    <div className="min-h-screen bg-[#08090C] text-white selection:bg-white selection:text-black font-['Plus_Jakarta_Sans']">
      
      {/* 1. CINEMATIC TITANIUM TOURBILLON HERO SECTION */}
      <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden bg-gradient-to-b from-[#0B0D12] via-[#08090C] to-[#0B0D12] px-6 sm:px-12 py-16 border-b border-white/10">
        
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] sm:w-[1000px] h-[700px] sm:h-[1000px] bg-[radial-gradient(circle,_rgba(255,255,255,0.08)_0%,_rgba(8,9,12,0)_70%)] pointer-events-none animate-stealth-pulse" />
        
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="w-[35%] h-full bg-gradient-to-r from-transparent via-white/10 to-transparent blur-2xl animate-titanium-sweep" />
        </div>

        <div className="relative max-w-[1600px] mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center z-10">
          
          <div className="lg:col-span-6 flex flex-col items-center lg:items-start text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-md mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
              <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-gray-200">
                Calibre 9820 • Flying Tourbillon Chrono
              </span>
            </div>

            <h1 className="text-4xl sm:text-6xl xl:text-7xl font-bold leading-[1.05] tracking-tight text-white">
              AEROSPACE TITANIUM <br />
              <span className="platinum-gradient-text font-light">OPEN-WORKED TOURBILLON</span>
            </h1>

            <p className="mt-6 text-sm sm:text-base text-gray-300 leading-relaxed max-w-lg font-normal">
              Machined from solid Grade 5 aerospace titanium with an open-worked flying tourbillon, fluted bezel, and luminescent markers. Engineered in Geneva to withstand 300 meters of hydrostatic pressure.
            </p>

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

            <div className="mt-12 pt-8 border-t border-white/10 grid grid-cols-3 gap-6 text-left w-full max-w-lg">
              <div>
                <p className="text-lg sm:text-xl font-bold text-white">72 H</p>
                <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-0.5">Twin Power Reserve</p>
              </div>
              <div>
                <p className="text-lg sm:text-xl font-bold text-white">300 M</p>
                <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-0.5">Triplock Hermetic</p>
              </div>
              <div>
                <p className="text-lg sm:text-xl font-bold text-white">GRADE 5</p>
                <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-0.5">Aerospace Titanium</p>
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {trendingProducts.map((product) => {
            const isWishlisted = wishlistItems.some((w) => w._id === product._id);
            return (
              <div
                key={product._id}
                onClick={() => navigate(\`/product/\${product._id}\`)}
                className="group relative bg-[#0E1015] border border-white/10 hover:border-white/40 rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 flex flex-col justify-between hover:shadow-[0_15px_35px_rgba(0,0,0,0.8),0_0_20px_rgba(255,255,255,0.06)]"
              >
                <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#141720] p-8 flex items-center justify-center">
                  <img
                    src={product.mainImage}
                    alt={product.modelName}
                    className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-108"
                  />

                  <span className="absolute top-4 left-4 bg-black/80 backdrop-blur-md border border-white/20 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md">
                    {product.badge || 'New 2026'}
                  </span>

                  <button
                    onClick={(e) => handleWishlist(e, product)}
                    aria-label="Save to Wishlist"
                    className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/70 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all"
                  >
                    <Heart size={15} className={isWishlisted ? 'fill-white text-white' : ''} />
                  </button>

                  <div className="absolute bottom-3 inset-x-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                    <span className="w-full block bg-white text-black text-[11px] font-bold uppercase tracking-wider py-2.5 rounded-lg text-center shadow-lg">
                      Configure Model
                    </span>
                  </div>
                </div>

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
                      \${Number(product.price).toLocaleString()}
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

      {/* 4. THE 4 CORE COLLECTIONS: Luxury, Heritage, Sport, Contemporary */}
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

      {/* 5. CRAFTSMANSHIP SPOTLIGHT */}
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
`;

for (const [relPath, content] of Object.entries(files)) {
  const targetFile = path.join(targetDir, relPath);
  fs.mkdirSync(path.dirname(targetFile), { recursive: true });
  fs.writeFileSync(targetFile, content, 'utf8');
  console.log('Synchronized:', relPath);
}

console.log('Updated Categories, Home, Footer, and Backend Controllers successfully!');
