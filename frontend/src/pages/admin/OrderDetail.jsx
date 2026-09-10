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
  const { bg, color } =
    STATUS_STYLES[status] || STATUS_STYLES.Pending;

  return (
    <span
      className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wide whitespace-nowrap"
      style={{ backgroundColor: bg, color }}
    >
      {status}
    </span>
  );
}

export default function OrderDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { get, patch, del, loading, error } = useApi();

  const [order, setOrder] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [actionError, setActionError] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const data = await get(`/apiorders/getsingleorder/${id}`);
        setOrder(data.order || data);
      } catch (err) {
        console.error('FETCH ORDER ERROR:', err);
      }
    };

    if (id) fetchOrder();
  }, [id]);

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
      const data = await del(`/apiorders/cancelorder/${id}`);
      setOrder(data.order);
    } catch (err) {
      setActionError(err.message);
    } finally {
      setUpdating(false);
    }
  };

  const handlePrintInvoice = () => {
    window.print();
  };

  if (loading || !order) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#F9F9F9] px-4 text-center">
        <p className="text-sm text-[#5E5E5E]">
          {error || 'Loading order...'}
        </p>
      </main>
    );
  }

  const customer = {
    name: order.user?.firstName
      ? `${order.user.firstName} ${order.user.lastName || ''}`.trim()
      : `${order.shippingAddress?.firstName || ''} ${
          order.shippingAddress?.lastName || ''
        }`.trim(),

    email: order.customerEmail || order.user?.email,

    phone:
      order.user?.phone || order.shippingAddress?.phone,
  };

  const canShip =
    order.orderStatus !== 'Cancelled' &&
    order.orderStatus !== 'Shipped' &&
    order.paymentStatus === 'Paid';

  const canCancel =
    order.orderStatus !== 'Cancelled' &&
    order.orderStatus !== 'Shipped';

  return (
    <>
      {/* =====================================================
          PRINT CSS
          HIDES ADMIN NAVBAR / SIDEBAR / ENTIRE PAGE
          AND SHOWS ONLY THE INVOICE
          ===================================================== */}

      <style>
        {`
          @media print {
            body * {
              visibility: hidden !important;
            }

            #print-invoice,
            #print-invoice * {
              visibility: visible !important;
            }

            #print-invoice {
              position: absolute !important;
              left: 0 !important;
              top: 0 !important;
              width: 100% !important;
              margin: 0 !important;
              padding: 32px !important;
              background: white !important;
            }

            @page {
              size: A4;
              margin: 0;
            }
          }
        `}
      </style>

      {/* =====================================================
          NORMAL ADMIN ORDER DETAILS PAGE
          ===================================================== */}

      <div
        className="min-h-screen bg-[#F9F9F9] text-[#1A1C1C] print:hidden"
        style={{ fontFamily: "'Work Sans', sans-serif" }}
      >
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur px-4 py-6 sm:px-6 sm:py-7 lg:px-10 lg:py-8 border-b border-[#EEEEEE]">
          <div className="max-w-[1440px] w-full mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">

            <div className="flex flex-col md:flex-row items-start md:items-center gap-4 sm:gap-6 min-w-0">

              <a
                onClick={() => navigate('/admin/orders')}
                className="flex items-center gap-2 text-[11px] font-medium uppercase text-[#5E5E5E] hover:text-[#1A1C1C] transition-colors duration-200 cursor-pointer whitespace-nowrap"
              >
                <ArrowLeft size={20} />
                Orders Archive
              </a>

              <div className="hidden md:block w-px h-8 bg-[#CFC4C5]" />

              <div className="flex flex-col sm:flex-row sm:items-center gap-3 min-w-0">

                <h1
                  className="text-[22px] sm:text-[26px] lg:text-[32px] font-normal tracking-tight text-[#1A1C1C] break-all"
                  style={{
                    fontFamily: "'Libre Caslon Text', serif",
                  }}
                >
                  Order #{order._id}
                </h1>

                <StatusBadge status={order.orderStatus} />

              </div>
            </div>

            <div className="flex justify-end w-full md:w-auto">

              <button
                onClick={handlePrintInvoice}
                className="w-full md:w-auto px-6 py-3 border border-black bg-transparent text-[11px] uppercase tracking-wide transition-all duration-300 hover:bg-[#F3F3F4]"
              >
                Print Invoice
              </button>

            </div>
          </div>
        </header>

        <main className="px-4 py-10 sm:px-6 sm:py-12 lg:px-10 lg:pb-24">
          <div className="max-w-[1440px] w-full mx-auto">

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 sm:gap-12">

              {/* LEFT SIDE */}

              <div className="lg:col-span-7 flex flex-col gap-10 sm:gap-12 lg:gap-16">

                {/* PRODUCT DETAILS */}

                <section className="transition-all duration-700">

                  <p className="text-[11px] uppercase font-medium text-[#5E5E5E] mb-6 sm:mb-8">
                    Product Details
                  </p>

                  <div className="flex flex-col gap-6">

                    {(order.items || []).map((item, i) => (

                      <div
                        key={item._id || i}
                        className="bg-white p-5 sm:p-8 flex flex-col md:flex-row gap-6 sm:gap-8"
                      >

                        <div className="w-full md:w-48 aspect-square overflow-hidden bg-[#EEEEEE] flex-shrink-0">

                          {item.image || item.product?.mainImage ? (
                            <img
                              src={
                                item.image ||
                                item.product?.mainImage
                              }
                              alt={
                                item.productName ||
                                item.product?.modelName ||
                                'Product'
                              }
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs text-[#5E5E5E]">
                              No Image
                            </div>
                          )}

                        </div>

                        <div className="flex-1 flex flex-col justify-between min-w-0">

                          <div>

                            <p
                              className="text-xl sm:text-2xl text-[#1A1C1C] break-words"
                              style={{
                                fontFamily:
                                  "'Libre Caslon Text', serif",
                              }}
                            >
                              {item.productName ||
                                item.product?.modelName ||
                                'Unknown product'}
                            </p>

                            <p className="text-[11px] uppercase text-[#5E5E5E] mt-2">
                              {item.sku ||
                                item.product?.sku ||
                                'N/A'}
                            </p>

                          </div>

                          <div className="flex flex-wrap justify-between items-center gap-2 pt-6 mt-6 sm:pt-8 sm:mt-8 border-t border-[#CFC4C5]">

                            <span className="text-[11px] uppercase text-[#5E5E5E]">
                              Unit Price · Qty {item.quantity}
                            </span>

                            <span
                              className="text-xl sm:text-2xl text-[#1A1C1C]"
                              style={{
                                fontFamily:
                                  "'Libre Caslon Text', serif",
                              }}
                            >
                              ₹
                              {Number(
                                item.price || 0
                              ).toLocaleString('en-IN')}
                            </span>

                          </div>

                        </div>

                      </div>

                    ))}

                  </div>

                </section>

                {/* ORDER SUMMARY */}

                <section className="transition-all duration-700">

                  <p className="text-[11px] uppercase font-medium text-[#5E5E5E] mb-6 sm:mb-8">
                    Order Summary
                  </p>

                  <div className="bg-[#F3F3F4] p-5 sm:p-8 flex flex-col gap-5 sm:gap-6">

                    <div className="flex justify-between text-sm gap-4">
                      <span>Shipping Method</span>

                      <span className="text-right">
                        {order.shippingMethod || 'N/A'}
                      </span>
                    </div>

                    <div className="flex justify-between text-sm gap-4">
                      <span>Subtotal</span>

                      <span>
                        ₹
                        {Number(
                          order.subtotal || 0
                        ).toLocaleString('en-IN')}
                      </span>
                    </div>

                    {Number(order.discount || 0) > 0 && (
                      <div className="flex justify-between text-sm gap-4">
                        <span>Discount</span>

                        <span>
                          - ₹
                          {Number(
                            order.discount || 0
                          ).toLocaleString('en-IN')}
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between text-sm gap-4">
                      <span>Shipping</span>

                      <span>
                        ₹
                        {Number(
                          order.shipping || 0
                        ).toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div className="flex justify-between text-sm gap-4">
                      <span>Tax</span>

                      <span>
                        ₹
                        {Number(
                          order.tax || 0
                        ).toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div className="h-px bg-[#EEEEEE]" />

                    <div className="flex flex-wrap justify-between items-center gap-2">

                      <span className="text-[11px] uppercase font-bold">
                        Total Amount
                      </span>

                      <span
                        className="text-3xl sm:text-4xl lg:text-5xl text-[#1A1C1C] break-words"
                        style={{
                          fontFamily:
                            "'Libre Caslon Text', serif",
                        }}
                      >
                        ₹
                        {Number(
                          order.total || 0
                        ).toLocaleString('en-IN')}
                      </span>

                    </div>

                  </div>

                </section>

              </div>

              {/* RIGHT SIDE */}

              <div className="lg:col-span-5 flex flex-col gap-10 sm:gap-12 lg:gap-16">

                {/* CUSTOMER INFORMATION */}

                <section className="lg:mt-16">

                  <p className="text-[11px] uppercase font-medium text-[#5E5E5E] mb-6 sm:mb-8">
                    Customer Information
                  </p>

                  <div className="bg-white p-5 sm:p-8 flex flex-col gap-6 sm:gap-8">

                    <div className="flex items-center gap-4 min-w-0">

                      <div className="w-12 h-12 rounded-full bg-[#EEEEEE] flex items-center justify-center text-sm font-medium text-[#5E5E5E] flex-shrink-0">
                        {customer.name?.[0] || '?'}
                      </div>

                      <span className="text-base font-bold text-[#1A1C1C] break-words">
                        {customer.name || 'N/A'}
                      </span>

                    </div>

                    <div className="border-t border-[#CFC4C5] pt-6 grid grid-cols-1 gap-6">

                      <p className="text-sm text-[#5E5E5E] break-all">
                        {customer.email || 'N/A'}
                      </p>

                      <p className="text-sm text-[#5E5E5E] break-words">
                        {customer.phone || 'N/A'}
                      </p>

                    </div>

                  </div>

                </section>

                {/* SHIPPING ADDRESS */}

                <section>

                  <p className="text-[11px] uppercase text-[#5E5E5E] mb-6 sm:mb-8">
                    Shipping Address
                  </p>

                  <div className="bg-white p-5 sm:p-8">

                    <div className="flex flex-col gap-2">

                      <p className="text-base text-[#1A1C1C] break-words">
                        {order.shippingAddress?.address || 'N/A'}
                      </p>

                      <p className="text-base text-[#1A1C1C] break-words">
                        {order.shippingAddress?.city || 'N/A'},{' '}
                        {order.shippingAddress?.state || 'N/A'}
                      </p>

                      <p className="text-base text-[#1A1C1C]">
                        {order.shippingAddress?.pincode || 'N/A'}
                      </p>

                    </div>

                  </div>

                </section>

                {/* PAYMENT METHOD */}

                <section>

                  <p className="text-[11px] uppercase text-[#5E5E5E] mb-6 sm:mb-8">
                    Payment Method
                  </p>

                  <div className="bg-white p-5 sm:p-8 flex flex-wrap justify-between items-center gap-2">

                    <span className="text-sm text-[#1A1C1C]">
                      {order.paymentMethod || 'Razorpay'}
                    </span>

                    <span className="text-sm text-[#5E5E5E]">
                      {order.paymentStatus || 'Pending'}
                    </span>

                  </div>

                </section>

                {/* ACTION ERROR */}

                {actionError && (
                  <p className="text-sm text-[#A32D2D]">
                    {actionError}
                  </p>
                )}

                {/* ORDER ACTIONS */}

                <div className="pt-8 border-t border-[#CFC4C5]">

                  <div className="flex flex-col sm:flex-row gap-4">

                    <button
                      onClick={handleCancelOrder}
                      disabled={
                        updating || !canCancel
                      }
                      className="w-full py-4 border border-[#A32D2D] text-[#A32D2D] text-[11px] uppercase tracking-wide transition-colors duration-300 hover:bg-[#A32D2D]/10 disabled:opacity-40"
                    >
                      Cancel Order
                    </button>

                    <button
                      onClick={handleMarkShipped}
                      disabled={
                        updating || !canShip
                      }
                      className="w-full py-4 bg-black text-white text-[11px] uppercase tracking-wide transition-opacity duration-300 hover:opacity-90 disabled:opacity-40"
                    >
                      Mark As Shipped
                    </button>

                  </div>

                  {order.paymentStatus !== 'Paid' && (
                    <p className="text-xs text-[#A32D2D] text-center mt-3">
                      Order cannot be shipped until payment is completed.
                    </p>
                  )}

                </div>

              </div>

            </div>

          </div>
        </main>
      </div>

      {/* =====================================================
          PRINT-ONLY INVOICE
          ===================================================== */}

      <div
        id="print-invoice"
        className="hidden print:block bg-white text-black p-8"
        style={{
          fontFamily: "'Work Sans', sans-serif",
        }}
      >

        <div className="max-w-4xl mx-auto">

          {/* INVOICE HEADER */}

          <div className="flex justify-between items-start border-b border-black pb-6">

            <div>

              <h1 className="text-3xl tracking-[0.2em] font-semibold">
                CHRONOS
              </h1>

              <p className="text-xs tracking-[0.2em] text-gray-500 mt-1">
                HAUTE HORLOGERIE
              </p>

            </div>

            <div className="text-right">

              <h2 className="text-2xl font-medium tracking-wider">
                INVOICE
              </h2>

              <p className="text-xs text-gray-500 mt-2">
                Order #{order._id}
              </p>

              <p className="text-xs text-gray-500 mt-1">
                {order.createdAt
                  ? new Date(
                      order.createdAt
                    ).toLocaleDateString('en-IN')
                  : ''}
              </p>

              <p className="text-xs text-gray-500 mt-1">
                {order.orderStatus}
              </p>

            </div>

          </div>

          {/* CUSTOMER / ADDRESS / PAYMENT */}

          <div className="grid grid-cols-3 gap-8 py-8">

            {/* CUSTOMER */}

            <div>

              <p className="text-xs uppercase tracking-wider font-semibold mb-3">
                Customer
              </p>

              <p className="text-sm">
                {customer.name || '-'}
              </p>

              <p className="text-sm text-gray-600">
                {customer.email || '-'}
              </p>

              <p className="text-sm text-gray-600">
                {customer.phone || '-'}
              </p>

            </div>

            {/* SHIPPING ADDRESS */}

            <div>

              <p className="text-xs uppercase tracking-wider font-semibold mb-3">
                Shipping Address
              </p>

              <p className="text-sm">
                {order.shippingAddress?.firstName || ''}{' '}
                {order.shippingAddress?.lastName || ''}
              </p>

              <p className="text-sm">
                {order.shippingAddress?.address || '-'}
              </p>

              <p className="text-sm">
                {order.shippingAddress?.city || '-'},
                {' '}
                {order.shippingAddress?.state || '-'}
              </p>

              <p className="text-sm">
                {order.shippingAddress?.pincode || '-'}
              </p>

            </div>

            {/* PAYMENT */}

            <div>

              <p className="text-xs uppercase tracking-wider font-semibold mb-3">
                Payment
              </p>

              <p className="text-sm">
                Method: {order.paymentMethod || '-'}
              </p>

              <p className="text-sm">
                Status: {order.paymentStatus || '-'}
              </p>

              <p className="text-sm">
                Shipping: {order.shippingMethod || '-'}
              </p>

            </div>

          </div>

          {/* ORDER ITEMS */}

          <div className="border-t border-black pt-6">

            <p className="text-xs uppercase tracking-wider font-semibold mb-4">
              Order Items
            </p>

            <table className="w-full border-collapse">

              <thead>

                <tr className="border-b border-black">

                  <th className="text-left py-3 text-xs uppercase">
                    Product
                  </th>

                  <th className="text-left py-3 text-xs uppercase">
                    SKU
                  </th>

                  <th className="text-center py-3 text-xs uppercase">
                    Qty
                  </th>

                  <th className="text-right py-3 text-xs uppercase">
                    Unit Price
                  </th>

                  <th className="text-right py-3 text-xs uppercase">
                    Total
                  </th>

                </tr>

              </thead>

              <tbody>

                {(order.items || []).map((item, i) => (

                  <tr
                    key={item._id || i}
                    className="border-b border-gray-200"
                  >

                    <td className="py-4 text-sm">
                      {item.productName ||
                        item.product?.modelName ||
                        'Unknown product'}
                    </td>

                    <td className="py-4 text-sm">
                      {item.sku ||
                        item.product?.sku ||
                        '-'}
                    </td>

                    <td className="py-4 text-sm text-center">
                      {item.quantity}
                    </td>

                    <td className="py-4 text-sm text-right">
                      ₹
                      {Number(
                        item.price || 0
                      ).toLocaleString('en-IN')}
                    </td>

                    <td className="py-4 text-sm text-right">
                      ₹
                      {Number(
                        (item.price || 0) *
                          (item.quantity || 0)
                      ).toLocaleString('en-IN')}
                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

          {/* ORDER SUMMARY */}

          <div className="flex justify-end mt-8">

            <div className="w-80 space-y-3 text-sm">

              <div className="flex justify-between">

                <span>Subtotal</span>

                <span>
                  ₹
                  {Number(
                    order.subtotal || 0
                  ).toLocaleString('en-IN')}
                </span>

              </div>

              {Number(order.discount || 0) > 0 && (

                <div className="flex justify-between">

                  <span>Discount</span>

                  <span>
                    - ₹
                    {Number(
                      order.discount || 0
                    ).toLocaleString('en-IN')}
                  </span>

                </div>

              )}

              <div className="flex justify-between">

                <span>Shipping</span>

                <span>
                  ₹
                  {Number(
                    order.shipping || 0
                  ).toLocaleString('en-IN')}
                </span>

              </div>

              <div className="flex justify-between">

                <span>Tax</span>

                <span>
                  ₹
                  {Number(
                    order.tax || 0
                  ).toLocaleString('en-IN')}
                </span>

              </div>

              <div className="border-t border-black pt-4 flex justify-between text-lg font-semibold">

                <span>Total</span>

                <span>
                  ₹
                  {Number(
                    order.total || 0
                  ).toLocaleString('en-IN')}
                </span>

              </div>

            </div>

          </div>

          {/* FOOTER */}

          <div className="border-t border-gray-300 mt-10 pt-4 text-center text-xs text-gray-500">

            <p>
              Thank you for choosing Chronos Haute Horlogerie.
            </p>

            <p className="mt-1">
              This is a computer-generated invoice.
            </p>

          </div>

        </div>

      </div>
    </>
  );
}