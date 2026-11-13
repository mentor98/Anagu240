import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Bell, CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const NotificationDrawer: React.FC = () => {
  const { notifications, markNotificationRead } = useApp();
  const [isOpen, setIsOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl bg-white dark:bg-[#131738] border border-slate-200 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:border-indigo-500/50 transition-colors shadow-sm"
        title="View system & cadastral notifications"
        aria-label="Notifications"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#6338F5] text-white text-[10px] font-bold flex items-center justify-center animate-pulse shadow-sm">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-72 sm:w-96 bg-white dark:bg-[#131738] border border-slate-200 dark:border-indigo-500/30 rounded-2xl shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-700/60 mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900 dark:text-white">Cadastral & Blockchain Alerts</span>
                {unreadCount > 0 && (
                  <span className="text-[11px] font-mono text-[#6338F5] dark:text-indigo-400 font-semibold">({unreadCount} new)</span>
                )}
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-lg"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto space-y-2 pr-1">
              {notifications.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  No notifications recorded.
                </div>
              ) : (
                notifications.map(notif => {
                  return (
                    <div
                      key={notif.id}
                      onClick={() => markNotificationRead(notif.id)}
                      className={`p-2.5 rounded-xl border text-left cursor-pointer transition-colors ${
                        notif.read
                          ? 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400'
                          : 'bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-500/30 text-slate-800 dark:text-slate-200 hover:border-indigo-500/60'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        {notif.type === 'success' && <CheckCircle2 className="w-4 h-4 text-[#13C98A] mt-0.5 shrink-0" />}
                        {notif.type === 'warning' && <AlertCircle className="w-4 h-4 text-amber-500 dark:text-amber-400 mt-0.5 shrink-0" />}
                        {notif.type === 'info' && <Info className="w-4 h-4 text-[#168BFF] mt-0.5 shrink-0" />}
                        {notif.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-500 mt-0.5 shrink-0" />}

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-slate-900 dark:text-white truncate">{notif.title}</span>
                            <span className="text-[10px] text-slate-400 font-mono shrink-0 ml-2">{notif.timestamp}</span>
                          </div>
                          <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5 leading-snug">{notif.message}</p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
