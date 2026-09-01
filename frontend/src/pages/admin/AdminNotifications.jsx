

import { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Bell, BellOff, Check } from 'lucide-react';
import { useApi } from '../../hooks/useApi';
import {
  setNotifications,
  setUnreadCount,
  markNotificationReadLocal,
} from '../../redux/notificationSlice';

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

export default function AdminNotifications() {
  const { get, patch } = useApi();
  const dispatch = useDispatch();

  const items = useSelector((state) => state.notification.items);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [markingId, setMarkingId] = useState(null);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    setFetchError('');
    try {
      const data = await get('/apinotify/notifications');
      const list = data?.notifications ?? [];
      console.log('[Notifications] fetched', list);
      dispatch(setNotifications(list));
      dispatch(setUnreadCount(list.filter((n) => !n.isRead).length));
    } catch (err) {
      console.error('[Notifications] fetch failed', err);
      setFetchError('Unable to load notifications right now.');
    } finally {
      setLoading(false);
    }
  }, [get, dispatch]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkAsRead = async (e, id, alreadyRead) => {
    e.stopPropagation();
    console.log('[MarkAsRead] clicked', { id, alreadyRead, markingId });
    if (alreadyRead || markingId) return;

    setMarkingId(id);
    // optimistic update — badge and list update immediately
    dispatch(markNotificationReadLocal(id));
    try {
      const res = await patch(`/apinotify/markasread/${id}`);
      console.log('[MarkAsRead] success response', res);
    } catch (err) {
      console.error('[MarkAsRead] request failed', err);
      // resync from server on failure so state doesn't silently drift
      fetchNotifications();
    } finally {
      setMarkingId(null);
    }
  };

  const unreadCount = items.filter((n) => !n.isRead).length;

  return (
    <main className="min-h-screen m-0  px-4 sm:px-8 py-8 sm:py-16 bg-[#F9F9F9]">
      <div className="mb-8 sm:mb-10 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1
            className="text-xl sm:text-2xl lg:text-3xl font-normal text-black mb-2"
            style={{ fontFamily: "'Libre Caslon Text', serif" }}
          >
            Notifications
          </h1>
          <p className="text-sm text-[#5E5E5E]">
            Updates and alerts relevant to your admin account.
          </p>
        </div>

        {!loading && !fetchError && unreadCount > 0 && (
          <span className="shrink-0 mt-1 bg-black text-white text-[11px] font-semibold px-2.5 py-1 rounded-full whitespace-nowrap">
            {unreadCount} unread
          </span>
        )}
      </div>

      {loading && (
        <p className="py-16 text-center text-sm text-[#5E5E5E]">Loading notifications…</p>
      )}

      {!loading && fetchError && (
        <p className="py-16 text-center text-sm text-[#A32D2D]">{fetchError}</p>
      )}

      {!loading && !fetchError && items.length === 0 && (
        <div className="flex flex-col items-center py-16 sm:py-20 text-center">
          <BellOff size={32} className="text-[#5E5E5E]" strokeWidth={1.5} />
          <p className="mt-4 text-sm text-[#5E5E5E]">No notifications yet.</p>
        </div>
      )}

      {!loading && !fetchError && items.length > 0 && (
        <div className="flex flex-col divide-y divide-[#CFC4C5] bg-white border border-[#CFC4C5]">
          {items.map((n) => (
            <div
              key={n._id}
              className={`flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4 px-4 sm:px-6 py-4 sm:py-5 transition-colors ${
                n.isRead ? 'bg-white' : 'bg-[#F3F3F4]'
              }`}
            >
              <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
                <span
                  className={`mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                    n.isRead ? 'bg-[#EEEEEE] text-[#5E5E5E]' : 'bg-black text-white'
                  }`}
                >
                  <Bell size={14} />
                </span>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <p
                      className={`text-sm break-words ${n.isRead ? 'text-[#5E5E5E]' : 'font-semibold text-black'}`}
                    >
                      {n.message}
                    </p>
                    {!n.isRead && (
                      <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-red-500" />
                    )}
                  </div>

                  {n.user?.email && (
                    <p className="mt-1 text-xs text-[#5E5E5E] break-all">{n.user.email}</p>
                  )}

                  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                    {n.type && (
                      <span className="text-[10px] uppercase tracking-wide text-[#8A8A8A]">
                        {n.type}
                      </span>
                    )}
                    <p className="text-[11px] uppercase tracking-wide text-[#8A8A8A]">
                      {timeAgo(n.createdAt)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Mark as read — per notification */}
              <div className="shrink-0 self-start sm:self-center pl-11 sm:pl-0">
                {n.isRead ? (
                  <span className="flex items-center gap-1 text-[11px] text-[#8A8A8A] whitespace-nowrap">
                    <Check size={13} />
                    Read
                  </span>
                ) : (
                  <button
                    onClick={(e) => handleMarkAsRead(e, n._id, n.isRead)}
                    disabled={markingId === n._id}
                    className="text-[11px] font-semibold uppercase tracking-wide text-black underline underline-offset-2 hover:opacity-70 disabled:opacity-50 whitespace-nowrap"
                  >
                    {markingId === n._id ? 'Marking…' : 'Mark as read'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}