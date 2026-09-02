import { useEffect, useState, useCallback } from 'react';
import { Mail, MailOpen, Check } from 'lucide-react';
import { useApi } from '../../hooks/useApi';

function timeAgo(dateString) {
  if (!dateString) return '';
  const diffMs = Date.now() - new Date(dateString).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function AdminEnquiries() {
  const { get, patch } = useApi();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [resolvingId, setResolvingId] = useState(null);

  const fetchEnquiries = useCallback(async () => {
    setLoading(true);
    setFetchError('');
    try {
      const data = await get('/enquiry/allenquiry');
      setItems(data?.enquiries ?? []);
    } catch (err) {
      setFetchError('Unable to load enquiries right now.');
    } finally {
      setLoading(false);
    }
  }, [get]);

  useEffect(() => {
    fetchEnquiries();
  }, [fetchEnquiries]);

  const handleResolve = async (e, id, status) => {
    e.stopPropagation();
    if (status === 'Resolved' || resolvingId) return;

    setResolvingId(id);
    // optimistic update
    setItems((prev) =>
      prev.map((n) => (n._id === id ? { ...n, status: 'Resolved' } : n))
    );
    try {
      await patch(`/enquiry/updateenquiry/${id}`);
    } catch (err) {
      // resync from server on failure so state doesn't silently drift
      fetchEnquiries();
    } finally {
      setResolvingId(null);
    }
  };

  const pendingCount = items.filter((n) => n.status !== 'Resolved').length;

  return (
    <main className="min-h-screen max-w-full m-0 px-4 sm:px-8 py-8 sm:py-16 bg-[#F9F9F9]">
      <div className="mb-8 sm:mb-10 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1
            className="text-xl sm:text-2xl lg:text-3xl font-normal text-black mb-2"
            style={{ fontFamily: "'Libre Caslon Text', serif" }}
          >
            Enquiries
          </h1>
          <p className="text-sm text-[#5E5E5E]">
            Inquiries submitted through the concierge contact form.
          </p>
        </div>

        {!loading && !fetchError && pendingCount > 0 && (
          <span className="shrink-0 mt-1 bg-black text-white text-[11px] font-semibold px-2.5 py-1 rounded-full whitespace-nowrap">
            {pendingCount} pending
          </span>
        )}
      </div>

      {loading && (
        <p className="py-16 text-center text-sm text-[#5E5E5E]">Loading enquiries…</p>
      )}

      {!loading && fetchError && (
        <p className="py-16 text-center text-sm text-[#A32D2D]">{fetchError}</p>
      )}

      {!loading && !fetchError && items.length === 0 && (
        <div className="flex flex-col items-center py-16 sm:py-20 text-center">
          <MailOpen size={32} className="text-[#5E5E5E]" strokeWidth={1.5} />
          <p className="mt-4 text-sm text-[#5E5E5E]">No enquiries yet.</p>
        </div>
      )}

      {!loading && !fetchError && items.length > 0 && (
        <div className="flex flex-col divide-y divide-[#CFC4C5] bg-white border border-[#CFC4C5]">
          {items.map((n) => {
            const isResolved = n.status === 'Resolved';
            return (
              <div
                key={n._id}
                className={`flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4 px-4 sm:px-6 py-4 sm:py-5 transition-colors ${
                  isResolved ? 'bg-white' : 'bg-[#F3F3F4]'
                }`}
              >
                <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
                  <span
                    className={`mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                      isResolved ? 'bg-[#EEEEEE] text-[#5E5E5E]' : 'bg-black text-white'
                    }`}
                  >
                    <Mail size={14} />
                  </span>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <p
                        className={`text-sm break-words ${isResolved ? 'text-[#5E5E5E]' : 'font-semibold text-black'}`}
                      >
                        {n.name}
                      </p>
                      {!isResolved && (
                        <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-red-500" />
                      )}
                    </div>

                    {n.email && (
                      <p className="mt-1 text-xs text-[#5E5E5E] break-all">{n.email}</p>
                    )}

                    <p className="mt-2 text-sm text-[#1A1C1C] break-words">
                      {n.message}
                    </p>

                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                      {n.subject && (
                        <span className="text-[10px] uppercase tracking-wide text-[#8A8A8A]">
                          {n.subject}
                        </span>
                      )}
                      {n.user && (
                        <span className="text-[10px] uppercase tracking-wide text-[#8A8A8A]">
                          Registered customer
                        </span>
                      )}
                      <p className="text-[11px] uppercase tracking-wide text-[#8A8A8A]">
                        {timeAgo(n.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Resolve — per enquiry */}
                <div className="shrink-0 self-start sm:self-center pl-11 sm:pl-0">
                  {isResolved ? (
                    <span className="flex items-center gap-1 text-[11px] text-[#8A8A8A] whitespace-nowrap">
                      <Check size={13} />
                      Resolved
                    </span>
                  ) : (
                    <button
                      onClick={(e) => handleResolve(e, n._id, n.status)}
                      disabled={resolvingId === n._id}
                      className="text-[11px] font-semibold uppercase tracking-wide text-black underline underline-offset-2 hover:opacity-70 disabled:opacity-50 whitespace-nowrap"
                    >
                      {resolvingId === n._id ? 'Resolving…' : 'Mark as resolved'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}