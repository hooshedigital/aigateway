import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Server,
  ScrollText,
  Settings,
  Code2,
  Zap,
  Menu,
  X,
  Moon,
  Sun,
  Languages,
  FlaskConical,
  Users,
  ShieldCheck,
  Globe,
  ShieldAlert,
  DollarSign,
  BookOpen,
} from "lucide-react";
import type { Page } from "@/types";
import type { TranslationKey } from "@/i18n";
import { useApp, AppProvider } from "@/contexts/AppContext";
import { CommandPalette } from "@/components/CommandPalette";
import { NotificationsBell } from "@/components/NotificationsBell";
import { Dashboard } from "@/pages/Dashboard";
import { Providers } from "@/pages/Providers";
import { Logs } from "@/pages/Logs";
import { SettingsPage } from "@/pages/Settings";
import { ApiDocs } from "@/pages/ApiDocs";
import { Playground } from "@/pages/Playground";
import { Users as UsersPage } from "@/pages/Users";
import { AuditLogs } from "@/pages/AuditLogs";
import { Sessions } from "@/pages/Sessions";
import { RiskMonitor } from "@/pages/RiskMonitor";
import { CostAnalysis } from "@/pages/CostAnalysis";
import { Guide } from "@/pages/Guide";

const navItems: { id: Page; labelKey: TranslationKey; icon: typeof LayoutDashboard }[] = [
  { id: "dashboard", labelKey: "dashboard", icon: LayoutDashboard },
  { id: "providers", labelKey: "providers", icon: Server },
  { id: "requestLogs", labelKey: "requestLogs", icon: ScrollText },
  { id: "playground", labelKey: "playground", icon: FlaskConical },
  { id: "sessions", labelKey: "sessions", icon: Globe },
  { id: "riskMonitor", labelKey: "riskMonitor", icon: ShieldAlert },
  { id: "costAnalysis", labelKey: "costAnalysis", icon: DollarSign },
  { id: "users", labelKey: "users", icon: Users },
  { id: "auditLogs", labelKey: "auditLogs", icon: ShieldCheck },
  { id: "apiDocs", labelKey: "apiDocs", icon: Code2 },
  { id: "guide", labelKey: "guide", icon: BookOpen },
  { id: "settings", labelKey: "settings", icon: Settings },
];

function AppContent() {
  const { t, theme, toggleTheme, toggleLang, lang } = useApp();
  const [page, setPage] = useState<Page>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);

  useEffect(() => { setSidebarOpen(false); }, [page]);

  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setPaletteOpen((p) => !p);
      }
    }
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const isDark = theme === "dark";
  const sidebarBg = isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200";
  const mobileHeaderBg = isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200";
  const activeNav = "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20";
  const inactiveNav = "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/50 border-transparent";
  const textPrimary = isDark ? "text-slate-100" : "text-slate-900";

  return (
    <div className="min-h-screen transition-colors duration-300">
      {/* Mobile header */}
      <div className={`lg:hidden fixed top-0 inset-x-0 z-50 flex items-center justify-between px-4 h-14 ${mobileHeaderBg} border-b backdrop-blur-xl`}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className={`font-semibold text-sm ${textPrimary}`}>{t("appName")}</span>
        </div>
        <div className="flex items-center gap-1">
          <NotificationsBell />
          <button onClick={toggleLang} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" title={t("language")}>
            <Languages className="w-4 h-4 text-slate-500" />
          </button>
          <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" title={t("theme")}>
            {isDark ? <Sun className="w-4 h-4 text-slate-500" /> : <Moon className="w-4 h-4 text-slate-500" />}
          </button>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 z-40 h-full w-64 ${sidebarBg} border-r flex flex-col transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : (lang === "fa" ? "translate-x-full lg:translate-x-0" : "-translate-x-full lg:translate-x-0")
        } ${lang === "fa" ? "right-0" : "left-0"}`}
      >
        <div className={`h-16 flex items-center gap-3 px-6 border-b ${isDark ? "border-slate-800" : "border-slate-200"}`}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className={`font-bold text-base leading-tight ${textPrimary}`}>{t("appName")}</h1>
            <p className="text-xs text-slate-500">hooshedigital.ir</p>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-thin">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = page === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setPage(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all border ${
                  active ? activeNav : inactiveNav
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {t(item.labelKey)}
              </button>
            );
          })}
        </nav>

        {/* Desktop theme/lang/notifications controls */}
        <div className={`hidden lg:flex items-center gap-2 px-3 py-3 border-t ${isDark ? "border-slate-800" : "border-slate-200"}`}>
          <NotificationsBell />
          <button onClick={toggleLang} className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <Languages className="w-3.5 h-3.5" />
            {lang === "en" ? "FA" : "EN"}
          </button>
          <button onClick={toggleTheme} className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            {isDark ? t("lightMode") : t("darkMode")}
          </button>
        </div>

        <div className={`px-6 py-4 border-t ${isDark ? "border-slate-800" : "border-slate-200"}`}>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            {t("gatewayOnline")}
          </div>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-30 bg-black/50" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main content */}
      <main className="lg:ms-64 pt-14 lg:pt-0 min-h-screen">
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto animate-fade-in">
          {page === "dashboard" && <Dashboard />}
          {page === "providers" && <Providers />}
          {page === "requestLogs" && <Logs />}
          {page === "playground" && <Playground />}
          {page === "sessions" && <Sessions />}
          {page === "riskMonitor" && <RiskMonitor />}
          {page === "costAnalysis" && <CostAnalysis />}
          {page === "users" && <UsersPage />}
          {page === "auditLogs" && <AuditLogs />}
          {page === "apiDocs" && <ApiDocs />}
          {page === "guide" && <Guide />}
          {page === "settings" && <SettingsPage />}
        </div>
      </main>

      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} onNavigate={setPage} />
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
