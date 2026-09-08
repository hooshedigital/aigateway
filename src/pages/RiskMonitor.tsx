import { useState, useEffect } from "react";
import {
  ShieldAlert,
  ShieldCheck,
  ShieldOff,
  Activity,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  Eye,
  Gauge,
  Zap,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useApp } from "@/contexts/AppContext";
import { LineChart } from "@/components/Charts";
import type { RiskScore, Provider } from "@/types";

export function RiskMonitor() {
  const { t, theme, lang } = useApp();
  const isDark = theme === "dark";
  const cardBg = isDark ? "bg-slate-900/60 border-slate-800" : "bg-white/70 border-slate-200";
  const textSecondary = isDark ? "text-slate-500" : "text-slate-500";

  const [scores, setScores] = useState<RiskScore[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const [{ data: scoreData }, { data: provData }] = await Promise.all([
        supabase.from("risk_scores").select("*").order("calculated_at", { ascending: false }),
        supabase.from("providers").select("*").order("priority", { ascending: true }),
      ]);
      setScores((scoreData as RiskScore[]) ?? []);
      setProviders((provData as Provider[]) ?? []);
      setLoading(false);
    }
    fetchData();
  }, []);

  const latestPerProvider = new Map<string, RiskScore>();
  scores.forEach((s) => {
    if (!latestPerProvider.has(s.provider)) latestPerProvider.set(s.provider, s);
  });
  const latestScores = Array.from(latestPerProvider.values());

  const riskLevelColors: Record<string, { bg: string; text: string; icon: typeof ShieldCheck }> = {
    low: { bg: "bg-emerald-500/10", text: "text-emerald-500", icon: ShieldCheck },
    medium: { bg: "bg-amber-500/10", text: "text-amber-500", icon: Activity },
    high: { bg: "bg-orange-500/10", text: "text-orange-500", icon: ShieldAlert },
    critical: { bg: "bg-rose-500/10", text: "text-rose-500", icon: ShieldOff },
  };

  const lowCount = latestScores.filter((s) => s.risk_level === "low").length;
  const medCount = latestScores.filter((s) => s.risk_level === "medium").length;
  const highCount = latestScores.filter((s) => s.risk_level === "high").length;
  const critCount = latestScores.filter((s) => s.risk_level === "critical").length;
  const quarantinedCount = latestScores.filter((s) => s.quarantined).length;

  // Build risk history chart data from scores
  const riskHistoryData = scores.slice(0, 20).reverse().map((s) => ({
    label: new Date(s.calculated_at).toLocaleTimeString(lang === "fa" ? "fa" : "en", { hour: "2-digit", minute: "2-digit" }),
    value: s.risk_score,
  }));

  async function toggleQuarantine(s: RiskScore) {
    const newQuarantined = !s.quarantined;
    await supabase.from("risk_scores").update({ quarantined: newQuarantined }).eq("id", s.id);
    await supabase.from("audit_logs").insert({
      action: newQuarantined ? "quarantine_provider" : "unquarantine_provider",
      entity: "risk_scores",
      entity_id: s.id,
      details: `Provider ${s.provider} ${newQuarantined ? "quarantined" : "unquarantined"}`,
      performed_by: "admin",
    });
    setScores(scores.map((sc) => sc.id === s.id ? { ...sc, quarantined: newQuarantined } : sc));
  }

  return (
    <div className="space-y-6 animate-slide-up">
      <div>
        <h1 className={`text-2xl font-bold ${isDark ? "text-slate-100" : "text-slate-900"}`}>{t("riskMonitorTitle")}</h1>
        <p className={`text-sm mt-1 ${textSecondary}`}>{t("riskMonitorSubtitle")}</p>
      </div>

      {/* Risk summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: t("low"), value: lowCount, color: "emerald", icon: ShieldCheck },
          { label: t("medium"), value: medCount, color: "amber", icon: Activity },
          { label: t("high"), value: highCount, color: "orange", icon: ShieldAlert },
          { label: t("critical"), value: critCount, color: "rose", icon: ShieldOff },
          { label: t("quarantined"), value: quarantinedCount, color: "slate", icon: ShieldOff },
        ].map((card) => {
          const Icon = card.icon;
          const colorMap: Record<string, string> = {
            emerald: isDark ? "from-emerald-500/20 to-emerald-500/5 text-emerald-400 border-emerald-500/20" : "from-emerald-500/10 to-emerald-500/5 text-emerald-600 border-emerald-500/20",
            amber: isDark ? "from-amber-500/20 to-amber-500/5 text-amber-400 border-amber-500/20" : "from-amber-500/10 to-amber-500/5 text-amber-600 border-amber-500/20",
            orange: isDark ? "from-orange-500/20 to-orange-500/5 text-orange-400 border-orange-500/20" : "from-orange-500/10 to-orange-500/5 text-orange-600 border-orange-500/20",
            rose: isDark ? "from-rose-500/20 to-rose-500/5 text-rose-400 border-rose-500/20" : "from-rose-500/10 to-rose-500/5 text-rose-600 border-rose-500/20",
            slate: isDark ? "from-slate-500/20 to-slate-500/5 text-slate-400 border-slate-500/20" : "from-slate-500/10 to-slate-500/5 text-slate-600 border-slate-500/20",
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

      {/* Smart routing info */}
      <div className={`${cardBg} rounded-xl p-6 border backdrop-blur-xl`}>
        <div className="flex items-center gap-2 mb-4">
          <Zap className="w-5 h-5 text-cyan-500" />
          <h2 className={`font-semibold text-lg ${isDark ? "text-slate-100" : "text-slate-900"}`}>{t("smartRouting")}</h2>
        </div>
        <p className={`text-sm ${textSecondary} mb-4`}>{t("smartRoutingDesc")}</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className={`p-4 rounded-lg ${isDark ? "bg-slate-800/50" : "bg-slate-100"}`}>
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <h3 className={`text-sm font-medium ${isDark ? "text-slate-200" : "text-slate-800"}`}>{t("autoQuarantine")}</h3>
            </div>
            <p className={`text-xs ${textSecondary}`}>{t("autoQuarantineDesc")}</p>
          </div>
          <div className={`p-4 rounded-lg ${isDark ? "bg-slate-800/50" : "bg-slate-100"}`}>
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="w-4 h-4 text-amber-500" />
              <h3 className={`text-sm font-medium ${isDark ? "text-slate-200" : "text-slate-800"}`}>{t("predictiveFallback")}</h3>
            </div>
            <p className={`text-xs ${textSecondary}`}>{t("predictiveFallbackDesc")}</p>
          </div>
          <div className={`p-4 rounded-lg ${isDark ? "bg-slate-800/50" : "bg-slate-100"}`}>
            <div className="flex items-center gap-2 mb-2">
              <Gauge className="w-4 h-4 text-cyan-500" />
              <h3 className={`text-sm font-medium ${isDark ? "text-slate-200" : "text-slate-800"}`}>{t("providerScoring")}</h3>
            </div>
            <p className={`text-xs ${textSecondary}`}>{t("providerScoringDesc")}</p>
          </div>
        </div>
      </div>

      {/* Risk history chart */}
      <div className={`${cardBg} rounded-xl p-6 border backdrop-blur-xl`}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className={`font-semibold text-lg ${isDark ? "text-slate-100" : "text-slate-900"}`}>{t("riskHistory")}</h2>
            <p className={`text-xs mt-1 ${textSecondary}`}>{t("riskMonitorSubtitle")}</p>
          </div>
          <TrendingUp className={`w-5 h-5 ${isDark ? "text-slate-600" : "text-slate-400"}`} />
        </div>
        {loading ? (
          <div className="h-40 bg-slate-800/40 rounded-lg animate-pulse" />
        ) : riskHistoryData.length === 0 ? (
          <p className={`text-sm text-center py-12 ${textSecondary}`}>{t("noUsageData")}</p>
        ) : (
          <LineChart data={riskHistoryData} color={isDark ? "#f43f5e" : "#e11d48"} height={180} />
        )}
      </div>

      {/* Provider risk table */}
      <div className={`${cardBg} rounded-xl overflow-hidden border backdrop-blur-xl`}>
        <div className={`p-6 border-b ${isDark ? "border-slate-800" : "border-slate-200"}`}>
          <div className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-slate-500" />
            <h2 className={`font-semibold text-lg ${isDark ? "text-slate-100" : "text-slate-900"}`}>{t("providerScoring")}</h2>
          </div>
        </div>
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full">
            <thead>
              <tr className={`border-b ${isDark ? "border-slate-800" : "border-slate-200"}`}>
                <th className="text-start text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3">{t("provider")}</th>
                <th className="text-start text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3">{t("riskLevel")}</th>
                <th className="text-start text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3">{t("riskScore")}</th>
                <th className="text-start text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3 hidden lg:table-cell">{t("successRateCol")}</th>
                <th className="text-start text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3 hidden lg:table-cell">{t("avgResponseCol")}</th>
                <th className="text-start text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3 hidden xl:table-cell">{t("detectionSignals")}</th>
                <th className="text-end text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3">{t("quarantine")}</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? "divide-slate-800" : "divide-slate-200"}`}>
              {loading ? (
                <tr><td colSpan={7} className="text-center py-8"><div className="inline-block w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" /></td></tr>
              ) : latestScores.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-sm text-slate-500">{t("noUsageData")}</td></tr>
              ) : (
                latestScores.map((s) => {
                  const rc = riskLevelColors[s.risk_level] ?? riskLevelColors.low;
                  const RIcon = rc.icon;
                  return (
                    <tr key={s.id} className="hover:bg-slate-100/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className={`p-1.5 rounded-lg ${rc.bg}`}>
                            <RIcon className={`w-4 h-4 ${rc.text}`} />
                          </div>
                          <span className={`text-sm font-medium ${isDark ? "text-slate-200" : "text-slate-800"}`}>{s.provider}</span>
                          {s.quarantined && <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${rc.bg} ${rc.text}`}>
                          {s.risk_level === "low" ? t("low") : s.risk_level === "medium" ? t("medium") : s.risk_level === "high" ? t("high") : t("critical")}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${s.risk_score >= 70 ? "bg-rose-500" : s.risk_score >= 40 ? "bg-amber-500" : "bg-emerald-500"}`} style={{ width: `${s.risk_score}%` }} />
                          </div>
                          <span className="text-xs font-mono text-slate-500">{s.risk_score.toFixed(0)}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <span className={`text-sm font-mono ${s.success_rate >= 90 ? "text-emerald-500" : s.success_rate >= 70 ? "text-amber-500" : "text-rose-500"}`}>{s.success_rate.toFixed(1)}%</span>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <span className="text-sm text-slate-500 font-mono">{s.avg_response_time.toFixed(2)}s</span>
                      </td>
                      <td className="px-4 py-3 hidden xl:table-cell">
                        <span className="text-sm text-slate-500 font-mono">{s.detection_signals}</span>
                      </td>
                      <td className="px-4 py-3 text-end">
                        <button onClick={() => toggleQuarantine(s)} className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${s.quarantined ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20" : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 hover:bg-rose-500/20"}`}>
                          {s.quarantined ? t("unquarantine") : t("quarantine")}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
