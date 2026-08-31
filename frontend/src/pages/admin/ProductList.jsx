// import { useEffect, useState, useMemo } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { Search, Plus, Pencil, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
// import { useApi } from '../../hooks/useApi';

// const PAGE_SIZE = 5;
// const LOW_STOCK_THRESHOLD = 4;

// function getStockInfo(stock) {
//   if (stock <= 0) return { label: 'Reserved', bg: '#F3F3F4', color: '#5E5E5E' };
//   if (stock < LOW_STOCK_THRESHOLD) return { label: 'Low Stock', bg: '#FAEEDA', color: '#854F0B' };
//   return { label: 'Available', bg: '#EAF3DE', color: '#3B6D11' };
// }

// function StockBadge({ stock }) {
//   const { label, bg, color } = getStockInfo(stock);
//   return (
//     <span
//       className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wide"
//       style={{ backgroundColor: bg, color }}
//     >
//       {label}
//     </span>
//   );
// }

// export default function ProductList() {
//   const navigate = useNavigate();
//   const { get, del, loading, error } = useApi();

//   const [products, setProducts] = useState([]);
//   const [search, setSearch] = useState('');
//   const [page, setPage] = useState(1);
//   const [deletingId, setDeletingId] = useState(null);

//   useEffect(() => {
//     const fetchProducts = async () => {
//       try {
//         const data = await get('/apiproduct/getallproducts');
//         setProducts(Array.isArray(data) ? data : data.products || []);
//       } catch (err) {
//         // error already captured by useApi
//       }
//     };
//     fetchProducts();
//   }, []); // eslint-disable-line react-hooks/exhaustive-deps

//   const filteredProducts = useMemo(() => {
//     const query = search.trim().toLowerCase();
//     if (!query) return products;
//     return products.filter((p) =>
//       [p.modelName, p.sku, p.brand, p.modelNumber, p.category, p.productFor]
//         .filter(Boolean)
//         .some((field) => field.toLowerCase().includes(query))
//     );
//   }, [products, search]);

//   const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));
//   const currentPage = Math.min(page, totalPages);
//   const paginatedProducts = filteredProducts.slice(
//     (currentPage - 1) * PAGE_SIZE,
//     currentPage * PAGE_SIZE
//   );

//   const handleDelete = async (id) => {
//     if (!window.confirm('Remove this product from the catalogue?')) return;
//     setDeletingId(id);
//     try {
//       await del(`/apiproduct/deleteproduct/${id}`);
//       setProducts((prev) => prev.filter((p) => p._id !== id));
//     } catch (err) {
    
//     } finally {
//       setDeletingId(null);
//     }
//   };

//   return (
//     <main
//       className="min-h-screen max-w-[1440px] mx-auto px-10 py-12 bg-[#F9F9F9] text-[#1A1C1C]"
//       style={{ fontFamily: "'Work Sans', sans-serif" }}
//     >
//       <div className="w-full max-w-[1440px] mx-auto">

//         {/* Page Header */}
//         <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-6 mb-12">
//           <div>
//             <h1
//               className="text-[32px] leading-10 font-normal text-black mb-2"
//               style={{ fontFamily: "'Libre Caslon Text', serif" }}
//             >
//               Product Catalogue
//             </h1>
//           </div>

//           <div className="flex items-center gap-4 flex-wrap sm:flex-nowrap">
//             {/* Search */}
//             <div className="flex items-center gap-2 w-[256px] border-b border-[#CFC4C5] pb-1 focus-within:opacity-80 transition-opacity duration-300">
//               <Search size={16} className="text-[#5E5E5E]" />
//               <input
//                 type="text"
//                 value={search}
//                 onChange={(e) => {
//                   setSearch(e.target.value);
//                   setPage(1);
//                 }}
//                 placeholder="Search catalogue..."
//                 className="w-full bg-transparent text-sm focus:outline-none placeholder:text-[#5E5E5E]"
//               />
//             </div>

//             {/* Add Button */}
//             <button
//               onClick={() => navigate('/admin/add')}
//               className="flex items-center gap-2 bg-black text-white px-8 py-3 text-[11px] font-medium uppercase tracking-[0.1em] transition-transform duration-200 hover:scale-[1.02] active:scale-95"
//             >
//               <Plus size={14} />
//               Add Product
//             </button>
//           </div>
//         </div>

//         {/* Product Table */}
//         <div className="bg-white border border-[#CFC4C5] overflow-hidden">
//           <div className="overflow-x-auto">
//             <table className="w-full text-left border-collapse min-w-[900px]">
//               <thead>
//                 <tr className="bg-[#EEEEEE] border-b border-[#CFC4C5]">
//                   {['Image', 'Product', 'SKU / Brand', 'Model No.', 'Category', 'Price', 'Stock', 'Actions'].map((h) => (
//                     <th
//                       key={h}
//                       className="px-6 py-5 text-[11px] font-normal uppercase tracking-[0.1em] text-[#1A1C1C]"
//                     >
//                       {h}
//                     </th>
//                   ))}
//                 </tr>
//               </thead>
//               <tbody>
//                 {loading && (
//                   <tr>
//                     <td colSpan={8} className="px-6 py-12 text-center text-sm text-[#5E5E5E]">
//                       Loading products...
//                     </td>
//                   </tr>
//                 )}

//                 {!loading && error && (
//                   <tr>
//                     <td colSpan={8} className="px-6 py-12 text-center text-sm text-[#A32D2D]">
//                       {error}
//                     </td>
//                   </tr>
//                 )}

//                 {!loading && !error && paginatedProducts.length === 0 && (
//                   <tr>
//                     <td colSpan={8} className="px-6 py-12 text-center text-sm text-[#5E5E5E]">
//                       No products found.
//                     </td>
//                   </tr>
//                 )}

//                 {!loading && !error && paginatedProducts.map((p) => (
//                   <tr
//                     key={p._id}
//                     className="border-b border-[#CFC4C5] last:border-b-0 transition-all duration-200 hover:bg-[#F3F3F4] hover:translate-x-1"
//                   >
//                     {/* Image */}
//                     <td className="px-6 py-6">
//                       <div className="w-16 h-16 border border-[#CFC4C5] overflow-hidden">
//                         <img
//                           src={p.mainImage}
//                           alt={p.modelName}
//                           className="w-full h-full object-cover"
//                         />
//                       </div>
//                     </td>

//                     {/* Product Details */}
//                     <td className="px-6 py-6">
//                       <p
//                         className="text-lg text-black"
//                         style={{ fontFamily: "'Libre Caslon Text', serif" }}
//                       >
//                         {p.modelName}
//                       </p>
//                       <p className="text-xs text-[#5E5E5E] mt-1">{p.category}</p>
//                     </td>

//                     {/* SKU & Brand */}
//                     <td className="px-6 py-6">
//                       <p className="text-sm font-bold text-black">{p.sku}</p>
//                       <p className="text-xs text-[#5E5E5E] mt-1">{p.brand}</p>
//                     </td>

//                     {/* Model Number */}
//                     <td className="px-6 py-6">
//                       <p className="text-sm text-[#1A1C1C]">{p.modelNumber}</p>
//                     </td>

//                     {/* Category Details */}
//                     <td className="px-6 py-6">
//                       <p className="text-sm text-[#1A1C1C]">{p.category}</p>
//                       <p className="text-xs text-[#5E5E5E] mt-1">{p.productFor}</p>
//                     </td>

//                     {/* Price */}
//                     <td className="px-6 py-6 text-right">
//                       <p
//                         className="text-lg text-black"
//                         style={{ fontFamily: "'Libre Caslon Text', serif" }}
//                       >
//                         ${Number(p.price).toLocaleString()}
//                       </p>
//                     </td>

//                     {/* Stock Status */}
//                     <td className="px-6 py-6">
//                       <StockBadge stock={p.stock} />
//                     </td>

//                     {/* Edit & Delete */}
//                     <td className="px-6 py-6">
//                       <div className="flex items-center gap-4">
//                         <button
//                           onClick={() => navigate(`/admin/edit/${p._id}`)}
//                           className="text-[#5E5E5E] hover:text-black transition-colors duration-200"
//                           aria-label="Edit product"
//                         >
//                           <Pencil size={16} />
//                         </button>
//                         <button
//                           onClick={() => handleDelete(p._id)}
//                           disabled={deletingId === p._id}
//                           className="text-[#5E5E5E] hover:text-[#A32D2D] transition-colors duration-200 disabled:opacity-40"
//                           aria-label="Delete product"
//                         >
//                           <Trash2 size={16} />
//                         </button>
//                       </div>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>

//           {/* Pagination */}
//           <div className="flex justify-between items-center px-6 py-4 bg-[#EEEEEE] border-t border-[#CFC4C5]">
//             <p className="text-sm text-[#5E5E5E]">
//               {filteredProducts.length === 0
//                 ? 'Showing 0 products'
//                 : `Showing ${(currentPage - 1) * PAGE_SIZE + 1} to ${Math.min(
//                     currentPage * PAGE_SIZE,
//                     filteredProducts.length
//                   )} of ${filteredProducts.length} products`}
//             </p>

//             <div className="flex items-center gap-2">
//               <button
//                 onClick={() => setPage((p) => Math.max(1, p - 1))}
//                 disabled={currentPage === 1}
//                 className="w-10 h-10 flex items-center justify-center border border-[#CFC4C5] bg-white hover:bg-[#F3F3F4] transition-colors duration-200 disabled:opacity-40"
//                 aria-label="Previous page"
//               >
//                 <ChevronLeft size={16} />
//               </button>

//               {[...Array(totalPages)].map((_, i) => {
//                 const pageNum = i + 1;
//                 const isActive = pageNum === currentPage;
//                 return (
//                   <button
//                     key={pageNum}
//                     onClick={() => setPage(pageNum)}
//                     className={`w-10 h-10 flex items-center justify-center border text-sm transition-colors duration-200 ${
//                       isActive
//                         ? 'bg-black text-white border-black'
//                         : 'bg-white text-[#1A1C1C] border-[#CFC4C5] hover:bg-[#F3F3F4]'
//                     }`}
//                   >
//                     {pageNum}
//                   </button>
//                 );
//               })}

//               <button
//                 onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
//                 disabled={currentPage === totalPages}
//                 className="w-10 h-10 flex items-center justify-center border border-[#CFC4C5] bg-white hover:bg-[#F3F3F4] transition-colors duration-200 disabled:opacity-40"
//                 aria-label="Next page"
//               >
//                 <ChevronRight size={16} />
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     </main>
//   );
// }

import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Pencil, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useApi } from '../../hooks/useApi';

const PAGE_SIZE = 5;
const LOW_STOCK_THRESHOLD = 4;

function getStockInfo(stock) {
  if (stock <= 0) return { label: 'Reserved', bg: '#F3F3F4', color: '#5E5E5E' };
  if (stock < LOW_STOCK_THRESHOLD) return { label: 'Low Stock', bg: '#FAEEDA', color: '#854F0B' };
  return { label: 'Available', bg: '#EAF3DE', color: '#3B6D11' };
}

function StockBadge({ stock }) {
  const { label, bg, color } = getStockInfo(stock);
  return (
    <span
      className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wide whitespace-nowrap"
      style={{ backgroundColor: bg, color }}
    >
      {label}
    </span>
  );
}

export default function ProductList() {
  const navigate = useNavigate();
  const { get, del, loading, error } = useApi();

  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await get('/apiproduct/getallproducts');
        setProducts(Array.isArray(data) ? data : data.products || []);
      } catch (err) {
        // error already captured by useApi
      }
    };
    fetchProducts();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return products;
    return products.filter((p) =>
      [p.modelName, p.sku, p.brand, p.modelNumber, p.category, p.productFor]
        .filter(Boolean)
        .some((field) => field.toLowerCase().includes(query))
    );
  }, [products, search]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this product from the catalogue?')) return;
    setDeletingId(id);
    try {
      await del(`/apiproduct/deleteproduct/${id}`);
      setProducts((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
    
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <main
      className="min-h-screen max-w-[1440px] mx-auto px-4 py-8 sm:px-6 sm:py-10 lg:px-10 lg:py-12 bg-[#F9F9F9] text-[#1A1C1C]"
      style={{ fontFamily: "'Work Sans', sans-serif" }}
    >
      <div className="w-full max-w-[1440px] mx-auto">

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-6 mb-8 sm:mb-10 lg:mb-12">
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
              <Search size={16} className="text-[#5E5E5E] flex-shrink-0" />
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

        {/* Product Table */}
        <div className="bg-white border border-[#CFC4C5] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-[#EEEEEE] border-b border-[#CFC4C5]">
                  {['Image', 'Product', 'SKU / Brand', 'Model No.', 'Category', 'Price', 'Stock', 'Actions'].map((h) => (
                    <th
                      key={h}
                      className="px-6 py-5 text-[11px] font-normal uppercase tracking-[0.1em] text-[#1A1C1C] whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-sm text-[#5E5E5E]">
                      Loading products...
                    </td>
                  </tr>
                )}

                {!loading && error && (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-sm text-[#A32D2D]">
                      {error}
                    </td>
                  </tr>
                )}

                {!loading && !error && paginatedProducts.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-sm text-[#5E5E5E]">
                      No products found.
                    </td>
                  </tr>
                )}

                {!loading && !error && paginatedProducts.map((p) => (
                  <tr
                    key={p._id}
                    className="border-b border-[#CFC4C5] last:border-b-0 transition-all duration-200 hover:bg-[#F3F3F4] hover:translate-x-1"
                  >
                    {/* Image */}
                    <td className="px-6 py-6">
                      <div className="w-16 h-16 border border-[#CFC4C5] overflow-hidden">
                        <img
                          src={p.mainImage}
                          alt={p.modelName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </td>

                    {/* Product Details */}
                    <td className="px-6 py-6">
                      <p
                        className="text-lg text-black whitespace-nowrap"
                        style={{ fontFamily: "'Libre Caslon Text', serif" }}
                      >
                        {p.modelName}
                      </p>
                      <p className="text-xs text-[#5E5E5E] mt-1 whitespace-nowrap">{p.category}</p>
                    </td>

                    {/* SKU & Brand */}
                    <td className="px-6 py-6">
                      <p className="text-sm font-bold text-black whitespace-nowrap">{p.sku}</p>
                      <p className="text-xs text-[#5E5E5E] mt-1 whitespace-nowrap">{p.brand}</p>
                    </td>

                    {/* Model Number */}
                    <td className="px-6 py-6">
                      <p className="text-sm text-[#1A1C1C] whitespace-nowrap">{p.modelNumber}</p>
                    </td>

                    {/* Category Details */}
                    <td className="px-6 py-6">
                      <p className="text-sm text-[#1A1C1C] whitespace-nowrap">{p.category}</p>
                      <p className="text-xs text-[#5E5E5E] mt-1 whitespace-nowrap">{p.productFor}</p>
                    </td>

                    {/* Price */}
                    <td className="px-6 py-6 text-right">
                      <p
                        className="text-lg text-black whitespace-nowrap"
                        style={{ fontFamily: "'Libre Caslon Text', serif" }}
                      >
                        ₹{Number(p.price).toLocaleString()}
                      </p>
                    </td>

                    {/* Stock Status */}
                    <td className="px-6 py-6">
                      <StockBadge stock={p.stock} />
                    </td>

                    {/* Edit & Delete */}
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => navigate(`/admin/edit/${p._id}`)}
                          className="text-[#5E5E5E] hover:text-black transition-colors duration-200"
                          aria-label="Edit product"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(p._id)}
                          disabled={deletingId === p._id}
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

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 px-4 py-4 sm:px-6 bg-[#EEEEEE] border-t border-[#CFC4C5]">
            <p className="text-sm text-[#5E5E5E]">
              {filteredProducts.length === 0
                ? 'Showing 0 products'
                : `Showing ${(currentPage - 1) * PAGE_SIZE + 1} to ${Math.min(
                    currentPage * PAGE_SIZE,
                    filteredProducts.length
                  )} of ${filteredProducts.length} products`}
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
        </div>
      </div>
    </main>
  );
}