import { useState, useEffect } from "react";
import { Save, AlertCircle, Check, Moon, Sun, Languages, Bell, Webhook, Send } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useApp } from "@/contexts/AppContext";
import type { Setting, AlertConfig } from "@/types";

export function SettingsPage() {
  const { t, theme, setTheme, lang, setLang } = useApp();
  const isDark = theme === "dark";
  const cardBg = isDark ? "bg-slate-900/60 border-slate-800" : "bg-white/70 border-slate-200";

  const [settings, setSettings] = useState<Setting[]>([]);
  const [alertConfigs, setAlertConfigs] = useState<AlertConfig[]>([]);
  const [alertValues, setAlertValues] = useState<Record<string, string>>({});
  const [alertEnabled, setAlertEnabled] = useState<Record<string, boolean>>({});
  const [alertSaving, setAlertSaving] = useState(false);
  const [alertSaved, setAlertSaved] = useState(false);
  const [webhookTesting, setWebhookTesting] = useState(false);
  const [webhookTested, setWebhookTested] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [values, setValues] = useState<Record<string, string>>({});

  useEffect(() => {
    async function fetchSettings() {
      setLoading(true);
      const [{ data: settingsData }, { data: alertData }] = await Promise.all([
        supabase.from("settings").select("*").order("key", { ascending: true }),
        supabase.from("alert_config").select("*").order("key", { ascending: true }),
      ]);
      const sData = (settingsData as Setting[]) ?? [];
      setSettings(sData);
      const vals: Record<string, string> = {};
      sData.forEach((s) => { vals[s.key] = s.value ?? ""; });
      setValues(vals);

      const aData = (alertData as AlertConfig[]) ?? [];
      setAlertConfigs(aData);
      const aVals: Record<string, string> = {};
      const aEna: Record<string, boolean> = {};
      aData.forEach((a) => { aVals[a.key] = a.value ?? ""; aEna[a.key] = a.enabled; });
      setAlertValues(aVals);
      setAlertEnabled(aEna);
      setLoading(false);
    }
    fetchSettings();
  }, []);

  async function saveAll() {
    setSaving(true);
    for (const s of settings) {
      const newVal = values[s.key] ?? "";
      if (newVal !== (s.value ?? "")) {
        await supabase.from("settings").update({ value: newVal, updated_at: new Date().toISOString() }).eq("id", s.id);
      }
    }
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const friendlyLabels: Record<string, { labelKey: string; descKey: string; type?: "text" | "password" | "number" }> = {
    access_code: { labelKey: "accessCode", descKey: "accessCodeDesc", type: "password" },
    rate_limit_per_minute: { labelKey: "rateLimit", descKey: "rateLimitDesc", type: "number" },
    cors_origins: { labelKey: "corsOrigins", descKey: "corsDesc" },
    gateway_name: { labelKey: "gatewayName", descKey: "gatewayNameDesc" },
    default_model: { labelKey: "defaultModel", descKey: "defaultModelDesc" },
    fallback_enabled: { labelKey: "fallbackEnabled", descKey: "fallbackDesc" },
  };

  async function saveAlerts() {
    setAlertSaving(true);
    for (const a of alertConfigs) {
      const newVal = alertValues[a.key] ?? "";
      const newEna = alertEnabled[a.key] ?? true;
      if (newVal !== (a.value ?? "") || newEna !== a.enabled) {
        await supabase.from("alert_config").update({ value: newVal, enabled: newEna, updated_at: new Date().toISOString() }).eq("id", a.id);
      }
    }
    setAlertSaving(false);
    setAlertSaved(true);
    setTimeout(() => setAlertSaved(false), 2000);
  }

  async function testWebhook() {
    const url = alertValues["webhook_url"];
    if (!url) return;
    setWebhookTesting(true);
    try {
      await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event: "test", message: "AI Gateway webhook test", timestamp: new Date().toISOString() }),
      });
    } catch { /* ignore */ }
    setWebhookTesting(false);
    setWebhookTested(true);
    setTimeout(() => setWebhookTested(false), 2000);
  }

  const alertLabels: Record<string, { labelKey: string; descKey: string; type?: "text" | "number" }> = {
    webhook_url: { labelKey: "webhookUrl", descKey: "webhookUrlDesc" },
    alert_email: { labelKey: "alertEmail", descKey: "alertEmailDesc" },
    risk_threshold_high: { labelKey: "riskThresholdHigh", descKey: "riskThresholdHighDesc", type: "number" },
    risk_threshold_critical: { labelKey: "riskThresholdCritical", descKey: "riskThresholdCriticalDesc", type: "number" },
    max_requests_per_session: { labelKey: "maxRequestsPerSession", descKey: "maxRequestsPerSessionDesc", type: "number" },
    session_rotation_interval: { labelKey: "sessionRotationInterval", descKey: "sessionRotationIntervalDesc", type: "number" },
    alert_on_detection: { labelKey: "alertOnDetection", descKey: "alertOnDetectionDesc" },
    alert_on_session_expiry: { labelKey: "alertOnSessionExpiry", descKey: "alertOnSessionExpiryDesc" },
    alert_on_provider_down: { labelKey: "alertOnProviderDown", descKey: "alertOnProviderDownDesc" },
  };

  const inputClass = `w-full px-3.5 py-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 border ${isDark ? "border-slate-700" : "border-slate-300"} text-sm ${isDark ? "text-slate-100" : "text-slate-900"} focus:outline-none focus:border-cyan-500 transition-colors`;

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? "text-slate-100" : "text-slate-900"}`}>{t("settingsTitle")}</h1>
          <p className={`text-sm mt-1 ${isDark ? "text-slate-500" : "text-slate-500"}`}>{t("settingsSubtitle")}</p>
        </div>
        <button onClick={saveAll} disabled={saving || loading} className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-white text-sm font-medium transition-colors disabled:opacity-50">
          {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {saved ? t("saved") : saving ? t("saving") : t("save")}
        </button>
      </div>

      {/* Appearance section */}
      <div className={`${cardBg} rounded-xl p-6 border backdrop-blur-xl`}>
        <h2 className={`font-semibold text-lg mb-4 ${isDark ? "text-slate-100" : "text-slate-900"}`}>{t("appearance")}</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <label className={`block text-sm font-medium ${isDark ? "text-slate-200" : "text-slate-800"}`}>{t("theme")}</label>
              <p className="text-xs text-slate-500 mt-0.5">{t("darkMode")} / {t("lightMode")}</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setTheme("light")} className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium border transition-all ${theme === "light" ? "bg-amber-500/10 text-amber-600 border-amber-500/30" : `bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-300 dark:border-slate-700`}`}>
                <Sun className="w-4 h-4" /> {t("lightMode")}
              </button>
              <button onClick={() => setTheme("dark")} className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium border transition-all ${theme === "dark" ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/30" : `bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-300 dark:border-slate-700`}`}>
                <Moon className="w-4 h-4" /> {t("darkMode")}
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between gap-4">
            <div>
              <label className={`block text-sm font-medium ${isDark ? "text-slate-200" : "text-slate-800"}`}>{t("language")}</label>
              <p className="text-xs text-slate-500 mt-0.5">{t("english")} / {t("persian")}</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setLang("en")} className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium border transition-all ${lang === "en" ? "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/30" : `bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-300 dark:border-slate-700`}`}>
                <Languages className="w-4 h-4" /> EN
              </button>
              <button onClick={() => setLang("fa")} className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium border transition-all ${lang === "fa" ? "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/30" : `bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-300 dark:border-slate-700`}`}>
                <Languages className="w-4 h-4" /> FA
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Settings */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => <div key={i} className={`h-20 ${cardBg} border rounded-xl animate-pulse`} />)}
        </div>
      ) : (
        <div className="space-y-4">
          {settings.map((s) => {
            const meta = friendlyLabels[s.key] ?? { labelKey: s.key, descKey: "" };
            return (
              <div key={s.id} className={`${cardBg} rounded-xl p-5 border backdrop-blur-xl`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <label className={`block text-sm font-medium ${isDark ? "text-slate-200" : "text-slate-800"}`}>{t(meta.labelKey as never)}</label>
                    <p className="text-xs text-slate-500 mt-0.5">{t(meta.descKey as never)}</p>
                  </div>
                  <div className="w-full max-w-xs">
                    <input type={meta.type ?? "text"} value={values[s.key] ?? ""} onChange={(e) => setValues({ ...values, [s.key]: e.target.value })} className={inputClass} />
                    <p className="text-xs text-slate-400 mt-1 font-mono">{s.key}</p>
                  </div>
                </div>
              </div>
            );
          })}
          <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{t("securityWarning")}</span>
          </div>
        </div>
      )}

      {/* Alert Configuration */}
      {!loading && alertConfigs.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-amber-500" />
              <div>
                <h2 className={`font-semibold text-lg ${isDark ? "text-slate-100" : "text-slate-900"}`}>{t("alertConfig")}</h2>
                <p className={`text-xs mt-0.5 ${isDark ? "text-slate-500" : "text-slate-500"}`}>{t("alertConfigDesc")}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {alertValues["webhook_url"] && (
                <button onClick={testWebhook} disabled={webhookTesting} className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 text-sm font-medium transition-colors border border-slate-300 dark:border-slate-700 disabled:opacity-50">
                  {webhookTested ? <Check className="w-4 h-4 text-emerald-500" /> : webhookTesting ? <Send className="w-4 h-4 animate-pulse" /> : <Webhook className="w-4 h-4" />}
                  {webhookTested ? t("webhookTested") : t("testWebhook")}
                </button>
              )}
              <button onClick={saveAlerts} disabled={alertSaving} className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-white text-sm font-medium transition-colors disabled:opacity-50">
                {alertSaved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                {alertSaved ? t("saved") : alertSaving ? t("saving") : t("save")}
              </button>
            </div>
          </div>
          {alertConfigs.map((a) => {
            const meta = alertLabels[a.key] ?? { labelKey: a.key, descKey: "" };
            const isToggle = a.key.startsWith("alert_on");
            return (
              <div key={a.id} className={`${cardBg} rounded-xl p-5 border backdrop-blur-xl`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <label className={`block text-sm font-medium ${isDark ? "text-slate-200" : "text-slate-800"}`}>{t(meta.labelKey as never)}</label>
                    <p className="text-xs text-slate-500 mt-0.5">{t(meta.descKey as never)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    {isToggle ? (
                      <button
                        onClick={() => setAlertEnabled({ ...alertEnabled, [a.key]: !(alertEnabled[a.key] ?? true) })}
                        className={`relative w-12 h-6 rounded-full transition-colors ${alertEnabled[a.key] ?? true ? "bg-cyan-500" : "bg-slate-300 dark:bg-slate-700"}`}
                      >
                        <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${(alertEnabled[a.key] ?? true) ? "translate-x-6" : "translate-x-0.5"}`} />
                      </button>
                    ) : (
                      <div className="w-full max-w-xs">
                        <input type={meta.type ?? "text"} value={alertValues[a.key] ?? ""} onChange={(e) => setAlertValues({ ...alertValues, [a.key]: e.target.value })} className={inputClass} />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
