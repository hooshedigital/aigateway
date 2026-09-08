import { useState, useEffect, useRef } from "react";
import { Bell, CheckCheck, Info, AlertTriangle, XCircle, CheckCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useApp } from "@/contexts/AppContext";
import type { Notification } from "@/types";

export function NotificationsBell() {
  const { t, theme, lang } = useApp();
  const isDark = theme === "dark";
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchNotifications() {
      const { data } = await supabase
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);
      const notifs = (data as Notification[]) ?? [];
      setNotifications(notifs);
      setUnreadCount(notifs.filter((n) => !n.read).length);
    }
    fetchNotifications();
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function markAllRead() {
    const unreadIds = notifications.filter((n) => !n.read).map((n) => n.id);
    if (unreadIds.length === 0) return;
    for (const id of unreadIds) {
      await supabase.from("notifications").update({ read: true }).eq("id", id);
    }
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  }

  const typeIcons: Record<string, typeof Info> = {
    info: Info,
    warning: AlertTriangle,
    error: XCircle,
    success: CheckCircle,
  };

  const typeColors: Record<string, string> = {
    info: "text-cyan-500",
    warning: "text-amber-500",
    error: "text-rose-500",
    success: "text-emerald-500",
  };

  const locale = lang === "fa" ? "fa" : "en";

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        title={t("notifications")}
      >
        <Bell className="w-4 h-4 text-slate-500" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className={`absolute end-0 mt-2 w-80 ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"} border rounded-xl shadow-2xl z-50 animate-scale-in overflow-hidden`}>
          <div className={`flex items-center justify-between px-4 py-3 border-b ${isDark ? "border-slate-800" : "border-slate-200"}`}>
            <h3 className={`text-sm font-semibold ${isDark ? "text-slate-100" : "text-slate-900"}`}>{t("notifications")}</h3>
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="flex items-center gap-1 text-xs text-cyan-500 hover:text-cyan-400 transition-colors">
                <CheckCheck className="w-3.5 h-3.5" />{t("markAllRead")}
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto scrollbar-thin">
            {notifications.length === 0 ? (
              <p className={`text-sm text-center py-8 ${isDark ? "text-slate-500" : "text-slate-400"}`}>{t("noNotifications")}</p>
            ) : (
              notifications.map((n) => {
                const Icon = typeIcons[n.type] ?? Info;
                return (
                  <div key={n.id} className={`flex items-start gap-3 px-4 py-3 ${!n.read ? (isDark ? "bg-cyan-500/5" : "bg-cyan-500/5") : ""} hover:bg-slate-100/50 dark:hover:bg-slate-800/30 transition-colors border-b ${isDark ? "border-slate-800/50" : "border-slate-100"}`}>
                    <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${typeColors[n.type]}`} />
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${isDark ? "text-slate-200" : "text-slate-800"}`}>{n.title}</p>
                      {n.message && <p className="text-xs text-slate-500 mt-0.5">{n.message}</p>}
                      <p className="text-xs text-slate-400 mt-1">{new Date(n.created_at).toLocaleString(locale, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
                    </div>
                    {!n.read && <div className="w-2 h-2 rounded-full bg-cyan-500 flex-shrink-0 mt-1.5" />}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
