import { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  RefreshCw,
  Activity,
  AlertTriangle,
  ShieldOff,
  ShieldCheck,
  X,
  Clock,
  Globe,
  Cpu,
  Eye,
  EyeOff,
  HelpCircle,
  Info,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useApp } from "@/contexts/AppContext";
import type { BrowserSession } from "@/types";

const PROVIDER_OPTIONS = [
  "ChatGPT Browser",
  "Gemini Browser",
  "Claude Browser",
];

export function Sessions() {
  const { t, theme, lang } = useApp();
  const isDark = theme === "dark";
  const cardBg = isDark ? "bg-slate-900/60 border-slate-800" : "bg-white/70 border-slate-200";
  const inputClass = `w-full px-3.5 py-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 border ${isDark ? "border-slate-700" : "border-slate-300"} text-sm ${isDark ? "text-slate-100" : "text-slate-900"} placeholder-slate-400 focus:outline-none focus:border-cyan-500 transition-colors`;

  const [sessions, setSessions] = useState<BrowserSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showToken, setShowToken] = useState<string | null>(null);
  const [showTokenHint, setShowTokenHint] = useState(false);
  const [form, setForm] = useState({
    provider: "ChatGPT Browser",
    account_name: "",
    token: "",
    user_agent: "",
    ip_address: "",
    expires_at: "",
  });

  async function fetchSessions() {
    setLoading(true);
    const { data } = await supabase.from("browser_sessions").select("*").order("created_at", { ascending: false });
    setSessions((data as BrowserSession[]) ?? []);
    setLoading(false);
  }

  useEffect(() => { fetchSessions(); }, []);

  async function rotateSession(s: BrowserSession) {
    // Real rotation: expire this session and activate the next available one
    await supabase.from("browser_sessions").update({
      status: "expired",
      updated_at: new Date().toISOString(),
    }).eq("id", s.id);

    // Find next active session for same provider
    const { data: next } = await supabase
      .from("browser_sessions")
      .select("*")
      .eq("provider", s.provider)
      .eq("status", "active")
      .neq("id", s.id)
      .order("last_used", { ascending: true, nullsFirst: true })
      .limit(1)
      .maybeSingle();

    if (next) {
      await supabase.from("browser_sessions").update({
        requests_count: 0,
        updated_at: new Date().toISOString(),
      }).eq("id", next.id);
    }

    await supabase.from("audit_logs").insert({
      action: "rotate_session",
      entity: "browser_sessions",
      entity_id: s.id,
      details: `Session rotated for ${s.provider}${next ? `, next session ${next.id} activated` : ", no replacement"}`,
      performed_by: "admin",
    });
    fetchSessions();
  }

  async function rotateAll() {
    if (!confirm(t("rotateAllConfirm"))) return;
    const active = sessions.filter((s) => s.status === "active");
    for (const s of active) {
      await rotateSession(s);
    }
  }

  async function quarantineSession(s: BrowserSession) {
    const newStatus = s.status === "quarantined" ? "active" : "quarantined";
    await supabase.from("browser_sessions").update({
      status: newStatus,
      updated_at: new Date().toISOString(),
    }).eq("id", s.id);
    await supabase.from("audit_logs").insert({
      action: newStatus === "quarantined" ? "quarantine_session" : "unquarantine_session",
      entity: "browser_sessions",
      entity_id: s.id,
      details: `Session ${s.provider} ${newStatus === "quarantined" ? "quarantined" : "unquarantined"}`,
      performed_by: "admin",
    });
    fetchSessions();
  }

  async function deleteSession(s: BrowserSession) {
    if (!confirm(`${t("deleteConfirm")}?`)) return;
    await supabase.from("browser_sessions").delete().eq("id", s.id);
    await supabase.from("audit_logs").insert({
      action: "delete_session",
      entity: "browser_sessions",
      entity_id: s.id,
      details: `Session for ${s.provider} deleted`,
      performed_by: "admin",
    });
    fetchSessions();
  }

  async function saveSession() {
    if (!form.token.trim()) return;
    const payload = {
      provider: form.provider,
      account_name: form.account_name.trim() || null,
      token: form.token.trim(),
      user_agent: form.user_agent.trim() || null,
      ip_address: form.ip_address.trim() || null,
      expires_at: form.expires_at ? new Date(form.expires_at).toISOString() : null,
      status: "active" as const,
    };
    if (editingId) {
      await supabase.from("browser_sessions").update({ ...payload, updated_at: new Date().toISOString() }).eq("id", editingId);
      await supabase.from("audit_logs").insert({
        action: "edit_session", entity: "browser_sessions", entity_id: editingId,
        details: `Session for ${form.provider} edited`, performed_by: "admin",
      });
    } else {
      const { data } = await supabase.from("browser_sessions").insert(payload).select().single();
      if (data) {
        await supabase.from("audit_logs").insert({
          action: "create_session", entity: "browser_sessions", entity_id: data.id,
          details: `Session for ${form.provider} created`, performed_by: "admin",
        });
      }
    }
    setForm({ provider: "ChatGPT Browser", account_name: "", token: "", user_agent: "", ip_address: "", expires_at: "" });
    setEditingId(null);
    setShowAdd(false);
    fetchSessions();
  }

  function editSession(s: BrowserSession) {
    setEditingId(s.id);
    setForm({
      provider: s.provider,
      account_name: s.account_name ?? "",
      token: s.token,
      user_agent: s.user_agent ?? "",
      ip_address: s.ip_address ?? "",
      expires_at: s.expires_at ? s.expires_at.slice(0, 16) : "",
    });
    setShowAdd(true);
  }

  const activeCount = sessions.filter((s) => s.status === "active").length;
  const expiredCount = sessions.filter((s) => s.status === "expired").length;
  const quarantinedCount = sessions.filter((s) => s.status === "quarantined").length;
  const avgHealth = sessions.length > 0
    ? sessions.reduce((sum, s) => sum + s.health_score, 0) / sessions.length
    : 100;

  // Check for sessions expiring within 24 hours
  const expiringSoon = sessions.filter((s) => {
    if (!s.expires_at || s.status !== "active") return false;
    const hoursLeft = (new Date(s.expires_at).getTime() - Date.now()) / (1000 * 60 * 60);
    return hoursLeft > 0 && hoursLeft < 24;
  });

  const expiredTokens = sessions.filter((s) => {
    if (!s.expires_at || s.status !== "active") return false;
    return new Date(s.expires_at).getTime() < Date.now();
  });

  // Group sessions by provider for multi-account display
  const sessionsByProvider = new Map<string, BrowserSession[]>();
  for (const s of sessions) {
    const arr = sessionsByProvider.get(s.provider) ?? [];
    arr.push(s);
    sessionsByProvider.set(s.provider, arr);
  }

  const statusColors: Record<string, string> = {
    active: "text-emerald-500 bg-emerald-500/10",
    expired: "text-slate-400 bg-slate-500/10",
    rotating: "text-amber-500 bg-amber-500/10",
    quarantined: "text-rose-500 bg-rose-500/10",
    failed: "text-rose-500 bg-rose-500/10",
  };

  const locale = lang === "fa" ? "fa" : "en";

  function getTokenHint(provider: string): string {
    if (provider === "ChatGPT Browser") return t("sessionTokenHintChatGPT");
    if (provider === "Gemini Browser") return t("sessionTokenHintGemini");
    if (provider === "Claude Browser") return t("sessionTokenHintClaude");
    return t("sessionTokenHintChatGPT");
  }

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? "text-slate-100" : "text-slate-900"}`}>{t("sessionsTitle")}</h1>
          <p className={`text-sm mt-1 ${isDark ? "text-slate-500" : "text-slate-500"}`}>{t("sessionsSubtitle")}</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={rotateAll} className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 text-sm font-medium transition-colors border border-amber-500/20">
            <RefreshCw className="w-4 h-4" />{t("rotateAll")}
          </button>
          <button onClick={() => { setEditingId(null); setForm({ provider: "ChatGPT Browser", account_name: "", token: "", user_agent: "", ip_address: "", expires_at: "" }); setShowAdd(true); }} className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-white text-sm font-medium transition-colors">
            <Plus className="w-4 h-4" />{t("addSession")}
          </button>
        </div>
      </div>

      {/* Multi-account info banner */}
      <div className="flex items-start gap-3 px-4 py-3 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 dark:text-cyan-400 text-sm">
        <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
        <span>{t("sessionAddMultiple")}</span>
      </div>

      {/* Expiry warnings */}
      {expiredTokens.length > 0 && (
        <div className="flex items-start gap-3 px-4 py-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-sm">
          <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{expiredTokens.length} {t("sessionExpiredToken")} — {expiredTokens.map((s) => s.account_name ?? s.provider).join(", ")}</span>
        </div>
      )}
      {expiringSoon.length > 0 && (
        <div className="flex items-start gap-3 px-4 py-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-sm">
          <Clock className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{expiringSoon.length} {t("sessionExpiringSoon")} — {expiringSoon.map((s) => s.account_name ?? s.provider).join(", ")}</span>
        </div>
      )}

      {/* No active sessions warning */}
      {activeCount === 0 && !loading && (
        <div className="flex items-start gap-3 px-4 py-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-sm">
          <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{t("sessionNoActive")}</span>
        </div>
      )}

      {/* Pool status cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: t("activeSessions"), value: activeCount, icon: ShieldCheck, color: "emerald" },
          { label: t("expiredSessions"), value: expiredCount, icon: Clock, color: "slate" },
          { label: t("quarantinedSessions"), value: quarantinedCount, icon: ShieldOff, color: "rose" },
          { label: t("avgSessionHealth"), value: `${avgHealth.toFixed(0)}%`, icon: Activity, color: "cyan" },
        ].map((card) => {
          const Icon = card.icon;
          const colorMap: Record<string, string> = {
            emerald: isDark ? "from-emerald-500/20 to-emerald-500/5 text-emerald-400 border-emerald-500/20" : "from-emerald-500/10 to-emerald-500/5 text-emerald-600 border-emerald-500/20",
            slate: isDark ? "from-slate-500/20 to-slate-500/5 text-slate-400 border-slate-500/20" : "from-slate-500/10 to-slate-500/5 text-slate-600 border-slate-500/20",
            rose: isDark ? "from-rose-500/20 to-rose-500/5 text-rose-400 border-rose-500/20" : "from-rose-500/10 to-rose-500/5 text-rose-600 border-rose-500/20",
            cyan: isDark ? "from-cyan-500/20 to-cyan-500/5 text-cyan-400 border-cyan-500/20" : "from-cyan-500/10 to-cyan-500/5 text-cyan-600 border-cyan-500/20",
          };
          return (
            <div key={card.label} className={`bg-gradient-to-br ${colorMap[card.color]} border rounded-xl p-5 backdrop-blur-xl`}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider font-medium">{card.label}</p>
                  <p className="text-2xl font-bold mt-2 text-white">{card.value}</p>
                </div>
                <div className={`p-2.5 rounded-lg bg-gradient-to-br ${colorMap[card.color]}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Sessions table */}
      <div className={`${cardBg} rounded-xl overflow-hidden border backdrop-blur-xl`}>
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full">
            <thead>
              <tr className={`border-b ${isDark ? "border-slate-800" : "border-slate-200"}`}>
                <th className="text-start text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3">{t("sessionProvider")}</th>
                <th className="text-start text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3 hidden md:table-cell">{t("sessionAccountName")}</th>
                <th className="text-start text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3">{t("sessionStatus")}</th>
                <th className="text-start text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3">{t("sessionHealth")}</th>
                <th className="text-start text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3">{t("sessionRequests")}</th>
                <th className="text-start text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3 hidden lg:table-cell">{t("sessionLastUsed")}</th>
                <th className="text-start text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3 hidden lg:table-cell">{t("sessionExpires")}</th>
                <th className="text-end text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3">{t("edit")}</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? "divide-slate-800" : "divide-slate-200"}`}>
              {loading ? (
                <tr><td colSpan={8} className="text-center py-8"><div className="inline-block w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" /></td></tr>
              ) : sessions.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-12 text-sm text-slate-500">{t("noSessions")}</td></tr>
              ) : (
                sessions.map((s) => {
                  const isExpired = s.expires_at && new Date(s.expires_at).getTime() < Date.now();
                  const isExpiringSoon = s.expires_at && s.status === "active" && !isExpired && (new Date(s.expires_at).getTime() - Date.now()) / (1000 * 60 * 60) < 24;
                  return (
                    <tr key={s.id} className="hover:bg-slate-100/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Globe className="w-4 h-4 text-slate-400 flex-shrink-0" />
                          <div>
                            <p className={`text-sm font-medium ${isDark ? "text-slate-200" : "text-slate-800"}`}>{s.provider}</p>
                            <div className="flex items-center gap-1">
                              <code className="text-xs text-slate-500 font-mono">{showToken === s.id ? s.token : `${s.token.slice(0, 8)}...`}</code>
                              <button onClick={() => setShowToken(showToken === s.id ? null : s.id)} className="p-0.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                                {showToken === s.id ? <EyeOff className="w-3 h-3 text-slate-400" /> : <Eye className="w-3 h-3 text-slate-400" />}
                              </button>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        {s.account_name ? (
                          <span className={`text-sm ${isDark ? "text-slate-300" : "text-slate-700"}`}>{s.account_name}</span>
                        ) : (
                          <span className="text-xs text-slate-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${statusColors[s.status] ?? statusColors.active} w-fit`}>
                            {s.status === "active" ? t("sessionActive") : s.status === "expired" ? t("sessionExpired") : s.status === "quarantined" ? t("sessionQuarantined") : s.status === "rotating" ? t("sessionRotating") : t("sessionFailed")}
                          </span>
                          {isExpiringSoon && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 w-fit">
                              <Clock className="w-3 h-3" />{t("sessionExpiringSoon")}
                            </span>
                          )}
                          {isExpired && s.status === "active" && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-rose-500/10 text-rose-600 dark:text-rose-400 w-fit">
                              <AlertTriangle className="w-3 h-3" />{t("sessionExpiredToken")}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${s.health_score >= 80 ? "bg-emerald-500" : s.health_score >= 50 ? "bg-amber-500" : "bg-rose-500"}`} style={{ width: `${s.health_score}%` }} />
                          </div>
                          <span className="text-xs font-mono text-slate-500">{s.health_score.toFixed(0)}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-slate-500 font-mono">{s.requests_count}</span>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <span className="text-xs text-slate-500">{s.last_used ? new Date(s.last_used).toLocaleString(locale, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "—"}</span>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <span className={`text-xs ${isExpired ? "text-rose-500" : isExpiringSoon ? "text-amber-500" : "text-slate-500"}`}>
                          {s.expires_at ? new Date(s.expires_at).toLocaleString(locale, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => rotateSession(s)} className="p-1.5 rounded-lg hover:bg-amber-500/10 text-slate-500 hover:text-amber-500 transition-colors" title={t("rotateSession")}>
                            <RefreshCw className="w-4 h-4" />
                          </button>
                          <button onClick={() => quarantineSession(s)} className="p-1.5 rounded-lg hover:bg-rose-500/10 text-slate-500 hover:text-rose-500 transition-colors" title={s.status === "quarantined" ? t("unquarantineSession") : t("quarantineSession")}>
                            {s.status === "quarantined" ? <ShieldCheck className="w-4 h-4" /> : <ShieldOff className="w-4 h-4" />}
                          </button>
                          <button onClick={() => editSession(s)} className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">{t("edit")}</button>
                          <button onClick={() => deleteSession(s)} className="p-1.5 rounded-lg hover:bg-rose-500/10 text-slate-500 hover:text-rose-500 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setShowAdd(false)}>
          <div className={`w-full max-w-md ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"} border rounded-2xl shadow-2xl animate-scale-in max-h-[90vh] overflow-y-auto scrollbar-thin`} onClick={(e) => e.stopPropagation()}>
            <div className={`flex items-center justify-between p-6 border-b ${isDark ? "border-slate-800" : "border-slate-200"}`}>
              <h2 className={`text-lg font-bold ${isDark ? "text-slate-100" : "text-slate-900"}`}>{editingId ? t("editSession") : t("addSession")}</h2>
              <button onClick={() => setShowAdd(false)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-1.5 ${isDark ? "text-slate-300" : "text-slate-700"}`}>{t("sessionProvider")}</label>
                <select value={form.provider} onChange={(e) => setForm({ ...form, provider: e.target.value })} className={inputClass}>
                  {PROVIDER_OPTIONS.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1.5 ${isDark ? "text-slate-300" : "text-slate-700"}`}>{t("sessionAccountName")}</label>
                <input type="text" value={form.account_name} onChange={(e) => setForm({ ...form, account_name: e.target.value })} placeholder={t("sessionAccountNamePlaceholder")} className={inputClass} />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className={`text-sm font-medium ${isDark ? "text-slate-300" : "text-slate-700"}`}>{t("sessionToken")}</label>
                  <button onClick={() => setShowTokenHint(!showTokenHint)} className="flex items-center gap-1 text-xs text-cyan-500 hover:text-cyan-400 transition-colors">
                    <HelpCircle className="w-3.5 h-3.5" />{t("sessionTokenHint")}
                  </button>
                </div>
                {showTokenHint && (
                  <div className={`mb-2 p-3 rounded-lg ${isDark ? "bg-slate-800/50" : "bg-slate-100"} border ${isDark ? "border-slate-700" : "border-slate-200"} animate-slide-up`}>
                    <pre className={`text-xs whitespace-pre-wrap ${isDark ? "text-slate-400" : "text-slate-600"}`}>{getTokenHint(form.provider)}</pre>
                  </div>
                )}
                <textarea value={form.token} onChange={(e) => setForm({ ...form, token: e.target.value })} placeholder="Paste token or cookie..." className={`${inputClass} h-20 resize-none`} />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1.5 ${isDark ? "text-slate-300" : "text-slate-700"}`}>{t("sessionUserAgent")}</label>
                <input type="text" value={form.user_agent} onChange={(e) => setForm({ ...form, user_agent: e.target.value })} placeholder="Mozilla/5.0..." className={inputClass} />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1.5 ${isDark ? "text-slate-300" : "text-slate-700"}`}>{t("sessionIpAddress")}</label>
                <input type="text" value={form.ip_address} onChange={(e) => setForm({ ...form, ip_address: e.target.value })} placeholder="192.168.1.1" className={inputClass} />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1.5 ${isDark ? "text-slate-300" : "text-slate-700"}`}>{t("sessionExpires")}</label>
                <input type="datetime-local" value={form.expires_at} onChange={(e) => setForm({ ...form, expires_at: e.target.value })} className={inputClass} />
              </div>
            </div>
            <div className={`flex items-center justify-end gap-3 p-6 border-t ${isDark ? "border-slate-800" : "border-slate-200"}`}>
              <button onClick={() => setShowAdd(false)} className="px-4 py-2.5 rounded-lg text-sm font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">{t("cancel")}</button>
              <button onClick={saveSession} className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-white text-sm font-medium transition-colors">
                <Cpu className="w-4 h-4" />{editingId ? t("saveChanges") : t("addSession")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
