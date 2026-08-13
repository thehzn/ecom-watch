import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useApi } from '../../hooks/useApi';

const STATUS_STYLES = {
  Pending: { bg: '#FAEEDA', color: '#854F0B' },
  Shipped: { bg: '#DDEAF6', color: '#1D4E76' },
  Delivered: { bg: '#EAF3DE', color: '#3B6D11' },
  Cancelled: { bg: '#F3F3F4', color: '#5E5E5E' },
};

function StatusBadge({ status }) {
  const { bg, color } = STATUS_STYLES[status] || STATUS_STYLES.Pending;
  return (
    <span
      className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wide"
      style={{ backgroundColor: bg, color }}
    >
      {status}
    </span>
  );
}

export default function OrderDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { get, put, loading, error } = useApi();

  const [order, setOrder] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [actionError, setActionError] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const data = await get(`/apiorders/getsingleorder/${id}`);
        setOrder(data.order || data);
      } catch (err) {
        // error already captured by useApi
      }
    };
    if (id) fetchOrder();
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleMarkShipped = async () => {
    setActionError(null);
    setUpdating(true);
    try {
      const data = await patch(`/apiorders/markasshipped/${id}`);
      setOrder(data.order);
    } catch (err) {
      setActionError(err.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!window.confirm('Cancel this order?')) return;
    setActionError(null);
    setUpdating(true);
    try {
      const data = await put(`/apiorders/cancelorder/${id}`);
      setOrder(data.order);
    } catch (err) {
      setActionError(err.message);
    } finally {
      setUpdating(false);
    }
  };

  if (loading || !order) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#F9F9F9]">
        <p className="text-sm text-[#5E5E5E]">
          {error || 'Loading order...'}
        </p>
      </main>
    );
  }

  const customer = {
    name: order.user?.firstName
      ? `${order.user.firstName} ${order.user.lastName || ''}`.trim()
      : `${order.shippingAddress?.firstName || ''} ${order.shippingAddress?.lastName || ''}`.trim(),
    email: order.user?.email,
    phone: order.user?.phone || order.shippingAddress?.phone,
  };

  const canShip = order.orderStatus !== 'Cancelled' && order.orderStatus !== 'Shipped';
  const canCancel = order.orderStatus !== 'Cancelled' && order.orderStatus !== 'Shipped';

  return (
    <div className="min-h-screen bg-[#F9F9F9] text-[#1A1C1C]" style={{ fontFamily: "'Work Sans', sans-serif" }}>
      {/* Page Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur px-10 py-8 border-b border-[#EEEEEE]">
        <div className="max-w-[1440px] w-full mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <a
              onClick={() => navigate('/admin/orders')}
              className="flex items-center gap-2 text-[11px] font-medium uppercase text-[#5E5E5E] hover:text-[#1A1C1C] transition-colors duration-200 cursor-pointer"
            >
              <ArrowLeft size={20} />
              Orders Archive
            </a>

            <div className="hidden md:block w-px h-8 bg-[#CFC4C5]" />

            <div className="flex flex-col md:flex-row md:items-center gap-3">
              <h1
                className="text-[32px] font-normal tracking-tight text-[#1A1C1C]"
                style={{ fontFamily: "'Libre Caslon Text', serif" }}
              >
                Order #{order._id}
              </h1>
              <StatusBadge status={order.orderStatus} />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={() => window.print()}
              className="px-6 py-3 border border-black bg-transparent text-[11px] uppercase tracking-wide transition-all duration-300 hover:bg-[#F3F3F4]"
            >
              Print Invoice
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-10 pb-24">
        <div className="max-w-[1440px] w-full mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Left Column */}
            <div className="lg:col-span-7 flex flex-col gap-16">
              {/* Product Details — one card per item, since an order can hold multiple products */}
              <section className="transition-all duration-700">
                <p className="text-[11px] uppercase font-medium text-[#5E5E5E] mb-8">
                  Product Details
                </p>
                <div className="flex flex-col gap-6">
                  {(order.items || []).map((item, i) => (
                    <div key={item._id || i} className="bg-white p-8 flex flex-col md:flex-row gap-8">
                      <div className="w-full md:w-48 aspect-square overflow-hidden bg-[#EEEEEE] flex-shrink-0">
                        <img
                          src={item.product?.mainImage}
                          alt={item.product?.modelName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <p
                            className="text-2xl text-[#1A1C1C]"
                            style={{ fontFamily: "'Libre Caslon Text', serif" }}
                          >
                            {item.product?.modelName || 'Unknown product'}
                          </p>
                          <p className="text-[11px] uppercase text-[#5E5E5E] mt-2">
                            {item.product?.sku}
                          </p>
                        </div>
                        <div className="flex justify-between items-center pt-8 mt-8 border-t border-[#CFC4C5]">
                          <span className="text-[11px] uppercase text-[#5E5E5E]">
                            Unit Price · Qty {item.quantity}
                          </span>
                          <span
                            className="text-2xl text-[#1A1C1C]"
                            style={{ fontFamily: "'Libre Caslon Text', serif" }}
                          >
                            ₹{Number(item.price).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Order Summary — uses stored values directly, no client-side calculation */}
              <section className="transition-all duration-700">
                <p className="text-[11px] uppercase font-medium text-[#5E5E5E] mb-8">
                  Order Summary
                </p>
                <div className="bg-[#F3F3F4] p-8 flex flex-col gap-6">
                  <div className="flex justify-between text-sm">
                    <span>Shipping Method</span>
                    <span>{order.shippingMethod}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>₹{Number(order.subtotal).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Shipping</span>
                    <span>₹{Number(order.shipping).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Tax</span>
                    <span>₹{Number(order.tax).toLocaleString()}</span>
                  </div>
                  <div className="h-px bg-[#EEEEEE]" />
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] uppercase font-bold">Total Amount</span>
                    <span
                      className="text-5xl text-[#1A1C1C]"
                      style={{ fontFamily: "'Libre Caslon Text', serif" }}
                    >
                      ₹{Number(order.total).toLocaleString()}
                    </span>
                  </div>
                </div>
              </section>
            </div>

            {/* Right Column */}
            <div className="lg:col-span-5 flex flex-col gap-16">
              {/* Customer Information */}
              <section className="mt-16">
                <p className="text-[11px] uppercase font-medium text-[#5E5E5E] mb-8">
                  Customer Information
                </p>
                <div className="bg-white p-8 flex flex-col gap-8">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-[#EEEEEE] flex items-center justify-center text-sm font-medium text-[#5E5E5E]">
                      {customer.name?.[0] || '?'}
                    </div>
                    <span className="text-base font-bold text-[#1A1C1C]">
                      {customer.name}
                    </span>
                  </div>
                  <div className="border-t border-[#CFC4C5] pt-6 grid grid-cols-1 gap-6">
                    <p className="text-sm text-[#5E5E5E]">{customer.email}</p>
                    <p className="text-sm text-[#5E5E5E]">{customer.phone}</p>
                  </div>
                </div>
              </section>

              {/* Shipping Address */}
              <section>
                <p className="text-[11px] uppercase text-[#5E5E5E] mb-8">
                  Shipping Address
                </p>
                <div className="bg-white p-8">
                  <div className="flex flex-col gap-2">
                    <p className="text-base text-[#1A1C1C]">{order.shippingAddress?.address}</p>
                    <p className="text-base text-[#1A1C1C]">
                      {order.shippingAddress?.city}, {order.shippingAddress?.state}
                    </p>
                    <p className="text-base text-[#1A1C1C]">{order.shippingAddress?.pincode}</p>
                  </div>
                </div>
              </section>

              {/* Payment Method */}
              <section>
                <p className="text-[11px] uppercase text-[#5E5E5E] mb-8">
                  Payment Method
                </p>
                <div className="bg-white p-8 flex justify-between items-center">
                  <span className="text-sm text-[#1A1C1C]">{order.paymentMethod}</span>
                  <span className="text-sm text-[#5E5E5E]">{order.paymentStatus}</span>
                </div>
              </section>

              {actionError && (
                <p className="text-sm text-[#A32D2D]">{actionError}</p>
              )}

              {/* Action Footer */}
              <div className="pt-8 border-t border-[#CFC4C5]">
                <div className="flex gap-4">
                  <button
                    onClick={handleCancelOrder}
                    disabled={updating || !canCancel}
                    className="w-full py-4 border border-[#A32D2D] text-[#A32D2D] text-[11px] uppercase tracking-wide transition-colors duration-300 hover:bg-[#A32D2D]/10 disabled:opacity-40"
                  >
                    Cancel Order
                  </button>
                  <button
                    onClick={handleMarkShipped}
                    disabled={updating || !canShip}
                    className="w-full py-4 bg-black text-white text-[11px] uppercase tracking-wide transition-opacity duration-300 hover:opacity-90 disabled:opacity-40"
                  >
                    Mark As Shipped
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}