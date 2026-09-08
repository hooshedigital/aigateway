import { useState, useEffect } from "react";
import { ScrollText, User, Server, Settings, Shield, Zap, Trash2, Edit, Plus } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useApp } from "@/contexts/AppContext";
import type { AuditLog } from "@/types";

export function AuditLogs() {
  const { t, theme, lang } = useApp();
  const isDark = theme === "dark";
  const cardBg = isDark ? "bg-slate-900/60 border-slate-800" : "bg-white/70 border-slate-200";

  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    async function fetchLogs() {
      setLoading(true);
      const { data } = await supabase
        .from("audit_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      setLogs((data as AuditLog[]) ?? []);
      setLoading(false);
    }
    fetchLogs();
  }, []);

  const actionIcons: Record<string, typeof User> = {
    create_user: User,
    edit_user: Edit,
    delete_user: Trash2,
    enable_user: Shield,
    disable_user: Shield,
    regenerate_key: Zap,
    add_provider: Server,
    edit_provider: Edit,
    delete_provider: Trash2,
    update_settings: Settings,
  };

  const actionColors: Record<string, string> = {
    create: "text-emerald-500 bg-emerald-500/10",
    edit: "text-cyan-500 bg-cyan-500/10",
    delete: "text-rose-500 bg-rose-500/10",
    enable: "text-emerald-500 bg-emerald-500/10",
    disable: "text-amber-500 bg-amber-500/10",
    regenerate: "text-violet-500 bg-violet-500/10",
    update: "text-cyan-500 bg-cyan-500/10",
  };

  function getActionColor(action: string): string {
    const prefix = action.split("_")[0];
    return actionColors[prefix] ?? "text-slate-500 bg-slate-500/10";
  }

  const entities = Array.from(new Set(logs.map((l) => l.entity)));
  const filtered = filter === "all" ? logs : logs.filter((l) => l.entity === filter);
  const locale = lang === "fa" ? "fa" : "en";

  return (
    <div className="space-y-6 animate-slide-up">
      <div>
        <h1 className={`text-2xl font-bold ${isDark ? "text-slate-100" : "text-slate-900"}`}>{t("auditLogsTitle")}</h1>
        <p className={`text-sm mt-1 ${isDark ? "text-slate-500" : "text-slate-500"}`}>{t("auditLogsSubtitle")}</p>
      </div>

      {entities.length > 0 && (
        <div className="flex items-center gap-1 p-1 rounded-lg w-fit">
          <button onClick={() => setFilter("all")} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${filter === "all" ? "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400" : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"}`}>{t("all")}</button>
          {entities.map((e) => (
            <button key={e} onClick={() => setFilter(e)} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${filter === e ? "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400" : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"}`}>{e}</button>
          ))}
        </div>
      )}

      <div className={`${cardBg} rounded-xl border backdrop-blur-xl overflow-hidden`}>
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <ScrollText className={`w-10 h-10 mx-auto mb-3 ${isDark ? "text-slate-700" : "text-slate-300"}`} />
            <p className={`text-sm ${isDark ? "text-slate-500" : "text-slate-400"}`}>{t("noAuditLogs")}</p>
          </div>
        ) : (
          <div className={`divide-y ${isDark ? "divide-slate-800" : "divide-slate-200"}`}>
            {filtered.map((log) => {
              const Icon = actionIcons[log.action] ?? ScrollText;
              return (
                <div key={log.id} className="flex items-start gap-4 px-6 py-4 hover:bg-slate-100/50 dark:hover:bg-slate-800/30 transition-colors">
                  <div className={`p-2 rounded-lg ${getActionColor(log.action)} flex-shrink-0`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-sm font-medium ${isDark ? "text-slate-200" : "text-slate-800"}`}>{log.action.replace(/_/g, " ")}</span>
                      <span className={`px-1.5 py-0.5 rounded text-xs font-mono ${isDark ? "bg-slate-800 text-slate-400" : "bg-slate-100 text-slate-500"}`}>{log.entity}</span>
                    </div>
                    {log.details && <p className="text-xs text-slate-500 mt-1">{log.details}</p>}
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-400">
                      <span>{t("performedBy")}: {log.performed_by}</span>
                      <span>·</span>
                      <span>{new Date(log.created_at).toLocaleString(locale, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
