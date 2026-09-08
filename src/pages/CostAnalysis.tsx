import { useState, useEffect, useMemo } from "react";
import {
  DollarSign,
  TrendingUp,
  Download,
  AlertTriangle,
  Wallet,
  PieChart,
  BarChart3,
  Clock,
  Plus,
  X,
  Edit2,
  Trash2,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useApp } from "@/contexts/AppContext";
import { LineChart, BarChart, DonutChart } from "@/components/Charts";
import type { CostLog, ModelPricing, Budget, Provider } from "@/types";

const DONUT_COLORS = ["#06b6d4", "#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444", "#ec4899", "#6366f1"];

export function CostAnalysis() {
  const { t, theme } = useApp();
  const isDark = theme === "dark";
  const cardBg = isDark ? "bg-slate-900/60 border-slate-800" : "bg-white/70 border-slate-200";
  const textSecondary = isDark ? "text-slate-500" : "text-slate-500";
  const inputClass = `w-full px-3.5 py-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 border ${isDark ? "border-slate-700" : "border-slate-300"} text-sm ${isDark ? "text-slate-100" : "text-slate-900"} placeholder-slate-400 focus:outline-none focus:border-cyan-500 transition-colors`;

  const [costLogs, setCostLogs] = useState<CostLog[]>([]);
  const [pricing, setPricing] = useState<ModelPricing[]>([]);
  const [budget, setBudget] = useState<Budget | null>(null);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [editingPricingId, setEditingPricingId] = useState<string | null>(null);

  const [pricingForm, setPricingForm] = useState({
    provider: "",
    model: "",
    input_cost_per_1k: 0,
    output_cost_per_1k: 0,
    is_free: false,
  });

  const [budgetForm, setBudgetForm] = useState({
    budget_amount: 100,
    alert_threshold: 80,
    alerts_enabled: true,
  });

  async function fetchData() {
    setLoading(true);
    const [{ data: logData }, { data: pricingData }, { data: budgetData }, { data: provData }] = await Promise.all([
      supabase.from("cost_logs").select("*").order("created_at", { ascending: false }).limit(500),
      supabase.from("model_pricing").select("*").order("provider", { ascending: true }),
      supabase.from("budgets").select("*").eq("month", new Date().toISOString().slice(0, 7)).maybeSingle(),
      supabase.from("providers").select("*").order("priority", { ascending: true }),
    ]);

    setCostLogs((logData as CostLog[]) ?? []);
    setPricing((pricingData as ModelPricing[]) ?? []);
    setBudget((budgetData as Budget) ?? null);
    setProviders((provData as Provider[]) ?? []);
    setLoading(false);
  }

  useEffect(() => {
    fetchData();
  }, []);

  // Compute cost analytics
  const analytics = useMemo(() => {
    const now = new Date();
    const thisMonth = now.toISOString().slice(0, 7);
    const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonth = lastMonthDate.toISOString().slice(0, 7);

    const thisMonthLogs = costLogs.filter((l) => l.created_at.slice(0, 7) === thisMonth);
    const lastMonthLogs = costLogs.filter((l) => l.created_at.slice(0, 7) === lastMonth);

    const totalCost = costLogs.reduce((sum, l) => sum + l.cost, 0);
    const thisMonthCost = thisMonthLogs.reduce((sum, l) => sum + l.cost, 0);
    const lastMonthCost = lastMonthLogs.reduce((sum, l) => sum + l.cost, 0);

    const totalRequests = costLogs.length;
    const avgCostPerRequest = totalRequests > 0 ? totalCost / totalRequests : 0;

    // Cost by provider
    const costByProviderMap = new Map<string, number>();
    costLogs.forEach((l) => {
      costByProviderMap.set(l.provider, (costByProviderMap.get(l.provider) ?? 0) + l.cost);
    });
    const costByProvider = Array.from(costByProviderMap.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([label, value], i) => ({ label, value, color: DONUT_COLORS[i % DONUT_COLORS.length] }));

    // Cost by model
    const costByModelMap = new Map<string, number>();
    costLogs.forEach((l) => {
      const key = l.model ?? "unknown";
      costByModelMap.set(key, (costByModelMap.get(key) ?? 0) + l.cost);
    });
    const costByModel = Array.from(costByModelMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([label, value]) => ({ label, value }));

    // Free vs Paid
    const freeCost = costLogs.filter((l) => l.is_free).reduce((sum, l) => sum + l.total_tokens, 0);
    const paidCost = costLogs.filter((l) => !l.is_free).reduce((sum, l) => sum + l.total_tokens, 0);
    const freeVsPaid = [
      { label: t("freeUsage"), value: freeCost, color: "#10b981" },
      { label: t("paidUsage"), value: paidCost, color: "#06b6d4" },
    ];

    // Cost trend (last 7 days)
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d.toISOString().split("T")[0];
    });
    const costTrend = last7Days.map((date) => {
      const dayLogs = costLogs.filter((l) => l.created_at.slice(0, 10) === date);
      return {
        label: new Date(date).toLocaleDateString("en", { weekday: "short" }),
        value: dayLogs.reduce((sum, l) => sum + l.cost, 0),
      };
    });

    // Cost prediction: simple linear projection based on daily average
    const dailyAvg = costTrend.reduce((sum, d) => sum + d.value, 0) / 7;
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const dayOfMonth = now.getDate();
    const projectedMonthEnd = dailyAvg * daysInMonth;
    const predictedCost = dailyAvg * 30;

    return {
      totalCost,
      thisMonthCost,
      lastMonthCost,
      avgCostPerRequest,
      costByProvider,
      costByModel,
      freeVsPaid,
      costTrend,
      predictedCost,
      projectedMonthEnd,
      thisMonthRequests: thisMonthLogs.length,
    };
  }, [costLogs, t]);

  // Budget alert check
  const budgetAlert = useMemo(() => {
    if (!budget || !budget.alerts_enabled) return false;
    const pct = (budget.current_spend / budget.budget_amount) * 100;
    return pct >= budget.alert_threshold;
  }, [budget]);

  const budgetPct = budget ? Math.min((budget.current_spend / budget.budget_amount) * 100, 100) : 0;
  const budgetRemaining = budget ? budget.budget_amount - budget.current_spend : 0;

  function exportCsv() {
    const headers = ["Provider", "Model", "Input Tokens", "Output Tokens", "Total Tokens", "Cost (USD)", "Free", "Date"];
    const rows = costLogs.map((l) => [
      l.provider,
      l.model ?? "",
      l.input_tokens,
      l.output_tokens,
      l.total_tokens,
      l.cost.toFixed(6),
      l.is_free ? "Yes" : "No",
      new Date(l.created_at).toISOString(),
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cost-analysis-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function savePricing() {
    if (!pricingForm.provider.trim() || !pricingForm.model.trim()) return;
    const payload = {
      provider: pricingForm.provider.trim(),
      model: pricingForm.model.trim(),
      input_cost_per_1k: pricingForm.input_cost_per_1k,
      output_cost_per_1k: pricingForm.output_cost_per_1k,
      is_free: pricingForm.is_free,
      updated_at: new Date().toISOString(),
    };
    if (editingPricingId) {
      await supabase.from("model_pricing").update(payload).eq("id", editingPricingId);
    } else {
      await supabase.from("model_pricing").insert(payload);
    }
    setShowPricingModal(false);
    setEditingPricingId(null);
    setPricingForm({ provider: "", model: "", input_cost_per_1k: 0, output_cost_per_1k: 0, is_free: false });
    fetchData();
  }

  async function deletePricing(p: ModelPricing) {
    await supabase.from("model_pricing").delete().eq("id", p.id);
    fetchData();
  }

  function editPricing(p: ModelPricing) {
    setEditingPricingId(p.id);
    setPricingForm({
      provider: p.provider,
      model: p.model,
      input_cost_per_1k: p.input_cost_per_1k,
      output_cost_per_1k: p.output_cost_per_1k,
      is_free: p.is_free,
    });
    setShowPricingModal(true);
  }

  async function saveBudget() {
    const month = new Date().toISOString().slice(0, 7);
    const payload = {
      month,
      budget_amount: budgetForm.budget_amount,
      alert_threshold: budgetForm.alert_threshold,
      alerts_enabled: budgetForm.alerts_enabled,
      updated_at: new Date().toISOString(),
    };
    if (budget) {
      await supabase.from("budgets").update(payload).eq("id", budget.id);
    } else {
      await supabase.from("budgets").insert({ ...payload, current_spend: 0 });
    }
    setShowBudgetModal(false);
    fetchData();
  }

  const statCards = [
    { label: t("totalCost"), value: `$${analytics.totalCost.toFixed(4)}`, icon: DollarSign, color: "emerald" },
    { label: t("thisMonth"), value: `$${analytics.thisMonthCost.toFixed(4)}`, icon: TrendingUp, color: "cyan", sub: `${analytics.thisMonthRequests} ${t("requests")}` },
    { label: t("avgCostPerRequest"), value: `$${analytics.avgCostPerRequest.toFixed(6)}`, icon: Clock, color: "amber" },
    { label: t("predictedCost"), value: `$${analytics.predictedCost.toFixed(4)}`, icon: BarChart3, color: "violet" },
  ];

  const colorMap: Record<string, string> = {
    cyan: isDark ? "from-cyan-500/20 to-cyan-500/5 text-cyan-400 border-cyan-500/20" : "from-cyan-500/10 to-cyan-500/5 text-cyan-600 border-cyan-500/20",
    emerald: isDark ? "from-emerald-500/20 to-emerald-500/5 text-emerald-400 border-emerald-500/20" : "from-emerald-500/10 to-emerald-500/5 text-emerald-600 border-emerald-500/20",
    amber: isDark ? "from-amber-500/20 to-amber-500/5 text-amber-400 border-amber-500/20" : "from-amber-500/10 to-amber-500/5 text-amber-600 border-amber-500/20",
    violet: isDark ? "from-violet-500/20 to-violet-500/5 text-violet-400 border-violet-500/20" : "from-violet-500/10 to-violet-500/5 text-violet-600 border-violet-500/20",
  };

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? "text-slate-100" : "text-slate-900"}`}>{t("costAnalysisTitle")}</h1>
          <p className={`text-sm mt-1 ${textSecondary}`}>{t("costAnalysisSubtitle")}</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={exportCsv} className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium transition-colors">
            <Download className="w-4 h-4" />
            {t("exportCsv")}
          </button>
          <button onClick={() => { setEditingPricingId(null); setPricingForm({ provider: "", model: "", input_cost_per_1k: 0, output_cost_per_1k: 0, is_free: false }); setShowPricingModal(true); }} className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-white text-sm font-medium transition-colors">
            <Plus className="w-4 h-4" />
            {t("addPricing")}
          </button>
        </div>
      </div>

      {/* Budget alert banner */}
      {budgetAlert && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-sm animate-scale-in">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <span>{t("budgetAlertTriggered")}</span>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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

      {/* Budget tracking */}
      <div className={`${cardBg} rounded-xl p-6 backdrop-blur-xl border`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-cyan-500" />
            <h2 className={`font-semibold text-lg ${isDark ? "text-slate-100" : "text-slate-900"}`}>{t("budgetTracking")}</h2>
          </div>
          <button onClick={() => { setBudgetForm({ budget_amount: budget?.budget_amount ?? 100, alert_threshold: budget?.alert_threshold ?? 80, alerts_enabled: budget?.alerts_enabled ?? true }); setShowBudgetModal(true); }} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <Edit2 className="w-3.5 h-3.5" />
            {t("editBudget")}
          </button>
        </div>
        {budget ? (
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className={`text-sm ${isDark ? "text-slate-300" : "text-slate-700"}`}>{t("currentSpend")}: <span className="font-bold text-cyan-500">${budget.current_spend.toFixed(4)}</span></span>
              <span className={`text-sm ${textSecondary}`}>{t("budgetAmount")}: ${budget.budget_amount.toFixed(2)}</span>
            </div>
            <div className="w-full h-3 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${budgetPct >= 100 ? "bg-rose-500" : budgetPct >= budget.alert_threshold ? "bg-amber-500" : "bg-emerald-500"}`}
                style={{ width: `${budgetPct}%` }}
              />
            </div>
            <div className="flex items-center justify-between mt-2 text-xs">
              <span className={textSecondary}>{budgetPct.toFixed(1)}% {t("used")}</span>
              <span className={textSecondary}>{t("remaining")}: ${budgetRemaining.toFixed(4)}</span>
            </div>
            <div className="flex items-center gap-2 mt-3">
              <div className={`px-2 py-0.5 rounded text-xs ${budget.alerts_enabled ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-slate-500/10 text-slate-500"}`}>
                {budget.alerts_enabled ? t("budgetAlertEnabled") : t("budgetAlertDisabled")}
              </div>
              <span className={`text-xs ${textSecondary}`}>{t("alertThreshold")}: {budget.alert_threshold}%</span>
            </div>
          </div>
        ) : (
          <p className={`text-sm text-center py-8 ${textSecondary}`}>{t("noCostData")}</p>
        )}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cost trend */}
        <div className={`lg:col-span-2 ${cardBg} rounded-xl p-6 backdrop-blur-xl border`}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className={`font-semibold text-lg ${isDark ? "text-slate-100" : "text-slate-900"}`}>{t("costTrend")}</h2>
              <p className={`text-xs mt-1 ${textSecondary}`}>{t("last7Days")}</p>
            </div>
            <TrendingUp className={`w-5 h-5 ${isDark ? "text-slate-600" : "text-slate-400"}`} />
          </div>
          {loading ? (
            <div className="h-40 bg-slate-800/40 rounded-lg animate-pulse" />
          ) : analytics.totalCost === 0 ? (
            <p className={`text-sm text-center py-12 ${textSecondary}`}>{t("noCostData")}</p>
          ) : (
            <LineChart data={analytics.costTrend} color={isDark ? "#10b981" : "#059669"} height={180} />
          )}
        </div>

        {/* Cost by provider donut */}
        <div className={`${cardBg} rounded-xl p-6 backdrop-blur-xl border`}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className={`font-semibold text-lg ${isDark ? "text-slate-100" : "text-slate-900"}`}>{t("costByProvider")}</h2>
              <p className={`text-xs mt-1 ${textSecondary}`}>{t("costBreakdown")}</p>
            </div>
            <PieChart className={`w-5 h-5 ${isDark ? "text-slate-600" : "text-slate-400"}`} />
          </div>
          {loading ? (
            <div className="h-40 bg-slate-800/40 rounded-lg animate-pulse" />
          ) : analytics.costByProvider.length === 0 ? (
            <p className={`text-sm text-center py-12 ${textSecondary}`}>{t("noCostData")}</p>
          ) : (
            <div className="flex flex-col items-center">
              <DonutChart data={analytics.costByProvider} size={140} />
              <div className="w-full mt-4 space-y-1.5">
                {analytics.costByProvider.slice(0, 5).map((d) => (
                  <div key={d.label} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                      <span className={isDark ? "text-slate-300" : "text-slate-700"}>{d.label}</span>
                    </div>
                    <span className={`text-xs font-mono ${textSecondary}`}>${d.value.toFixed(4)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Cost by model + Free vs Paid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={`${cardBg} rounded-xl p-6 backdrop-blur-xl border`}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className={`font-semibold text-lg ${isDark ? "text-slate-100" : "text-slate-900"}`}>{t("costByModel")}</h2>
              <p className={`text-xs mt-1 ${textSecondary}`}>{t("costBreakdownTable")}</p>
            </div>
            <BarChart3 className={`w-5 h-5 ${isDark ? "text-slate-600" : "text-slate-400"}`} />
          </div>
          {analytics.costByModel.length === 0 ? (
            <p className={`text-sm text-center py-12 ${textSecondary}`}>{t("noCostData")}</p>
          ) : (
            <BarChart data={analytics.costByModel} color={isDark ? "#8b5cf6" : "#7c3aed"} height={160} />
          )}
        </div>

        <div className={`${cardBg} rounded-xl p-6 backdrop-blur-xl border`}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className={`font-semibold text-lg ${isDark ? "text-slate-100" : "text-slate-900"}`}>{t("freeVsPaid")}</h2>
              <p className={`text-xs mt-1 ${textSecondary}`}>{t("costBreakdown")}</p>
            </div>
          </div>
          {analytics.freeVsPaid.every((d) => d.value === 0) ? (
            <p className={`text-sm text-center py-12 ${textSecondary}`}>{t("noCostData")}</p>
          ) : (
            <div className="flex flex-col items-center">
              <DonutChart data={analytics.freeVsPaid} size={140} />
              <div className="w-full mt-4 space-y-1.5">
                {analytics.freeVsPaid.map((d) => (
                  <div key={d.label} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                      <span className={isDark ? "text-slate-300" : "text-slate-700"}>{d.label}</span>
                    </div>
                    <span className={`text-xs font-mono ${textSecondary}`}>{d.value.toLocaleString()} tokens</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Cost prediction */}
      <div className={`${cardBg} rounded-xl p-6 backdrop-blur-xl border`}>
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-5 h-5 text-violet-500" />
          <div>
            <h2 className={`font-semibold text-lg ${isDark ? "text-slate-100" : "text-slate-900"}`}>{t("costPrediction")}</h2>
            <p className={`text-xs mt-1 ${textSecondary}`}>{t("costPredictionDesc")}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className={`p-4 rounded-lg ${isDark ? "bg-slate-800/50" : "bg-slate-100"} text-center`}>
            <p className="text-xs text-slate-500 mb-1">{t("predictedCost")}</p>
            <p className="text-2xl font-bold text-violet-500">${analytics.predictedCost.toFixed(4)}</p>
          </div>
          <div className={`p-4 rounded-lg ${isDark ? "bg-slate-800/50" : "bg-slate-100"} text-center`}>
            <p className="text-xs text-slate-500 mb-1">{t("thisMonth")}</p>
            <p className="text-2xl font-bold text-cyan-500">${analytics.thisMonthCost.toFixed(4)}</p>
          </div>
          <div className={`p-4 rounded-lg ${isDark ? "bg-slate-800/50" : "bg-slate-100"} text-center`}>
            <p className="text-xs text-slate-500 mb-1">{t("lastMonth")}</p>
            <p className="text-2xl font-bold text-amber-500">${analytics.lastMonthCost.toFixed(4)}</p>
          </div>
          <div className={`p-4 rounded-lg ${isDark ? "bg-slate-800/50" : "bg-slate-100"} text-center`}>
            <p className="text-xs text-slate-500 mb-1">{t("avgCostPerRequest")}</p>
            <p className="text-2xl font-bold text-emerald-500">${analytics.avgCostPerRequest.toFixed(6)}</p>
          </div>
        </div>
      </div>

      {/* Model pricing table */}
      <div className={`${cardBg} rounded-xl p-6 backdrop-blur-xl border`}>
        <h2 className={`font-semibold text-lg mb-4 ${isDark ? "text-slate-100" : "text-slate-900"}`}>{t("modelPricing")}</h2>
        {pricing.length === 0 ? (
          <p className={`text-sm text-center py-8 ${textSecondary}`}>{t("noPricingData")}</p>
        ) : (
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-sm">
              <thead>
                <tr className={`border-b ${isDark ? "border-slate-800" : "border-slate-200"}`}>
                  <th className="text-start py-2 px-3 font-medium text-slate-500">{t("provider")}</th>
                  <th className="text-start py-2 px-3 font-medium text-slate-500">{t("model")}</th>
                  <th className="text-end py-2 px-3 font-medium text-slate-500">{t("inputCostPer1k")}</th>
                  <th className="text-end py-2 px-3 font-medium text-slate-500">{t("outputCostPer1k")}</th>
                  <th className="text-center py-2 px-3 font-medium text-slate-500">{t("isFreeModel")}</th>
                  <th className="text-end py-2 px-3 font-medium text-slate-500"></th>
                </tr>
              </thead>
              <tbody>
                {pricing.map((p) => (
                  <tr key={p.id} className={`border-b ${isDark ? "border-slate-800/50" : "border-slate-100"}`}>
                    <td className={`py-2 px-3 ${isDark ? "text-slate-200" : "text-slate-800"}`}>{p.provider}</td>
                    <td className="py-2 px-3 font-mono text-slate-500">{p.model}</td>
                    <td className="text-end py-2 px-3 font-mono text-slate-500">${p.input_cost_per_1k.toFixed(5)}</td>
                    <td className="text-end py-2 px-3 font-mono text-slate-500">${p.output_cost_per_1k.toFixed(5)}</td>
                    <td className="text-center py-2 px-3">
                      {p.is_free ? <span className="px-2 py-0.5 rounded text-xs bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">{t("free")}</span> : <span className="text-xs text-slate-400">—</span>}
                    </td>
                    <td className="text-end py-2 px-3">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => editPricing(p)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                          <Edit2 className="w-3.5 h-3.5 text-slate-400" />
                        </button>
                        <button onClick={() => deletePricing(p)} className="p-1.5 rounded-lg hover:bg-rose-500/10 text-slate-400 hover:text-rose-500 transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pricing modal */}
      {showPricingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setShowPricingModal(false)}>
          <div className={`w-full max-w-md ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"} border rounded-2xl shadow-2xl animate-scale-in`} onClick={(e) => e.stopPropagation()}>
            <div className={`flex items-center justify-between p-6 border-b ${isDark ? "border-slate-800" : "border-slate-200"}`}>
              <h2 className={`text-lg font-bold ${isDark ? "text-slate-100" : "text-slate-900"}`}>{editingPricingId ? t("editPricing") : t("addPricing")}</h2>
              <button onClick={() => setShowPricingModal(false)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-1.5 ${isDark ? "text-slate-300" : "text-slate-700"}`}>{t("provider")}</label>
                <select value={pricingForm.provider} onChange={(e) => setPricingForm({ ...pricingForm, provider: e.target.value })} className={inputClass}>
                  <option value="">—</option>
                  {providers.map((p) => <option key={p.id} value={p.name}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1.5 ${isDark ? "text-slate-300" : "text-slate-700"}`}>{t("model")}</label>
                <input type="text" value={pricingForm.model} onChange={(e) => setPricingForm({ ...pricingForm, model: e.target.value })} placeholder="gpt-4o, claude-3.5-sonnet..." className={inputClass} />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1.5 ${isDark ? "text-slate-300" : "text-slate-700"}`}>{t("inputCostPer1k")}</label>
                <input type="number" step="0.00001" value={pricingForm.input_cost_per_1k} onChange={(e) => setPricingForm({ ...pricingForm, input_cost_per_1k: parseFloat(e.target.value) || 0 })} className={inputClass} />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1.5 ${isDark ? "text-slate-300" : "text-slate-700"}`}>{t("outputCostPer1k")}</label>
                <input type="number" step="0.00001" value={pricingForm.output_cost_per_1k} onChange={(e) => setPricingForm({ ...pricingForm, output_cost_per_1k: parseFloat(e.target.value) || 0 })} className={inputClass} />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={pricingForm.is_free} onChange={(e) => setPricingForm({ ...pricingForm, is_free: e.target.checked })} className="w-4 h-4 rounded" />
                <span className={`text-sm ${isDark ? "text-slate-300" : "text-slate-700"}`}>{t("isFreeModel")}</span>
              </label>
            </div>
            <div className={`flex items-center justify-end gap-3 p-6 border-t ${isDark ? "border-slate-800" : "border-slate-200"}`}>
              <button onClick={() => setShowPricingModal(false)} className="px-4 py-2.5 rounded-lg text-sm font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">{t("cancel")}</button>
              <button onClick={savePricing} className="px-4 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-white text-sm font-medium transition-colors">{editingPricingId ? t("saveChanges") : t("addPricing")}</button>
            </div>
          </div>
        </div>
      )}

      {/* Budget modal */}
      {showBudgetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setShowBudgetModal(false)}>
          <div className={`w-full max-w-md ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"} border rounded-2xl shadow-2xl animate-scale-in`} onClick={(e) => e.stopPropagation()}>
            <div className={`flex items-center justify-between p-6 border-b ${isDark ? "border-slate-800" : "border-slate-200"}`}>
              <h2 className={`text-lg font-bold ${isDark ? "text-slate-100" : "text-slate-900"}`}>{t("editBudget")}</h2>
              <button onClick={() => setShowBudgetModal(false)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-1.5 ${isDark ? "text-slate-300" : "text-slate-700"}`}>{t("budgetAmount")} (USD)</label>
                <input type="number" step="0.01" value={budgetForm.budget_amount} onChange={(e) => setBudgetForm({ ...budgetForm, budget_amount: parseFloat(e.target.value) || 0 })} className={inputClass} />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1.5 ${isDark ? "text-slate-300" : "text-slate-700"}`}>{t("alertThreshold")} (%)</label>
                <input type="number" min="0" max="100" value={budgetForm.alert_threshold} onChange={(e) => setBudgetForm({ ...budgetForm, alert_threshold: parseFloat(e.target.value) || 0 })} className={inputClass} />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={budgetForm.alerts_enabled} onChange={(e) => setBudgetForm({ ...budgetForm, alerts_enabled: e.target.checked })} className="w-4 h-4 rounded" />
                <span className={`text-sm ${isDark ? "text-slate-300" : "text-slate-700"}`}>{t("budgetAlerts")}</span>
              </label>
            </div>
            <div className={`flex items-center justify-end gap-3 p-6 border-t ${isDark ? "border-slate-800" : "border-slate-200"}`}>
              <button onClick={() => setShowBudgetModal(false)} className="px-4 py-2.5 rounded-lg text-sm font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">{t("cancel")}</button>
              <button onClick={saveBudget} className="px-4 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-white text-sm font-medium transition-colors">{t("saveBudget")}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
