import { useState, useEffect } from "react";
import { Send, Plus, Trash2, Loader2, CheckCircle2, XCircle, Clock, Cpu, Server } from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { supabase } from "@/lib/supabase";
import type { Provider } from "@/types";

interface PlaygroundMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export function Playground() {
  const { t, theme, lang } = useApp();
  const isDark = theme === "dark";
  const cardBg = isDark ? "bg-slate-900/60 border-slate-800" : "bg-white/70 border-slate-200";
  const inputClass = `w-full px-3.5 py-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 border ${isDark ? "border-slate-700" : "border-slate-300"} text-sm ${isDark ? "text-slate-100" : "text-slate-900"} placeholder-slate-400 focus:outline-none focus:border-cyan-500 transition-colors`;

  const [providers, setProviders] = useState<Provider[]>([]);
  const [models, setModels] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState("");
  const [messages, setMessages] = useState<PlaygroundMessage[]>([
    { role: "user", content: "Hello! What can you do?" },
  ]);
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(4096);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
  const [responseTime, setResponseTime] = useState<number | null>(null);
  const [tokensUsed, setTokensUsed] = useState<number | null>(null);
  const [providerUsed, setProviderUsed] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from("providers").select("*").eq("status", "active").order("priority", { ascending: true });
      const provs = (data as Provider[]) ?? [];
      setProviders(provs);
      const modelSet = new Set<string>();
      provs.forEach((p) => p.models.forEach((m) => { if (m !== "*") modelSet.add(m); }));
      const arr = Array.from(modelSet);
      setModels(arr);
      if (arr.length > 0) setSelectedModel(arr[0]);
    }
    load();
  });

  async function sendRequest() {
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const { data: settingsData } = await supabase.from("settings").select("value").eq("key", "access_code").maybeSingle();
      const accessCode = settingsData?.value ?? "";

      const start = Date.now();
      const res = await fetch(`${supabaseUrl}/functions/v1/ai-gateway/v1/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessCode}`,
        },
        body: JSON.stringify({
          model: selectedModel,
          messages,
          temperature,
          max_tokens: maxTokens,
        }),
      });

      const elapsed = (Date.now() - start) / 1000;
      setResponseTime(elapsed);

      if (!res.ok) {
        const errData = await res.json().catch(() => ({ error: "Request failed" }));
        throw new Error(errData.error || `HTTP ${res.status}`);
      }

      const data = await res.json();
      setResponse(data.choices?.[0]?.message?.content ?? JSON.stringify(data));
      setTokensUsed(data.usage?.total_tokens ?? null);
      setProviderUsed(data.model ?? null);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  function addMessage() {
    setMessages([...messages, { role: "user", content: "" }]);
  }

  function updateMessage(idx: number, field: "role" | "content", value: string) {
    const updated = [...messages];
    updated[idx] = { ...updated[idx], [field]: value };
    setMessages(updated);
  }

  function removeMessage(idx: number) {
    setMessages(messages.filter((_, i) => i !== idx));
  }

  return (
    <div className="space-y-6 animate-slide-up">
      <div>
        <h1 className={`text-2xl font-bold ${isDark ? "text-slate-100" : "text-slate-900"}`}>{t("playgroundTitle")}</h1>
        <p className={`text-sm mt-1 ${isDark ? "text-slate-500" : "text-slate-500"}`}>{t("playgroundSubtitle")}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Request panel */}
        <div className={`${cardBg} rounded-xl p-6 border backdrop-blur-xl space-y-4`}>
          <div>
            <label className={`block text-sm font-medium mb-1.5 ${isDark ? "text-slate-300" : "text-slate-700"}`}>{t("model2")}</label>
            <select value={selectedModel} onChange={(e) => setSelectedModel(e.target.value)} className={inputClass}>
              {models.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-1.5 ${isDark ? "text-slate-300" : "text-slate-700"}`}>{t("messages")}</label>
            <div className="space-y-3">
              {messages.map((msg, idx) => (
                <div key={idx} className="flex gap-2 items-start">
                  <select
                    value={msg.role}
                    onChange={(e) => updateMessage(idx, "role", e.target.value)}
                    className={`px-2 py-2 rounded-lg text-xs font-medium border ${isDark ? "bg-slate-800 border-slate-700 text-slate-300" : "bg-slate-100 border-slate-300 text-slate-600"} focus:outline-none focus:border-cyan-500`}
                  >
                    <option value="system">{t("system")}</option>
                    <option value="user">{t("user")}</option>
                    <option value="assistant">{t("assistant")}</option>
                  </select>
                  <textarea
                    value={msg.content}
                    onChange={(e) => updateMessage(idx, "content", e.target.value)}
                    placeholder={t("content")}
                    rows={2}
                    className={`flex-1 ${inputClass} resize-none`}
                  />
                  {messages.length > 1 && (
                    <button onClick={() => removeMessage(idx)} className="p-2 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors flex-shrink-0">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button onClick={addMessage} className="flex items-center gap-1.5 mt-2 text-xs text-cyan-500 hover:text-cyan-400 transition-colors">
              <Plus className="w-3.5 h-3.5" /> {t("addMessage")}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-1.5 ${isDark ? "text-slate-300" : "text-slate-700"}`}>{t("temperature")}: {temperature}</label>
              <input type="range" min="0" max="2" step="0.1" value={temperature} onChange={(e) => setTemperature(parseFloat(e.target.value))} className="w-full accent-cyan-500" />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1.5 ${isDark ? "text-slate-300" : "text-slate-700"}`}>{t("maxTokens")}</label>
              <input type="number" value={maxTokens} onChange={(e) => setMaxTokens(parseInt(e.target.value) || 4096)} className={inputClass} />
            </div>
          </div>

          <button
            onClick={sendRequest}
            disabled={loading || !selectedModel}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-white text-sm font-medium transition-colors disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            {loading ? t("loading") : t("send")}
          </button>
        </div>

        {/* Response panel */}
        <div className={`${cardBg} rounded-xl p-6 border backdrop-blur-xl`}>
          <h2 className={`font-semibold text-lg mb-4 ${isDark ? "text-slate-100" : "text-slate-900"}`}>{t("response")}</h2>

          {error && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-500 text-sm animate-scale-in">
              <XCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {!error && !response && (
            <div className="text-center py-16">
              <Server className={`w-10 h-10 mx-auto mb-3 ${isDark ? "text-slate-700" : "text-slate-300"}`} />
              <p className={`text-sm ${isDark ? "text-slate-500" : "text-slate-400"}`}>{t("noResponse")}</p>
            </div>
          )}

          {response && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center gap-2 text-emerald-500">
                <CheckCircle2 className="w-5 h-5" />
                <span className="text-sm font-medium">{t("success")}</span>
              </div>

              <div className={`p-4 rounded-lg ${isDark ? "bg-slate-800/50" : "bg-slate-100"} text-sm ${isDark ? "text-slate-200" : "text-slate-800"} whitespace-pre-wrap leading-relaxed`}>
                {response}
              </div>

              <div className="grid grid-cols-3 gap-3">
                {responseTime != null && (
                  <div className={`p-3 rounded-lg ${isDark ? "bg-slate-800/50" : "bg-slate-100"} text-center`}>
                    <Clock className="w-4 h-4 text-amber-500 mx-auto mb-1" />
                    <p className="text-xs text-slate-500">{t("responseTime2")}</p>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{responseTime.toFixed(2)}s</p>
                  </div>
                )}
                {tokensUsed != null && (
                  <div className={`p-3 rounded-lg ${isDark ? "bg-slate-800/50" : "bg-slate-100"} text-center`}>
                    <Cpu className="w-4 h-4 text-violet-500 mx-auto mb-1" />
                    <p className="text-xs text-slate-500">{t("tokensUsed")}</p>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{tokensUsed.toLocaleString()}</p>
                  </div>
                )}
                {providerUsed && (
                  <div className={`p-3 rounded-lg ${isDark ? "bg-slate-800/50" : "bg-slate-100"} text-center`}>
                    <Server className="w-4 h-4 text-cyan-500 mx-auto mb-1" />
                    <p className="text-xs text-slate-500">{t("provider2")}</p>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-200 truncate">{providerUsed}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Active providers info */}
      <div className={`${cardBg} rounded-xl p-6 border backdrop-blur-xl`}>
        <h2 className={`font-semibold text-lg mb-3 ${isDark ? "text-slate-100" : "text-slate-900"}`}>{t("providers")}</h2>
        <div className="flex gap-2 flex-wrap">
          {providers.map((p) => (
            <div key={p.id} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${isDark ? "bg-slate-800/50" : "bg-slate-100"}`}>
              <div className={`w-2 h-2 rounded-full ${p.status === "active" ? "bg-emerald-500" : "bg-slate-400"}`} />
              <span className="text-sm text-slate-600 dark:text-slate-300">{p.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
