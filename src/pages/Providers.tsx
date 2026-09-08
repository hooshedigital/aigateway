import { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Server,
  Key,
  Globe,
  ChevronUp,
  ChevronDown,
  X,
  AlertCircle,
  DollarSign,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useApp } from "@/contexts/AppContext";
import type { Provider } from "@/types";

const COST_PER_1K: Record<string, number> = {
  "OpenAI": 0.005,
  "Anthropic": 0.003,
  "Google Gemini": 0.001,
  "Groq": 0.0001,
  "Cohere": 0.002,
  "OpenRouter": 0.002,
  "ChatGPT Browser": 0,
  "Gemini Browser": 0,
};

export function Providers() {
  const { t, theme } = useApp();
  const isDark = theme === "dark";
  const cardBg = isDark ? "bg-slate-900/60 border-slate-800" : "bg-white/70 border-slate-200";

  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    type: "api_key" as "api_key" | "token_free",
    base_url: "",
    api_key: "",
    models: "",
    priority: 100,
  });

  async function fetchProviders() {
    setLoading(true);
    const { data } = await supabase.from("providers").select("*").order("priority", { ascending: true });
    setProviders((data as Provider[]) ?? []);
    setLoading(false);
  }

  useEffect(() => {
    fetchProviders();
  }, []);

  async function toggleStatus(p: Provider) {
    const newStatus = p.status === "active" ? "inactive" : "active";
    await supabase.from("providers").update({ status: newStatus, updated_at: new Date().toISOString() }).eq("id", p.id);
    fetchProviders();
  }

  async function movePriority(p: Provider, dir: "up" | "down") {
    const newPriority = dir === "up" ? p.priority - 5 : p.priority + 5;
    await supabase.from("providers").update({ priority: newPriority, updated_at: new Date().toISOString() }).eq("id", p.id);
    fetchProviders();
  }

  async function deleteProvider(p: Provider) {
    if (!confirm(`${t("deleteConfirm")} "${p.name}"?`)) return;
    await supabase.from("providers").delete().eq("id", p.id);
    fetchProviders();
  }

  function resetForm() {
    setForm({ name: "", type: "api_key", base_url: "", api_key: "", models: "", priority: 100 });
    setEditingId(null);
    setError("");
  }

  async function saveProvider() {
    if (!form.name.trim()) {
      setError(t("nameRequired"));
      return;
    }
    const modelsArray = form.models.split(",").map((m) => m.trim()).filter(Boolean);
    const payload = {
      name: form.name.trim(),
      type: form.type,
      base_url: form.base_url.trim() || null,
      api_key: form.api_key.trim() || null,
      models: modelsArray,
      priority: form.priority,
      status: "active" as const,
    };

    if (editingId) {
      let updatePayload: Record<string, unknown> = { ...payload, updated_at: new Date().toISOString() };
      if (!form.api_key.trim()) {
        const { api_key: _omit, ...rest } = updatePayload;
        void _omit;
        updatePayload = rest;
      }
      await supabase.from("providers").update(updatePayload).eq("id", editingId);
    } else {
      await supabase.from("providers").insert(payload);
    }
    resetForm();
    setShowAdd(false);
    fetchProviders();
  }

  function editProvider(p: Provider) {
    setEditingId(p.id);
    setForm({
      name: p.name,
      type: p.type,
      base_url: p.base_url ?? "",
      api_key: "",
      models: p.models.join(", "),
      priority: p.priority,
    });
    setShowAdd(true);
  }

  const inputClass = `w-full px-3.5 py-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 border ${isDark ? "border-slate-700" : "border-slate-300"} text-sm ${isDark ? "text-slate-100" : "text-slate-900"} placeholder-slate-400 focus:outline-none focus:border-cyan-500 transition-colors`;

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? "text-slate-100" : "text-slate-900"}`}>{t("providersTitle")}</h1>
          <p className={`text-sm mt-1 ${isDark ? "text-slate-500" : "text-slate-500"}`}>{t("providersSubtitle")}</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowAdd(true); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-white text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          {t("addProvider")}
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-500 text-sm animate-scale-in">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {/* Cost comparison table */}
      {providers.length > 0 && (
        <div className={`${cardBg} rounded-xl p-6 backdrop-blur-xl border`}>
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="w-5 h-5 text-cyan-500" />
            <h2 className={`font-semibold ${isDark ? "text-slate-100" : "text-slate-900"}`}>{t("costComparison")}</h2>
          </div>
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-sm">
              <thead>
                <tr className={`border-b ${isDark ? "border-slate-800" : "border-slate-200"}`}>
                  <th className="text-start py-2 px-3 font-medium text-slate-500">{t("name")}</th>
                  <th className="text-start py-2 px-3 font-medium text-slate-500">{t("type")}</th>
                  <th className="text-end py-2 px-3 font-medium text-slate-500">{t("costPer1k")}</th>
                  <th className="text-end py-2 px-3 font-medium text-slate-500">{t("status")}</th>
                </tr>
              </thead>
              <tbody>
                {providers.map((p) => (
                  <tr key={p.id} className={`border-b ${isDark ? "border-slate-800/50" : "border-slate-100"}`}>
                    <td className={`py-2 px-3 ${isDark ? "text-slate-200" : "text-slate-800"}`}>{p.name}</td>
                    <td className="py-2 px-3">
                      <span className={`px-2 py-0.5 rounded text-xs ${p.type === "token_free" ? "bg-amber-500/10 text-amber-600 dark:text-amber-400" : "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400"}`}>
                        {p.type === "token_free" ? t("tokenFree") : t("apiKey")}
                      </span>
                    </td>
                    <td className="text-end py-2 px-3 font-mono text-slate-500">
                      ${(COST_PER_1K[p.name] ?? 0.001).toFixed(4)}
                    </td>
                    <td className="text-end py-2 px-3">
                      <span className={`inline-flex items-center gap-1 text-xs ${p.status === "active" ? "text-emerald-500" : "text-slate-400"}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${p.status === "active" ? "bg-emerald-500" : "bg-slate-400"}`} />
                        {p.status === "active" ? t("active") : "Inactive"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Provider list */}
      <div className="space-y-3">
        {loading ? (
          [1, 2, 3].map((i) => <div key={i} className="h-20 bg-slate-900/60 dark:border-slate-800 border border-slate-200 rounded-xl animate-pulse" />)
        ) : providers.length === 0 ? (
          <div className={`text-center py-16 ${cardBg} rounded-xl border`}>
            <Server className="w-10 h-10 text-slate-400 mx-auto mb-3" />
            <p className={isDark ? "text-slate-500" : "text-slate-500"}>{t("noProviders")}</p>
          </div>
        ) : (
          providers.map((p, idx) => (
            <div key={p.id} className={`${cardBg} border rounded-xl p-4 transition-all ${p.status === "active" ? "" : "opacity-60"}`}>
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex flex-col gap-0.5">
                  <button onClick={() => movePriority(p, "up")} disabled={idx === 0} className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-30 transition-colors">
                    <ChevronUp className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-xs text-center text-slate-500 font-mono w-6">{p.priority}</span>
                  <button onClick={() => movePriority(p, "down")} disabled={idx === providers.length - 1} className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-30 transition-colors">
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className={`font-semibold ${isDark ? "text-slate-100" : "text-slate-900"}`}>{p.name}</h3>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${p.type === "token_free" ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20" : "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20"}`}>
                      {p.type === "token_free" ? t("tokenFree") : t("apiKey")}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${p.status === "active" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20" : "bg-slate-200 text-slate-500 dark:bg-slate-700/30 dark:text-slate-500 border border-slate-300 dark:border-slate-700"}`}>
                      {p.status === "active" ? t("active") : "Inactive"}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mt-1.5 text-xs text-slate-500 flex-wrap">
                    {p.base_url && (
                      <span className="flex items-center gap-1"><Globe className="w-3 h-3" />{p.base_url}</span>
                    )}
                    <span className="flex items-center gap-1"><Key className="w-3 h-3" />{p.api_key ? t("keySet") : t("noKey")}</span>
                    <span className="flex items-center gap-1"><Server className="w-3 h-3" />{p.models.length} {t("models")}{p.models.length !== 1 ? "s" : ""}</span>
                  </div>
                  {p.models.length > 0 && (
                    <div className="flex gap-1.5 mt-2 flex-wrap">
                      {p.models.slice(0, 5).map((m) => (
                        <span key={m} className={`px-2 py-0.5 rounded text-xs font-mono ${isDark ? "bg-slate-800 text-slate-400" : "bg-slate-100 text-slate-600"}`}>{m}</span>
                      ))}
                      {p.models.length > 5 && (
                        <span className={`px-2 py-0.5 rounded text-xs ${isDark ? "bg-slate-800 text-slate-500" : "bg-slate-100 text-slate-500"}`}>+{p.models.length - 5}</span>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button onClick={() => editProvider(p)} className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">{t("edit")}</button>
                  <button onClick={() => toggleStatus(p)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" title={p.status === "active" ? t("deactivate") : t("activate")}>
                    {p.status === "active" ? <ToggleRight className="w-6 h-6 text-emerald-500" /> : <ToggleLeft className="w-6 h-6 text-slate-400" />}
                  </button>
                  <button onClick={() => deleteProvider(p)} className="p-2 rounded-lg hover:bg-rose-500/10 text-slate-500 hover:text-rose-500 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add/Edit modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => { setShowAdd(false); resetForm(); }}>
          <div className={`w-full max-w-lg ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"} border rounded-2xl shadow-2xl animate-scale-in`} onClick={(e) => e.stopPropagation()}>
            <div className={`flex items-center justify-between p-6 border-b ${isDark ? "border-slate-800" : "border-slate-200"}`}>
              <h2 className={`text-lg font-bold ${isDark ? "text-slate-100" : "text-slate-900"}`}>{editingId ? t("editProvider") : t("addProvider")}</h2>
              <button onClick={() => { setShowAdd(false); resetForm(); }} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-1.5 ${isDark ? "text-slate-300" : "text-slate-700"}`}>{t("name")}</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="OpenRouter, Groq, OpenAI..." className={inputClass} />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1.5 ${isDark ? "text-slate-300" : "text-slate-700"}`}>{t("type")}</label>
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => setForm({ ...form, type: "api_key" })} className={`px-4 py-2.5 rounded-lg text-sm font-medium border transition-all ${form.type === "api_key" ? "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/30" : `bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-300 dark:border-slate-700`}`}>{t("apiKey")}</button>
                  <button onClick={() => setForm({ ...form, type: "token_free" })} className={`px-4 py-2.5 rounded-lg text-sm font-medium border transition-all ${form.type === "token_free" ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30" : `bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-300 dark:border-slate-700`}`}>{t("tokenFree")}</button>
                </div>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1.5 ${isDark ? "text-slate-300" : "text-slate-700"}`}>{t("baseUrl")}</label>
                <input type="text" value={form.base_url} onChange={(e) => setForm({ ...form, base_url: e.target.value })} placeholder="https://api.openai.com/v1" className={inputClass} />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1.5 ${isDark ? "text-slate-300" : "text-slate-700"}`}>{t("apiKeyLabel")} {editingId && <span className="text-slate-400">{t("leaveBlankKeep")}</span>}</label>
                <input type="password" value={form.api_key} onChange={(e) => setForm({ ...form, api_key: e.target.value })} placeholder="sk-..." className={inputClass} />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1.5 ${isDark ? "text-slate-300" : "text-slate-700"}`}>{t("modelsLabel")}</label>
                <input type="text" value={form.models} onChange={(e) => setForm({ ...form, models: e.target.value })} placeholder="gpt-4o, gpt-4o-mini, claude-3.5-sonnet" className={inputClass} />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1.5 ${isDark ? "text-slate-300" : "text-slate-700"}`}>{t("priority")}</label>
                <input type="number" value={form.priority} onChange={(e) => setForm({ ...form, priority: parseInt(e.target.value) || 100 })} className={inputClass} />
              </div>
            </div>
            <div className={`flex items-center justify-end gap-3 p-6 border-t ${isDark ? "border-slate-800" : "border-slate-200"}`}>
              <button onClick={() => { setShowAdd(false); resetForm(); }} className="px-4 py-2.5 rounded-lg text-sm font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">{t("cancel")}</button>
              <button onClick={saveProvider} className="px-4 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-white text-sm font-medium transition-colors">{editingId ? t("saveChanges") : t("addProvider")}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
