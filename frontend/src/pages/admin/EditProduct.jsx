import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';

const CATEGORIES = ['Luxury Watch', 'Heritage', 'Contemporary', 'Complications'];
const PRODUCT_FOR_OPTIONS = ['Men', 'Women', 'Children'];
const BASE_URL = 'http://localhost:3000';

const initialFormState = {
  modelName: '',
  sku: '',
  brand: '',
  modelNumber: '',
  category: 'Luxury Watch',
  productFor: 'Men',
  price: '',
  stock: 1,
  description: '',
  caseMaterial: '',
  glassType: '',
  strapBracelet: '',
};

function UploadCard({ label, preview, onChange, tall }) {
  return (
    <label
      className={`relative flex flex-col items-center justify-center gap-2 border border-dashed border-[#CFC4C5] bg-[#F3F3F1] cursor-pointer transition-colors duration-300 hover:bg-[#ECECEA] ${
        tall ? 'h-[320px]' : 'h-[130px]'
      }`}
    >
      <input
        type="file"
        accept="image/png,image/jpeg"
        className="hidden"
        onChange={onChange}
      />
      {preview ? (
        <img src={preview} alt={label} className="absolute inset-0 w-full h-full object-cover" />
      ) : (
        <>
          <span className="text-[#5E5E5E] text-2xl leading-none">↑</span>
          <span className={`text-[#1A1C1C] ${tall ? 'text-sm' : 'text-[10px]'}`}>{label}</span>
          {tall && (
            <span className="text-[10px] text-[#5E5E5E]">Supports PNG and JPG up to 10MB</span>
          )}
        </>
      )}
    </label>
  );
}

export default function EditProduct() {
  const navigate = useNavigate();
  const { id } = useParams();
  const token = useSelector((state) => state.auth.token);

  const [form, setForm] = useState(initialFormState);

  // Existing images (URLs already saved on the product)
  const [existingMainImage, setExistingMainImage] = useState(null);
  const [existingImages, setExistingImages] = useState([null, null, null]);

  // Newly selected files (only sent if the user replaces an image)
  const [mainImage, setMainImage] = useState(null);
  const [mainImagePreview, setMainImagePreview] = useState(null);
  const [additionalImages, setAdditionalImages] = useState([null, null, null]);
  const [additionalPreviews, setAdditionalPreviews] = useState([null, null, null]);

  const [loadingProduct, setLoadingProduct] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Fetch the existing product and pre-fill the form
  useEffect(() => {
    const fetchProduct = async () => {
      setLoadingProduct(true);
      setError(null);
      try {
        const res = await fetch(`${BASE_URL}/apiproduct/${id}`, {
          headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        });
        if (!res.ok) throw new Error(`Failed to load product: ${res.status}`);
        const product = await res.json();

        setForm({
          modelName: product.modelName || '',
          sku: product.sku || '',
          brand: product.brand || '',
          modelNumber: product.modelNumber || '',
          category: product.category || 'Luxury Watch',
          productFor: product.productFor || 'Men',
          price: product.price ?? '',
          stock: product.stock ?? 1,
          description: product.description || '',
          caseMaterial: product.caseMaterial || '',
          glassType: product.glassType || '',
          strapBracelet: product.strapBracelet || '',
        });

        setExistingMainImage(product.mainImage || null);
        setExistingImages([
          product.images?.[0] || null,
          product.images?.[1] || null,
          product.images?.[2] || null,
        ]);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoadingProduct(false);
      }
    };

    if (id) fetchProduct();
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleMainImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setMainImage(file);
    setMainImagePreview(URL.createObjectURL(file));
  };

  const handleAdditionalImageChange = (index) => (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAdditionalImages((prev) => {
      const next = [...prev];
      next[index] = file;
      return next;
    });
    setAdditionalPreviews((prev) => {
      const next = [...prev];
      next[index] = URL.createObjectURL(file);
      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const payload = new FormData();
      Object.entries(form).forEach(([key, value]) => payload.append(key, value));

      // Only attach new files if the user actually replaced them —
      // otherwise the backend should keep the existing saved image(s)
      if (mainImage) payload.append('mainImage', mainImage);
      additionalImages.forEach((file) => {
        if (file) payload.append('images', file);
      });

      const res = await fetch(`${BASE_URL}/apiproduct/updateproduct/${id}`, {
        method: 'PUT',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: payload,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.message || `Request failed: ${res.status}`);
      }

      navigate('/admin/products');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingProduct) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#F9F9F9]">
        <p className="text-sm text-[#5E5E5E]">Loading product...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center py-24 px-6 bg-[#F9F9F9]">
      <div className="w-full max-w-[800px] mx-auto">
        {/* Page Header */}
        <header className="mb-20 text-center">
          <p className="text-[11px] font-semibold tracking-[0.1em] uppercase text-[#5E5E5E] mb-4">
            Product Registration
          </p>
          <h1
            className="text-[32px] leading-10 font-normal uppercase tracking-wide text-black mb-4"
            style={{ fontFamily: "'Libre Caslon Text', serif" }}
          >
            Edit Product
          </h1>
          <p className="text-sm text-[#5E5E5E] max-w-[448px] mx-auto">
            Update this timepiece's specifications, imagery, and pricing details.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="flex flex-col gap-24">
          {/* Section 01 — General Information */}
          <section>
            <div className="flex items-baseline gap-3 pb-4 border-b border-[#CFC4C5] mb-10">
              <span className="text-[11px] font-semibold tracking-wide text-[#5E5E5E]">01</span>
              <h2
                className="text-xl text-black"
                style={{ fontFamily: "'Libre Caslon Text', serif" }}
              >
                General Information
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
              <div>
                <label className="block text-[11px] text-[#5E5E5E] mb-2">Model Name *</label>
                <input
                  type="text"
                  name="modelName"
                  value={form.modelName}
                  onChange={handleChange}
                  placeholder="e.g. Meridian Chronograph"
                  required
                  className="w-full border-0 border-b border-[#1A1C1C] bg-transparent py-2 text-sm focus:outline-none focus:border-black"
                />
              </div>
              <div>
                <label className="block text-[11px] text-[#5E5E5E] mb-2">SKU</label>
                <input
                  type="text"
                  name="sku"
                  value={form.sku}
                  onChange={handleChange}
                  placeholder="e.g. CHR-2024-0142"
                  className="w-full border-0 border-b border-[#CFC4C5] bg-transparent py-2 text-sm focus:outline-none focus:border-black"
                />
              </div>
              <div>
                <label className="block text-[11px] text-[#5E5E5E] mb-2">Brand</label>
                <input
                  type="text"
                  name="brand"
                  value={form.brand}
                  onChange={handleChange}
                  placeholder="e.g. Chronos"
                  className="w-full border-0 border-b border-[#CFC4C5] bg-transparent py-2 text-sm focus:outline-none focus:border-black"
                />
              </div>
              <div>
                <label className="block text-[11px] text-[#5E5E5E] mb-2">Model Number</label>
                <input
                  type="text"
                  name="modelNumber"
                  value={form.modelNumber}
                  onChange={handleChange}
                  placeholder="e.g. MC-450"
                  className="w-full border-0 border-b border-[#CFC4C5] bg-transparent py-2 text-sm focus:outline-none focus:border-black"
                />
              </div>
            </div>
          </section>

          {/* Section 02 — Classification */}
          <section>
            <div className="flex items-baseline gap-3 pb-4 border-b border-[#CFC4C5] mb-10">
              <span className="text-[11px] font-semibold tracking-wide text-[#5E5E5E]">02</span>
              <h2
                className="text-xl text-black"
                style={{ fontFamily: "'Libre Caslon Text', serif" }}
              >
                Classification
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
              <div>
                <label className="block text-[11px] text-[#5E5E5E] mb-2">Category</label>
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className="w-full border border-[#CFC4C5] bg-white py-2 px-3 text-sm focus:outline-none focus:border-black"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] text-[#5E5E5E] mb-2">Product For</label>
                <div className="flex items-center gap-6 h-10">
                  {PRODUCT_FOR_OPTIONS.map((option) => (
                    <label key={option} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="productFor"
                        value={option}
                        checked={form.productFor === option}
                        onChange={handleChange}
                        className="accent-black w-3.5 h-3.5"
                      />
                      <span className="text-sm text-[#1A1C1C]">{option}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Section 03 — Inventory & Pricing */}
          <section>
            <div className="flex items-baseline gap-3 pb-4 border-b border-[#CFC4C5] mb-10">
              <span className="text-[11px] font-semibold tracking-wide text-[#5E5E5E]">03</span>
              <h2
                className="text-xl text-black"
                style={{ fontFamily: "'Libre Caslon Text', serif" }}
              >
                Inventory &amp; Pricing
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
              <div>
                <label className="block text-[11px] text-[#5E5E5E] mb-2">Price</label>
                <input
                  type="number"
                  name="price"
                  value={form.price}
                  onChange={handleChange}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  required
                  className="w-full border-0 border-b border-[#CFC4C5] bg-transparent py-2 text-sm focus:outline-none focus:border-black"
                />
              </div>
              <div>
                <label className="block text-[11px] text-[#5E5E5E] mb-2">Stock Quantity</label>
                <input
                  type="number"
                  name="stock"
                  value={form.stock}
                  onChange={handleChange}
                  placeholder="1"
                  min="1"
                  step="1"
                  required
                  className="w-full border-0 border-b border-[#CFC4C5] bg-transparent py-2 text-sm focus:outline-none focus:border-black"
                />
              </div>
            </div>
          </section>

          {/* Section 04 — Content */}
          <section>
            <div className="flex items-baseline gap-3 pb-4 border-b border-[#CFC4C5] mb-10">
              <span className="text-[11px] font-semibold tracking-wide text-[#5E5E5E]">04</span>
              <h2
                className="text-xl text-black"
                style={{ fontFamily: "'Libre Caslon Text', serif" }}
              >
                Content
              </h2>
            </div>

            <div>
              <label className="block text-[11px] text-[#5E5E5E] mb-2">Description</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={4}
                required
                placeholder="Describe the heritage, craftsmanship, and character of this timepiece..."
                className="w-full border border-[#CFC4C5] bg-white p-3 text-sm resize-none focus:outline-none focus:border-black"
              />
            </div>
          </section>

          {/* Section 05 — Technical Specifications */}
          <section>
            <div className="flex items-baseline gap-3 pb-4 border-b border-[#CFC4C5] mb-10">
              <span className="text-[11px] font-semibold tracking-wide text-[#5E5E5E]">05</span>
              <h2
                className="text-xl text-black"
                style={{ fontFamily: "'Libre Caslon Text', serif" }}
              >
                Technical Specifications
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-10">
              <div>
                <label className="block text-[11px] text-[#5E5E5E] mb-2">Case Material</label>
                <input
                  type="text"
                  name="caseMaterial"
                  value={form.caseMaterial}
                  onChange={handleChange}
                  placeholder="18K Rose Gold"
                  className="w-full border-0 border-b border-[#CFC4C5] bg-transparent py-2 text-sm focus:outline-none focus:border-black"
                />
              </div>
              <div>
                <label className="block text-[11px] text-[#5E5E5E] mb-2">Glass Type</label>
                <input
                  type="text"
                  name="glassType"
                  value={form.glassType}
                  onChange={handleChange}
                  placeholder="Anti-Reflective Sapphire"
                  className="w-full border-0 border-b border-[#CFC4C5] bg-transparent py-2 text-sm focus:outline-none focus:border-black"
                />
              </div>
              <div>
                <label className="block text-[11px] text-[#5E5E5E] mb-2">Strap / Bracelet</label>
                <input
                  type="text"
                  name="strapBracelet"
                  value={form.strapBracelet}
                  onChange={handleChange}
                  placeholder="Hand-stitched Alligator"
                  className="w-full border-0 border-b border-[#CFC4C5] bg-transparent py-2 text-sm focus:outline-none focus:border-black"
                />
              </div>
            </div>
          </section>

          {/* Media Assets — pre-filled with existing images, replaceable */}
          <section>
            <h2
              className="text-xl text-black mb-6"
              style={{ fontFamily: "'Libre Caslon Text', serif" }}
            >
              Media Assets
            </h2>

            <UploadCard
              label="Click or drag to replace"
              preview={mainImagePreview || existingMainImage}
              onChange={handleMainImageChange}
              tall
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
              {[0, 1, 2].map((i) => (
                <UploadCard
                  key={i}
                  label="Add Pose"
                  preview={additionalPreviews[i] || existingImages[i]}
                  onChange={handleAdditionalImageChange(i)}
                />
              ))}
            </div>
          </section>

          {error && (
            <p className="text-sm text-[#A32D2D] text-center -mt-16">{error}</p>
          )}

          {/* Buttons */}
          <footer className="pt-16 pb-32 flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              type="submit"
              disabled={submitting}
              className="w-full sm:w-[256px] bg-black text-white py-3 text-sm font-medium uppercase tracking-wide transition-opacity duration-300 hover:opacity-90 active:scale-95 disabled:opacity-50"
            >
              {submitting ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/admin/products')}
              className="w-full sm:w-[256px] border border-black text-black py-3 text-sm font-medium uppercase tracking-wide transition-colors duration-300 hover:bg-black hover:text-white active:scale-95"
            >
              Cancel
            </button>
          </footer>
        </form>
      </div>
    </main>
  );
}