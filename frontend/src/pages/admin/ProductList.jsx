import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useApi } from '../../hooks/useApi';

const PAGE_SIZE = 5;
const LOW_STOCK_THRESHOLD = 4;

const STOCK_FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'available', label: 'Available' },
  { key: 'low', label: 'Low Stock' },
];

function getStockInfo(stock) {
  const stockValue = Number(stock || 0);

  if (stockValue <= 0) {
    return {
      key: 'reserved',
      label: 'Reserved',
      bg: '#F3F3F4',
      color: '#5E5E5E',
    };
  }

  if (stockValue < LOW_STOCK_THRESHOLD) {
    return {
      key: 'low',
      label: 'Low Stock',
      bg: '#FAEEDA',
      color: '#854F0B',
    };
  }

  return {
    key: 'available',
    label: 'Available',
    bg: '#EAF3DE',
    color: '#3B6D11',
  };
}

function StockBadge({ stock }) {
  const { label, bg, color } = getStockInfo(stock);

  return (
    <span
      className="inline-block px-3 py-1 text-[10px] font-semibold uppercase tracking-wide whitespace-nowrap"
      style={{ backgroundColor: bg, color }}
    >
      {label}
    </span>
  );
}

function Pagination({
  currentPage,
  totalPages,
  setPage,
  filteredCount,
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 px-4 py-4 sm:px-6 bg-[#EEEEEE] border-t border-[#CFC4C5]">
      <p className="text-sm text-[#5E5E5E]">
        {filteredCount === 0
          ? 'Showing 0 products'
          : `Showing ${(currentPage - 1) * PAGE_SIZE + 1} to ${Math.min(
              currentPage * PAGE_SIZE,
              filteredCount
            )} of ${filteredCount} products`}
      </p>

      <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={currentPage === 1}
          className="w-10 h-10 flex items-center justify-center border border-[#CFC4C5] bg-white hover:bg-[#F3F3F4] transition-colors duration-200 disabled:opacity-40"
          aria-label="Previous page"
        >
          <ChevronLeft size={16} />
        </button>

        {[...Array(totalPages)].map((_, i) => {
          const pageNum = i + 1;
          const isActive = pageNum === currentPage;

          return (
            <button
              key={pageNum}
              onClick={() => setPage(pageNum)}
              className={`w-10 h-10 flex items-center justify-center border text-sm transition-colors duration-200 ${
                isActive
                  ? 'bg-black text-white border-black'
                  : 'bg-white text-[#1A1C1C] border-[#CFC4C5] hover:bg-[#F3F3F4]'
              }`}
            >
              {pageNum}
            </button>
          );
        })}

        <button
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={currentPage === totalPages}
          className="w-10 h-10 flex items-center justify-center border border-[#CFC4C5] bg-white hover:bg-[#F3F3F4] transition-colors duration-200 disabled:opacity-40"
          aria-label="Next page"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}

export default function ProductList() {
  const navigate = useNavigate();
  const { get, del, loading, error } = useApi();

  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [stockFilter, setStockFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await get('/apiproduct/getallproducts');

        setProducts(
          Array.isArray(data)
            ? data
            : Array.isArray(data?.products)
              ? data.products
              : []
        );
      } catch (err) {
        // Error is already handled by useApi
      }
    };

    fetchProducts();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    return products.filter((p) => {
      const matchesSearch =
        !query ||
        [
          p.modelName,
          p.sku,
          p.brand,
          p.modelNumber,
          p.category,
          p.productFor,
        ]
          .filter(Boolean)
          .some((field) =>
            String(field).toLowerCase().includes(query)
          );

      const matchesStock =
        stockFilter === 'all' ||
        getStockInfo(p.stock).key === stockFilter;

      return matchesSearch && matchesStock;
    });
  }, [products, search, stockFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredProducts.length / PAGE_SIZE)
  );

  useEffect(() => {
    setPage((currentPage) =>
      Math.min(currentPage, totalPages)
    );
  }, [totalPages]);

  const paginatedProducts = filteredProducts.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  const handleStockFilterChange = (key) => {
    setStockFilter(key);
    setPage(1);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this product from the catalogue?')) {
      return;
    }

    setDeletingId(id);

    try {
      await del(`/apiproduct/deleteproduct/${id}`);

      setProducts((prev) =>
        prev.filter((p) => p._id !== id)
      );
    } catch (err) {
      // Error is already handled by useApi
    } finally {
      setDeletingId(null);
    }
  };

  const formatPrice = (price) =>
    `₹${Number(price || 0).toLocaleString('en-IN')}`;

  return (
    <main
      className="min-h-screen max-w-[1440px] mx-auto px-4 py-8 sm:px-6 sm:py-10 lg:px-10 lg:py-12 bg-[#F9F9F9] text-[#1A1C1C]"
      style={{ fontFamily: "'Work Sans', sans-serif" }}
    >
      <div className="w-full max-w-[1440px] mx-auto">

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-6 mb-6">
          <div>
            <h1
              className="text-[26px] leading-9 sm:text-[32px] sm:leading-10 font-normal text-black mb-2"
              style={{ fontFamily: "'Libre Caslon Text', serif" }}
            >
              Product Catalogue
            </h1>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto">

            {/* Search */}
            <div className="flex items-center gap-2 w-full sm:w-[256px] border-b border-[#CFC4C5] pb-1 focus-within:opacity-80 transition-opacity duration-300">
              <Search
                size={16}
                className="text-[#5E5E5E] flex-shrink-0"
              />

              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search catalogue..."
                className="w-full bg-transparent text-sm focus:outline-none placeholder:text-[#5E5E5E]"
              />
            </div>

            {/* Add Button */}
            <button
              onClick={() => navigate('/admin/add')}
              className="flex items-center justify-center gap-2 bg-black text-white px-8 py-3 text-[11px] font-medium uppercase tracking-[0.1em] transition-transform duration-200 hover:scale-[1.02] active:scale-95 whitespace-nowrap"
            >
              <Plus size={14} />
              Add Product
            </button>
          </div>
        </div>

        {/* Stock Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2 mb-8 sm:mb-10 lg:mb-12">
          {STOCK_FILTERS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => handleStockFilterChange(key)}
              className={`text-[11px] uppercase tracking-wide px-4 py-2 rounded-full border transition-colors duration-200 ${
                stockFilter === key
                  ? 'bg-black text-white border-black'
                  : 'bg-white text-[#5E5E5E] border-[#CFC4C5] hover:border-black hover:text-black'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Loading */}
        {loading && (
          <div className="bg-white border border-[#CFC4C5] p-10 text-center text-sm text-[#5E5E5E]">
            Loading products...
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="bg-white border border-[#CFC4C5] p-10 text-center text-sm text-[#A32D2D]">
            {error}
          </div>
        )}

        {/* Empty */}
        {!loading &&
          !error &&
          paginatedProducts.length === 0 && (
            <div className="bg-white border border-[#CFC4C5] p-10 text-center text-sm text-[#5E5E5E]">
              No products found.
            </div>
          )}

        {/* Products */}
        {!loading &&
          !error &&
          paginatedProducts.length > 0 && (
            <>
              {/* ============================= */}
              {/* DESKTOP TABLE */}
              {/* ============================= */}
              <div className="hidden md:block bg-white border border-[#CFC4C5] overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full table-fixed text-left border-collapse min-w-[900px]">

                    <colgroup>
                      <col style={{ width: '8%' }} />
                      <col style={{ width: '19%' }} />
                      <col style={{ width: '17%' }} />
                      <col style={{ width: '13%' }} />
                      <col style={{ width: '13%' }} />
                      <col style={{ width: '11%' }} />
                      <col style={{ width: '10%' }} />
                      <col style={{ width: '9%' }} />
                    </colgroup>

                    <thead>
                      <tr className="bg-[#EEEEEE] border-b border-[#CFC4C5]">
                        {[
                          'Image',
                          'Product',
                          'SKU / Brand',
                          'Model No.',
                          'Category',
                          'Price',
                          'Stock',
                          'Actions',
                        ].map((h) => (
                          <th
                            key={h}
                            className={`px-4 xl:px-6 py-5 text-[11px] font-normal uppercase tracking-[0.1em] text-[#1A1C1C] whitespace-nowrap ${
                              h === 'Price' ||
                              h === 'Stock' ||
                              h === 'Actions'
                                ? 'text-center'
                                : 'text-left'
                            }`}
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>

                    <tbody>
                      {paginatedProducts.map((p) => (
                        <tr
                          key={p._id}
                          className="border-b border-[#CFC4C5] last:border-b-0 h-[92px] transition-colors duration-200 hover:bg-[#F3F3F4]"
                        >
                          {/* Image */}
                          <td className="px-4 xl:px-6 py-4 align-middle">
                            <div className="w-16 h-16 border border-[#CFC4C5] overflow-hidden">
                              <img
                                src={p.mainImage}
                                alt={p.modelName}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          </td>

                          {/* Product */}
                          <td className="px-4 xl:px-6 py-4 align-middle overflow-hidden">
                            <p
                              className="text-lg text-black truncate"
                              style={{
                                fontFamily:
                                  "'Libre Caslon Text', serif",
                              }}
                              title={p.modelName}
                            >
                              {p.modelName}
                            </p>

                            <p className="text-xs text-[#5E5E5E] mt-1 truncate">
                              {p.category}
                            </p>
                          </td>

                          {/* SKU / Brand */}
                          <td className="px-4 xl:px-6 py-4 align-middle overflow-hidden">
                            <p
                              className="text-sm font-bold text-black truncate"
                              title={p.sku}
                            >
                              {p.sku}
                            </p>

                            <p className="text-xs text-[#5E5E5E] mt-1 truncate">
                              {p.brand}
                            </p>
                          </td>

                          {/* Model Number */}
                          <td className="px-4 xl:px-6 py-4 align-middle overflow-hidden">
                            <p
                              className="text-sm text-[#1A1C1C] truncate"
                              title={p.modelNumber}
                            >
                              {p.modelNumber}
                            </p>
                          </td>

                          {/* Category */}
                          <td className="px-4 xl:px-6 py-4 align-middle overflow-hidden">
                            <p className="text-sm text-[#1A1C1C] truncate">
                              {p.category}
                            </p>

                            <p className="text-xs text-[#5E5E5E] mt-1 truncate">
                              {p.productFor}
                            </p>
                          </td>

                          {/* Price */}
                          <td className="px-4 xl:px-6 py-4 text-center align-middle">
                            <p
                              className="text-lg text-black whitespace-nowrap"
                              style={{
                                fontFamily:
                                  "'Libre Caslon Text', serif",
                              }}
                            >
                              {formatPrice(p.price)}
                            </p>
                          </td>

                          {/* Stock */}
                          <td className="px-4 xl:px-6 py-4 align-middle text-center">
                            <StockBadge stock={p.stock} />
                          </td>

                          {/* Actions */}
                          <td className="px-4 xl:px-6 py-4 align-middle">
                            <div className="flex items-center justify-center gap-4">
                              <button
                                onClick={() =>
                                  navigate(
                                    `/admin/edit/${p._id}`
                                  )
                                }
                                className="text-[#5E5E5E] hover:text-black transition-colors duration-200"
                                aria-label="Edit product"
                              >
                                <Pencil size={16} />
                              </button>

                              <button
                                onClick={() =>
                                  handleDelete(p._id)
                                }
                                disabled={
                                  deletingId === p._id
                                }
                                className="text-[#5E5E5E] hover:text-[#A32D2D] transition-colors duration-200 disabled:opacity-40"
                                aria-label="Delete product"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Desktop Pagination */}
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  setPage={setPage}
                  filteredCount={filteredProducts.length}
                />
              </div>

              {/* ============================= */}
              {/* MOBILE / TABLET CARDS */}
              {/* ============================= */}
              <div className="md:hidden space-y-4">
                {paginatedProducts.map((p) => (
                  <div
                    key={p._id}
                    className="bg-white border border-[#CFC4C5] p-4 sm:p-5"
                  >
                    {/* Product Header */}
                    <div className="flex gap-4">
                      <img
                        src={p.mainImage}
                        alt={p.modelName}
                        className="w-20 h-20 sm:w-24 sm:h-24 object-cover border border-[#CFC4C5] flex-shrink-0"
                      />

                      <div className="min-w-0 flex-1">
                        <p
                          className="text-base text-black leading-6 break-words"
                          style={{
                            fontFamily:
                              "'Libre Caslon Text', serif",
                          }}
                        >
                          {p.modelName}
                        </p>

                        <p className="text-[11px] text-[#5E5E5E] mt-1">
                          {p.category}
                        </p>

                        <p className="text-xs text-black mt-3 break-all">
                          SKU: {p.sku}
                        </p>

                        <p className="text-[11px] text-[#5E5E5E] mt-1">
                          {p.brand}
                        </p>
                      </div>
                    </div>

                    {/* Product Information */}
                    <div className="grid grid-cols-2 gap-x-4 gap-y-4 mt-5 pt-4 border-t border-[#E2DADB]">

                      {/* Model */}
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.08em] text-[#6B6B6B] mb-1">
                          Model No.
                        </p>

                        <p className="text-xs text-black break-all">
                          {p.modelNumber}
                        </p>
                      </div>

                      {/* Category */}
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.08em] text-[#6B6B6B] mb-1">
                          Category
                        </p>

                        <p className="text-xs text-black">
                          {p.category}
                        </p>

                        <p className="text-[11px] text-[#5E5E5E] mt-1">
                          {p.productFor}
                        </p>
                      </div>

                      {/* Price */}
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.08em] text-[#6B6B6B] mb-1">
                          Price
                        </p>

                        <p
                          className="text-lg text-black"
                          style={{
                            fontFamily:
                              "'Libre Caslon Text', serif",
                          }}
                        >
                          {formatPrice(p.price)}
                        </p>
                      </div>

                      {/* Stock */}
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.08em] text-[#6B6B6B] mb-1">
                          Stock
                        </p>

                        <StockBadge stock={p.stock} />
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 mt-5 pt-4 border-t border-[#E2DADB]">
                      <button
                        onClick={() =>
                          navigate(`/admin/edit/${p._id}`)
                        }
                        className="flex-1 flex items-center justify-center gap-2 border border-[#CFC4C5] py-2.5 text-[10px] uppercase tracking-[0.1em] text-black hover:bg-black hover:text-white transition"
                      >
                        <Pencil size={13} />
                        Edit
                      </button>

                      <button
                        onClick={() => handleDelete(p._id)}
                        disabled={deletingId === p._id}
                        className="flex-1 flex items-center justify-center gap-2 border border-[#CFC4C5] py-2.5 text-[10px] uppercase tracking-[0.1em] text-red-600 hover:bg-red-600 hover:text-white transition disabled:opacity-50"
                      >
                        <Trash2 size={13} />
                        Delete
                      </button>
                    </div>
                  </div>
                ))}

                {/* Mobile Pagination */}
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  setPage={setPage}
                  filteredCount={filteredProducts.length}
                />
              </div>
            </>
          )}
      </div>
    </main>
  );
}