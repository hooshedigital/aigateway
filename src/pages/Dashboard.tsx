import { useState, useEffect } from "react";
import {
  Activity,
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp,
  Zap,
  Server,
  Cpu,
  DollarSign,
  Heart,
  Gauge,
  BarChart3,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useApp } from "@/contexts/AppContext";
import { LineChart, BarChart, DonutChart } from "@/components/Charts";
import type { Provider, RequestLog, UsageStat } from "@/types";

const DONUT_COLORS = ["#06b6d4", "#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444", "#ec4899", "#6366f1"];

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

export function Dashboard() {
  const { t, theme, lang } = useApp();
  const isDark = theme === "dark";
  const cardBg = isDark ? "bg-slate-900/60 border-slate-800" : "bg-white/70 border-slate-200";
  const textSecondary = isDark ? "text-slate-500" : "text-slate-500";

  const [providers, setProviders] = useState<Provider[]>([]);
  const [recentLogs, setRecentLogs] = useState<RequestLog[]>([]);
  const [stats, setStats] = useState<UsageStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalRequests, setTotalRequests] = useState(0);
  const [totalErrors, setTotalErrors] = useState(0);
  const [totalTokens, setTotalTokens] = useState(0);
  const [avgResponseTime, setAvgResponseTime] = useState(0);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const [{ data: provData }, { data: logData }, { data: statData }] = await Promise.all([
        supabase.from("providers").select("*").order("priority", { ascending: true }),
        supabase.from("request_logs").select("*").order("created_at", { ascending: false }).limit(10),
        supabase.from("usage_stats").select("*").order("date", { ascending: false }).limit(30),
      ]);

      setProviders((provData as Provider[]) ?? []);
      setRecentLogs((logData as RequestLog[]) ?? []);
      setStats((statData as UsageStat[]) ?? []);

      const { count } = await supabase.from("request_logs").select("*", { count: "exact", head: true });
      setTotalRequests(count ?? 0);

      const { count: errCount } = await supabase
        .from("request_logs")
        .select("*", { count: "exact", head: true })
        .eq("status", "error");
      setTotalErrors(errCount ?? 0);

      const { data: tokenData } = await supabase
        .from("request_logs")
        .select("tokens_used, response_time")
        .eq("status", "success");
      const tokens = (tokenData ?? []).reduce((sum, r) => sum + (r.tokens_used ?? 0), 0);
      setTotalTokens(tokens);
      const times = (tokenData ?? []).map((r) => r.response_time ?? 0).filter((t) => t > 0);
      setAvgResponseTime(times.length > 0 ? times.reduce((a, b) => a + b, 0) / times.length : 0);

      setLoading(false);
    }
    fetchData();
  }, []);

  const successRate = totalRequests > 0 ? ((totalRequests - totalErrors) / totalRequests) * 100 : 100;
  const activeProviders = providers.filter((p) => p.status === "active").length;
  const estCost = Object.entries(
    stats.reduce((acc, s) => {
      const rate = COST_PER_1K[s.provider] ?? 0.001;
      acc[s.provider] = (acc[s.provider] ?? 0) + (s.tokens_used / 1000) * rate;
      return acc;
    }, {} as Record<string, number>)
  ).reduce((sum, [, v]) => sum + v, 0);

  const statCards = [
    { label: t("totalRequests"), value: totalRequests.toLocaleString(), icon: Activity, color: "cyan" },
    { label: t("successRate"), value: `${successRate.toFixed(1)}%`, icon: CheckCircle2, color: "emerald", sub: `${totalErrors} ${t("errors")}` },
    { label: t("avgResponse"), value: `${avgResponseTime.toFixed(2)}s`, icon: Clock, color: "amber" },
    { label: t("totalTokens"), value: totalTokens.toLocaleString(), icon: Cpu, color: "violet" },
    { label: t("estCost"), value: `$${estCost.toFixed(4)}`, icon: DollarSign, color: "emerald" },
  ];

  const colorMap: Record<string, string> = {
    cyan: isDark ? "from-cyan-500/20 to-cyan-500/5 text-cyan-400 border-cyan-500/20" : "from-cyan-500/10 to-cyan-500/5 text-cyan-600 border-cyan-500/20",
    emerald: isDark ? "from-emerald-500/20 to-emerald-500/5 text-emerald-400 border-emerald-500/20" : "from-emerald-500/10 to-emerald-500/5 text-emerald-600 border-emerald-500/20",
    amber: isDark ? "from-amber-500/20 to-amber-500/5 text-amber-400 border-amber-500/20" : "from-amber-500/10 to-amber-500/5 text-amber-600 border-amber-500/20",
    violet: isDark ? "from-violet-500/20 to-violet-500/5 text-violet-400 border-violet-500/20" : "from-violet-500/10 to-violet-500/5 text-violet-600 border-violet-500/20",
  };

  // Last 7 days chart data
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split("T")[0];
  });

  const chartData = last7Days.map((date) => {
    const dayStats = stats.filter((s) => s.date === date);
    return {
      label: new Date(date).toLocaleDateString("en", { weekday: "short" }),
      value: dayStats.reduce((sum, s) => sum + s.requests_count, 0),
    };
  });

  const tokenChartData = last7Days.map((date) => {
    const dayStats = stats.filter((s) => s.date === date);
    return {
      label: new Date(date).toLocaleDateString("en", { weekday: "short" }),
      value: dayStats.reduce((sum, s) => sum + s.tokens_used, 0),
    };
  });

  // Provider usage donut
  const providerUsageMap = new Map<string, number>();
  stats.forEach((s) => {
    providerUsageMap.set(s.provider, (providerUsageMap.get(s.provider) ?? 0) + s.requests_count);
  });
  const donutData = Array.from(providerUsageMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([label, value], i) => ({ label, value, color: DONUT_COLORS[i % DONUT_COLORS.length] }));
  const totalDonutValue = donutData.reduce((sum, d) => sum + d.value, 0);

  // Provider health
  const providerHealth = providers.map((p) => {
    const pStats = stats.filter((s) => s.provider === p.name);
    const total = pStats.reduce((sum, s) => sum + s.requests_count, 0);
    const errors = pStats.reduce((sum, s) => sum + s.error_count, 0);
    const healthScore = total > 0 ? ((total - errors) / total) * 100 : 100;
    return { name: p.name, status: p.status, healthScore, total, errors };
  });

  // Latency distribution (P50, P90, P99) from recent logs
  const successTimes = recentLogs
    .filter((l) => l.status === "success" && l.response_time != null)
    .map((l) => l.response_time as number)
    .sort((a, b) => a - b);
  function percentile(sorted: number[], p: number): number {
    if (sorted.length === 0) return 0;
    const idx = Math.ceil((p / 100) * sorted.length) - 1;
    return sorted[Math.max(0, idx)] ?? 0;
  }
  const latencyData = [
    { label: t("p50"), value: percentile(successTimes, 50) },
    { label: t("p90"), value: percentile(successTimes, 90) },
    { label: t("p99"), value: percentile(successTimes, 99) },
  ];

  // Load balancing: requests per provider
  const loadBalancingData = providers
    .filter((p) => p.status === "active")
    .map((p) => {
      const pStats = stats.filter((s) => s.provider === p.name);
      return {
        label: p.name.length > 12 ? p.name.slice(0, 10) + "..." : p.name,
        value: pStats.reduce((sum, s) => sum + s.requests_count, 0),
      };
    });

  return (
    <div className="space-y-6 animate-slide-up">
      <div>
        <h1 className={`text-2xl font-bold ${isDark ? "text-slate-100" : "text-slate-900"}`}>{t("dashboardTitle")}</h1>
        <p className={`text-sm mt-1 ${textSecondary}`}>{t("dashboardSubtitle")}</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className={`bg-gradient-to-br ${colorMap[card.color]} border rounded-xl p-5 backdrop-blur-xl`}>
              <div className="flex items-start justify-between">
                <div className="min-w-0">
                  <p className="text-xs text-slate-400 uppercase tracking-wider font-medium truncate">{card.label}</p>
                  <p className="text-xl lg:text-2xl font-bold mt-2 text-white truncate">{card.value}</p>
                  {card.sub && <p className="text-xs text-slate-500 mt-1">{card.sub}</p>}
                </div>
                <div className={`p-2.5 rounded-lg bg-gradient-to-br ${colorMap[card.color]} flex-shrink-0`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Request activity bar chart */}
        <div className={`lg:col-span-2 ${cardBg} rounded-xl p-6 backdrop-blur-xl border`}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className={`font-semibold text-lg ${isDark ? "text-slate-100" : "text-slate-900"}`}>{t("requestActivity")}</h2>
              <p className={`text-xs mt-1 ${textSecondary}`}>{t("last7Days")}</p>
            </div>
            <TrendingUp className={`w-5 h-5 ${isDark ? "text-slate-600" : "text-slate-400"}`} />
          </div>
          <BarChart data={chartData} color={isDark ? "#06b6d4" : "#0891b2"} height={180} />
        </div>

        {/* Provider usage donut */}
        <div className={`${cardBg} rounded-xl p-6 backdrop-blur-xl border`}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className={`font-semibold text-lg ${isDark ? "text-slate-100" : "text-slate-900"}`}>{t("providerUsage")}</h2>
              <p className={`text-xs mt-1 ${textSecondary}`}>{t("byRequestCount")}</p>
            </div>
            <Server className={`w-5 h-5 ${isDark ? "text-slate-600" : "text-slate-400"}`} />
          </div>
          {loading ? (
            <div className="h-40 bg-slate-800/40 rounded-lg animate-pulse" />
          ) : totalDonutValue === 0 ? (
            <p className={`text-sm text-center py-12 ${textSecondary}`}>{t("noUsageData")}</p>
          ) : (
            <div className="flex flex-col items-center">
              <DonutChart data={donutData} size={140} />
              <div className="w-full mt-4 space-y-1.5">
                {donutData.slice(0, 5).map((d) => (
                  <div key={d.label} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                      <span className={isDark ? "text-slate-300" : "text-slate-700"}>{d.label}</span>
                    </div>
                    <span className={`text-xs ${textSecondary}`}>{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Token trend + Provider health */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={`lg:col-span-2 ${cardBg} rounded-xl p-6 backdrop-blur-xl border`}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className={`font-semibold text-lg ${isDark ? "text-slate-100" : "text-slate-900"}`}>{t("tokenUsageTrend")}</h2>
              <p className={`text-xs mt-1 ${textSecondary}`}>{t("last7Days")}</p>
            </div>
            <Cpu className={`w-5 h-5 ${isDark ? "text-slate-600" : "text-slate-400"}`} />
          </div>
          <LineChart data={tokenChartData} color={isDark ? "#8b5cf6" : "#7c3aed"} height={180} />
        </div>

        <div className={`${cardBg} rounded-xl p-6 backdrop-blur-xl border`}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className={`font-semibold text-lg ${isDark ? "text-slate-100" : "text-slate-900"}`}>{t("providerHealth")}</h2>
              <p className={`text-xs mt-1 ${textSecondary}`}>{activeProviders} {t("active")}</p>
            </div>
            <Heart className={`w-5 h-5 ${isDark ? "text-slate-600" : "text-slate-400"}`} />
          </div>
          <div className="space-y-2">
            {providerHealth.slice(0, 6).map((p) => (
              <div key={p.name} className="flex items-center justify-between py-1.5 px-3 rounded-lg bg-slate-100/50 dark:bg-slate-800/40">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${p.status === "active" ? "bg-emerald-500" : "bg-slate-400"}`} />
                  <span className={`text-sm ${isDark ? "text-slate-300" : "text-slate-700"}`}>{p.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-16 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${p.healthScore >= 90 ? "bg-emerald-500" : p.healthScore >= 70 ? "bg-amber-500" : "bg-rose-500"}`}
                      style={{ width: `${p.healthScore}%` }}
                    />
                  </div>
                  <span className={`text-xs font-mono w-10 text-end ${textSecondary}`}>{p.healthScore.toFixed(0)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Latency distribution + Load balancing */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={`${cardBg} rounded-xl p-6 backdrop-blur-xl border`}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className={`font-semibold text-lg ${isDark ? "text-slate-100" : "text-slate-900"}`}>{t("latencyDistribution")}</h2>
              <p className={`text-xs mt-1 ${textSecondary}`}>{t("latencyDistributionDesc")}</p>
            </div>
            <Gauge className={`w-5 h-5 ${isDark ? "text-slate-600" : "text-slate-400"}`} />
          </div>
          <div className="grid grid-cols-3 gap-4">
            {latencyData.map((d) => (
              <div key={d.label} className={`p-4 rounded-lg ${isDark ? "bg-slate-800/50" : "bg-slate-100"} text-center`}>
                <p className="text-xs text-slate-500 mb-1">{d.label}</p>
                <p className="text-2xl font-bold text-cyan-500">{d.value.toFixed(2)}s</p>
              </div>
            ))}
          </div>
        </div>

        <div className={`${cardBg} rounded-xl p-6 backdrop-blur-xl border`}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className={`font-semibold text-lg ${isDark ? "text-slate-100" : "text-slate-900"}`}>{t("loadBalancing")}</h2>
              <p className={`text-xs mt-1 ${textSecondary}`}>{t("loadBalancingDesc")}</p>
            </div>
            <BarChart3 className={`w-5 h-5 ${isDark ? "text-slate-600" : "text-slate-400"}`} />
          </div>
          {loadBalancingData.length === 0 || loadBalancingData.every((d) => d.value === 0) ? (
            <p className={`text-sm text-center py-12 ${textSecondary}`}>{t("noUsageData")}</p>
          ) : (
            <BarChart data={loadBalancingData} color={isDark ? "#10b981" : "#059669"} height={160} />
          )}
        </div>
      </div>

      {/* Recent requests */}
      <div className={`${cardBg} rounded-xl overflow-hidden backdrop-blur-xl border`}>
        <div className={`p-6 border-b ${isDark ? "border-slate-800" : "border-slate-200"}`}>
          <h2 className={`font-semibold text-lg ${isDark ? "text-slate-100" : "text-slate-900"}`}>{t("recentRequests")}</h2>
          <p className={`text-xs mt-1 ${textSecondary}`}>{t("latestRequests")}</p>
        </div>
        <div className={`divide-y ${isDark ? "divide-slate-800" : "divide-slate-200"}`}>
          {recentLogs.length === 0 ? (
            <p className={`text-sm text-center py-12 ${textSecondary}`}>{t("noRequestsLogged")}</p>
          ) : (
            recentLogs.map((log) => (
              <div key={log.id} className="flex items-center gap-4 px-6 py-3 hover:bg-slate-100/50 dark:hover:bg-slate-800/30 transition-colors">
                {log.status === "success" ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                ) : (
                  <XCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-medium ${isDark ? "text-slate-200" : "text-slate-800"}`}>{log.provider}</span>
                    <span className={`text-xs ${textSecondary}`}>·</span>
                    <span className={`text-xs ${textSecondary}`}>{log.model ?? "unknown"}</span>
                  </div>
                  {log.error_message && (
                    <p className="text-xs text-rose-400/70 truncate mt-0.5">{log.error_message}</p>
                  )}
                </div>
                <div className="text-end flex-shrink-0">
                  <p className={`text-xs ${textSecondary}`}>
                    {log.response_time != null ? `${log.response_time.toFixed(2)}s` : "—"}
                  </p>
                  <p className={`text-xs ${isDark ? "text-slate-600" : "text-slate-400"}`}>
                    {new Date(log.created_at).toLocaleTimeString(lang === "fa" ? "fa" : "en", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
