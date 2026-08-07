import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TriangleAlert,
  ArrowRight,
  Filter,
  ArrowUpDown,
} from 'lucide-react';
import { useApi } from '../../hooks/useApi';

function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(isoString) {
  return new Date(isoString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

const LOW_STOCK_THRESHOLD = 4;

function getStockStatus(stock) {
  if (stock <= 0) return 'out_of_stock';
  if (stock < LOW_STOCK_THRESHOLD) return 'low_stock';
  return 'in_stock';
}

function NotificationBadge({ stock }) {
  const status = getStockStatus(stock);
  const isOut = status === 'out_of_stock';
  return (
    <span
      className={`px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider
        ${isOut ? 'bg-[#FCEBEB] text-[#A32D2D]' : 'bg-[#FAEEDA] text-[#854F0B]'}`}
    >
      {isOut ? 'Out of Stock' : 'Low Stock'}
    </span>
  );
}

function StatusBadge({ status }) {
  const base = 'inline-flex items-center px-3 py-1 rounded-full text-[11px] font-medium uppercase tracking-wide';
  if (status === 'delivered') {
    return <span className={`${base} bg-black text-white`}>Delivered</span>;
  }
  if (status === 'shipped') {
    return (
      <span className={`${base} border border-[#CFC4C5] text-[#1A1C1C] opacity-70`}>
        Shipped
      </span>
    );
  }
  return <span className={`${base} border border-black text-black`}>Processing</span>;
}

function DashboardSkeleton() {
  return (
    <div className="animate-pulse flex flex-col gap-16">
      <div className="h-10 w-64 bg-[#E5E5E5] rounded" />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-32 bg-[#E5E5E5] rounded" />
        ))}
      </div>
      <div className="h-64 bg-[#E5E5E5] rounded" />
    </div>
  );
}

const SORT_MODES = [
  { key: 'date-desc', label: 'Newest first' },
  { key: 'date-asc', label: 'Oldest first' },
  { key: 'amount-desc', label: 'Highest amount' },
  { key: 'amount-asc', label: 'Lowest amount' },
];

export default function AdminDashboard() {
  const { get, loading, error } = useApi();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [dismissedSkus, setDismissedSkus] = useState(new Set());
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortIndex, setSortIndex] = useState(0);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const result = await get('/api/admin/dashboard');
        setData(result);
      } catch (err) {
        // error state already captured by useApi
      }
    };
    fetchDashboard();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const visibleOrders = useMemo(() => {
    if (!data) return [];

    const filtered = data.recentOrders.filter(
      (o) => statusFilter === 'all' || o.status === statusFilter
    );

    const mode = SORT_MODES[sortIndex].key;
    return [...filtered].sort((a, b) => {
      if (mode === 'date-desc') return new Date(b.date) - new Date(a.date);
      if (mode === 'date-asc') return new Date(a.date) - new Date(b.date);
      if (mode === 'amount-desc') return b.amount - a.amount;
      return a.amount - b.amount;
    });
  }, [data, statusFilter, sortIndex]);

  const visibleAlerts = useMemo(() => {
    if (!data) return [];
    return data.inventoryAlerts
      .filter((n) => getStockStatus(n.stock) !== 'in_stock')
      .filter((n) => !dismissedSkus.has(n.sku));
  }, [data, dismissedSkus]);

  return (
    <main
      className="min-h-screen max-w-[1440px] mx-auto px-10 py-10 bg-[#F9F9F9] text-[#1A1C1C]"
      style={{ fontFamily: "'Work Sans', sans-serif" }}
    >
      <div className="w-full max-w-[1440px] mx-auto flex flex-col gap-16">
        {loading && <DashboardSkeleton />}

        {!loading && error && (
          <div className="bg-white border border-[#CFC4C5] p-8 text-center">
            <p className="text-sm text-[#A32D2D]">Couldn't load dashboard data: {error}</p>
          </div>
        )}

        {!loading && !error && data && (
          <>
            {/* Hero Header */}
            <div className="flex justify-between items-end">
              <div>
                <h1
                  className="text-[32px] leading-10 font-normal text-black"
                  style={{ fontFamily: "'Libre Caslon Text', serif" }}
                >
                  Operational Overview
                </h1>
                <p className="text-sm text-[#5E5E5E] max-w-[420px] mt-2 opacity-70">
                  A snapshot of revenue, orders, and inventory health across your store.
                </p>
              </div>
            </div>

            {/* Matrix Overview Section — 3 columns: orders, revenue, customers */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              {data.metrics.map((m) => (
                <div
                  key={m.label}
                  className="bg-white p-8 border-l border-black shadow-sm transition-transform duration-300 ease-in-out hover:-translate-y-0.5"
                >
                  <p className="text-[11px] font-normal uppercase text-[#5E5E5E] tracking-wide">
                    {m.label}
                  </p>
                  <p
                    className="text-[30px] text-black mt-3"
                    style={{ fontFamily: "'Libre Caslon Text', serif" }}
                  >
                    {m.format === 'currency' ? formatCurrency(m.value) : m.value}
                  </p>
                </div>
              ))}
            </div>

            {/* Inventory Notification Section — only renders when alerts exist */}
            {visibleAlerts.length > 0 && (
              <div className="flex flex-col gap-6">
                <div className="flex justify-between items-center">
                  <h2
                    className="text-2xl text-black"
                    style={{ fontFamily: "'Libre Caslon Text', serif" }}
                  >
                    Inventory Notifications
                  </h2>
                  <button
                    onClick={() =>
                      setDismissedSkus(
                        (prev) => new Set([...prev, ...data.inventoryAlerts.map((a) => a.sku)])
                      )
                    }
                    className="text-[10px] font-normal uppercase text-black tracking-wide transition-opacity duration-300 hover:opacity-60"
                  >
                    Mark all as read
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {visibleAlerts.map((n) => (
                    <div
                      key={n.sku}
                      className="bg-white p-6 border border-[#CFC4C5] shadow-sm flex flex-col gap-4"
                    >
                      <div className="flex items-start justify-between">
                        <NotificationBadge stock={n.stock} />
                        <TriangleAlert
                          size={18}
                          style={{ color: getStockStatus(n.stock) === 'out_of_stock' ? '#A32D2D' : '#854F0B' }}
                        />
                      </div>

                      <div>
                        <h3
                          className="text-2xl text-black"
                          style={{ fontFamily: "'Libre Caslon Text', serif" }}
                        >
                          {n.name}
                        </h3>
                        <p className="text-[10px] uppercase text-[#5E5E5E] tracking-wide mt-1">
                          {n.sku}
                        </p>
                      </div>

                      <div className="flex justify-between items-center pt-4 border-t border-[#CFC4C5]">
                        <span className="text-[11px] uppercase text-[#5E5E5E] tracking-wide">
                          Current stock
                        </span>
                        <span className="text-sm font-semibold text-black">{n.stock}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Commissions Section */}
            <div className="flex flex-col gap-6">
              <div className="flex justify-between items-center">
                <h2
                  className="text-2xl text-black"
                  style={{ fontFamily: "'Libre Caslon Text', serif" }}
                >
                  Recent Commissions
                </h2>
                <div className="flex items-center gap-6">
                  {/* Filter — by order status */}
                  <div className="flex items-center gap-1.5">
                    <Filter size={14} className="text-[#5E5E5E]" />
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="text-[10px] font-normal uppercase text-[#5E5E5E] tracking-wide bg-transparent border-none cursor-pointer transition-opacity duration-300 hover:opacity-60 focus:outline-none"
                    >
                      <option value="all">All</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                    </select>
                  </div>

                  {/* Sort — cycles date/amount, asc/desc */}
                  <button
                    onClick={() => setSortIndex((i) => (i + 1) % SORT_MODES.length)}
                    className="flex items-center gap-1.5 text-[10px] font-normal uppercase text-[#5E5E5E] tracking-wide transition-opacity duration-300 hover:opacity-60"
                    title={SORT_MODES[sortIndex].label}
                  >
                    <ArrowUpDown size={14} />
                    Sort: {SORT_MODES[sortIndex].label}
                  </button>
                </div>
              </div>

              {/* Order Data Table */}
              <div className="bg-white border-t border-black shadow-sm overflow-hidden">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-[#CFC4C5]">
                      {['Order ID', 'Customer', 'Date', 'Amount', 'Status', 'Actions'].map((h) => (
                        <th
                          key={h}
                          className="text-left px-6 py-4 text-[10px] font-normal uppercase opacity-60"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {visibleOrders.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-sm text-[#5E5E5E]">
                          No orders match this filter.
                        </td>
                      </tr>
                    ) : (
                      visibleOrders.map((o) => (
                        <tr key={o.id} className="border-b border-[#CFC4C5]/60 last:border-b-0">
                          <td className="px-6 py-4 text-sm font-bold text-black">#{o.id}</td>
                          <td className="px-6 py-4 text-sm text-[#1A1C1C]">{o.customer}</td>
                          <td className="px-6 py-4 text-sm opacity-60">{formatDate(o.date)}</td>
                          <td className="px-6 py-4 text-sm text-[#1A1C1C]">
                            {formatCurrency(o.amount)}
                          </td>
                          <td className="px-6 py-4">
                            <StatusBadge status={o.status} />
                          </td>
                          <td className="px-6 py-4">
                            <button className="text-[10px] uppercase text-[#5E5E5E] tracking-wide hover:text-black transition-colors duration-300">
                              View
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* View All Orders Button — navigates to the All Orders page */}
              <div className="flex justify-center pt-2">
                <button
                  onClick={() => navigate('/admin/orders')}
                  className="flex items-center gap-2 text-xs font-normal uppercase tracking-[0.1em] text-[#5E5E5E] hover:text-black transition-colors duration-300"
                >
                  View all archived orders
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}