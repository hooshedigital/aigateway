import { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  Copy,
  Check,
  KeyRound,
  Shield,
  User as UserIcon,
  X,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useApp } from "@/contexts/AppContext";
import type { GatewayUser } from "@/types";

export function Users() {
  const { t, theme, lang } = useApp();
  const isDark = theme === "dark";
  const cardBg = isDark ? "bg-slate-900/60 border-slate-800" : "bg-white/70 border-slate-200";
  const inputClass = `w-full px-3.5 py-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 border ${isDark ? "border-slate-700" : "border-slate-300"} text-sm ${isDark ? "text-slate-100" : "text-slate-900"} placeholder-slate-400 focus:outline-none focus:border-cyan-500 transition-colors`;

  const [users, setUsers] = useState<GatewayUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [form, setForm] = useState({ name: "", email: "", role: "viewer" as "admin" | "viewer" });

  async function fetchUsers() {
    setLoading(true);
    const { data } = await supabase.from("gateway_users").select("*").order("created_at", { ascending: false });
    setUsers((data as GatewayUser[]) ?? []);
    setLoading(false);
  }

  useEffect(() => { fetchUsers(); }, []);

  function copyKey(key: string, id: string) {
    navigator.clipboard.writeText(key);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  async function toggleStatus(u: GatewayUser) {
    const newStatus = u.status === "active" ? "disabled" : "active";
    await supabase.from("gateway_users").update({ status: newStatus, updated_at: new Date().toISOString() }).eq("id", u.id);
    await supabase.from("audit_logs").insert({
      action: newStatus === "active" ? "enable_user" : "disable_user",
      entity: "gateway_users",
      entity_id: u.id,
      details: `User ${u.name} ${newStatus === "active" ? "enabled" : "disabled"}`,
      performed_by: "admin",
    });
    fetchUsers();
  }

  async function deleteUser(u: GatewayUser) {
    if (!confirm(`${t("deleteUserConfirm")} "${u.name}"?`)) return;
    await supabase.from("gateway_users").delete().eq("id", u.id);
    await supabase.from("audit_logs").insert({
      action: "delete_user",
      entity: "gateway_users",
      entity_id: u.id,
      details: `User ${u.name} deleted`,
      performed_by: "admin",
    });
    fetchUsers();
  }

  async function regenerateKey(u: GatewayUser) {
    const newKey = crypto.randomUUID();
    await supabase.from("gateway_users").update({ api_key: newKey, updated_at: new Date().toISOString() }).eq("id", u.id);
    await supabase.from("audit_logs").insert({
      action: "regenerate_key",
      entity: "gateway_users",
      entity_id: u.id,
      details: `API key regenerated for ${u.name}`,
      performed_by: "admin",
    });
    fetchUsers();
  }

  function resetForm() {
    setForm({ name: "", email: "", role: "viewer" });
    setEditingId(null);
    setError("");
  }

  async function saveUser() {
    if (!form.email.trim()) { setError(t("emailRequired")); return; }
    if (editingId) {
      await supabase.from("gateway_users").update({
        name: form.name.trim(),
        email: form.email.trim(),
        role: form.role,
        updated_at: new Date().toISOString(),
      }).eq("id", editingId);
      await supabase.from("audit_logs").insert({
        action: "edit_user",
        entity: "gateway_users",
        entity_id: editingId,
        details: `User ${form.name} edited`,
        performed_by: "admin",
      });
    } else {
      const { data } = await supabase.from("gateway_users").insert({
        name: form.name.trim() || form.email.split("@")[0],
        email: form.email.trim(),
        role: form.role,
        status: "active",
      }).select().single();
      if (data) {
        await supabase.from("audit_logs").insert({
          action: "create_user",
          entity: "gateway_users",
          entity_id: data.id,
          details: `User ${form.name} created with role ${form.role}`,
          performed_by: "admin",
        });
      }
    }
    resetForm();
    setShowAdd(false);
    fetchUsers();
  }

  function editUser(u: GatewayUser) {
    setEditingId(u.id);
    setForm({ name: u.name, email: u.email, role: u.role });
    setShowAdd(true);
  }

  const roleBadge = (role: string) => {
    if (role === "admin") return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20";
    return "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20";
  };

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? "text-slate-100" : "text-slate-900"}`}>{t("usersTitle")}</h1>
          <p className={`text-sm mt-1 ${isDark ? "text-slate-500" : "text-slate-500"}`}>{t("usersSubtitle")}</p>
        </div>
        <button onClick={() => { resetForm(); setShowAdd(true); }} className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-white text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" />{t("addUser")}
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-500 text-sm animate-scale-in">
          <AlertCircle className="w-4 h-4" />{error}
        </div>
      )}

      <div className={`${cardBg} rounded-xl overflow-hidden border backdrop-blur-xl`}>
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full">
            <thead>
              <tr className={`border-b ${isDark ? "border-slate-800" : "border-slate-200"}`}>
                <th className="text-start text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3">{t("name")}</th>
                <th className="text-start text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3">{t("role")}</th>
                <th className="text-start text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3">{t("apiKeyCol")}</th>
                <th className="text-start text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3">{t("status")}</th>
                <th className="text-end text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3">{t("edit")}</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? "divide-slate-800" : "divide-slate-200"}`}>
              {loading ? (
                <tr><td colSpan={5} className="text-center py-8"><div className="inline-block w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" /></td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-12 text-sm text-slate-500">{t("noUsers")}</td></tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-100/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${u.role === "admin" ? "bg-rose-500/10 text-rose-500" : "bg-cyan-500/10 text-cyan-500"}`}>
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className={`text-sm font-medium ${isDark ? "text-slate-200" : "text-slate-800"}`}>{u.name}</p>
                          <p className="text-xs text-slate-500">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium border ${roleBadge(u.role)}`}>
                        {u.role === "admin" ? t("admin") : t("viewer")}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <code className="text-xs text-slate-500 font-mono truncate max-w-[120px]">{u.api_key.slice(0, 16)}...</code>
                        <button onClick={() => copyKey(u.api_key, u.id)} className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                          {copiedId === u.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                        </button>
                        <button onClick={() => regenerateKey(u)} className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors" title={t("regenerateKey")}>
                          <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 text-xs ${u.status === "active" ? "text-emerald-500" : "text-slate-400"}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${u.status === "active" ? "bg-emerald-500" : "bg-slate-400"}`} />
                        {u.status === "active" ? t("active") : "Disabled"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => editUser(u)} className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">{t("edit")}</button>
                        <button onClick={() => toggleStatus(u)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" title={u.status === "active" ? t("disable") : t("enable")}>
                          {u.status === "active" ? <Shield className="w-4 h-4 text-amber-500" /> : <Shield className="w-4 h-4 text-emerald-500" />}
                        </button>
                        <button onClick={() => deleteUser(u)} className="p-1.5 rounded-lg hover:bg-rose-500/10 text-slate-500 hover:text-rose-500 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => { setShowAdd(false); resetForm(); }}>
          <div className={`w-full max-w-md ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"} border rounded-2xl shadow-2xl animate-scale-in`} onClick={(e) => e.stopPropagation()}>
            <div className={`flex items-center justify-between p-6 border-b ${isDark ? "border-slate-800" : "border-slate-200"}`}>
              <h2 className={`text-lg font-bold ${isDark ? "text-slate-100" : "text-slate-900"}`}>{editingId ? t("editUser") : t("addUser")}</h2>
              <button onClick={() => { setShowAdd(false); resetForm(); }} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-1.5 ${isDark ? "text-slate-300" : "text-slate-700"}`}>{t("name")}</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="John Doe" className={inputClass} />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1.5 ${isDark ? "text-slate-300" : "text-slate-700"}`}>{t("email")}</label>
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="user@example.com" className={inputClass} />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1.5 ${isDark ? "text-slate-300" : "text-slate-700"}`}>{t("role")}</label>
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => setForm({ ...form, role: "admin" })} className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium border transition-all ${form.role === "admin" ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30" : `bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-300 dark:border-slate-700`}`}>
                    <Shield className="w-4 h-4" />{t("admin")}
                  </button>
                  <button onClick={() => setForm({ ...form, role: "viewer" })} className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium border transition-all ${form.role === "viewer" ? "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/30" : `bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-300 dark:border-slate-700`}`}>
                    <UserIcon className="w-4 h-4" />{t("viewer")}
                  </button>
                </div>
              </div>
            </div>
            <div className={`flex items-center justify-end gap-3 p-6 border-t ${isDark ? "border-slate-800" : "border-slate-200"}`}>
              <button onClick={() => { setShowAdd(false); resetForm(); }} className="px-4 py-2.5 rounded-lg text-sm font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">{t("cancel")}</button>
              <button onClick={saveUser} className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-white text-sm font-medium transition-colors">
                <KeyRound className="w-4 h-4" />{editingId ? t("saveChanges") : t("addUser")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
