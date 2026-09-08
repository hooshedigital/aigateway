import { useState, useEffect, useRef } from "react";
import { Search, ArrowRight, Moon, Sun, Languages } from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import type { Page } from "@/types";
import type { TranslationKey } from "@/i18n";

interface CommandItem {
  id: string;
  labelKey: TranslationKey;
  icon: typeof Search;
  action: () => void;
  group: "nav" | "actions";
}

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  onNavigate: (page: Page) => void;
}

export function CommandPalette({ open, onClose, onNavigate }: CommandPaletteProps) {
  const { t, toggleTheme, toggleLang } = useApp();
  const [query, setQuery] = useState("");
  const [selectedIdx, setSelectedIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const pages: Page[] = ["dashboard", "providers", "requestLogs", "playground", "sessions", "riskMonitor", "users", "auditLogs", "apiDocs", "settings"];
  const pageLabelMap: Record<Page, TranslationKey> = {
    dashboard: "dashboard",
    providers: "providers",
    requestLogs: "requestLogs",
    settings: "settings",
    apiDocs: "apiDocs",
    playground: "playground",
    users: "users",
    auditLogs: "auditLogs",
    sessions: "sessions",
    riskMonitor: "riskMonitor",
  };

  const commands: CommandItem[] = [
    ...pages.map((p) => ({
      id: `nav-${p}`,
      labelKey: pageLabelMap[p],
      icon: ArrowRight,
      action: () => { onNavigate(p); onClose(); },
      group: "nav" as const,
    })),
    { id: "toggle-theme", labelKey: "toggleTheme", icon: Sun, action: () => { toggleTheme(); onClose(); }, group: "actions" },
    { id: "toggle-lang", labelKey: "toggleLanguage", icon: Languages, action: () => { toggleLang(); onClose(); }, group: "actions" },
  ];

  const filtered = commands.filter((c) => t(c.labelKey).toLowerCase().includes(query.toLowerCase()));

  useEffect(() => {
    if (open) {
      setQuery("");
      setSelectedIdx(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    setSelectedIdx(0);
  }, [query]);

  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIdx((i) => Math.min(i + 1, filtered.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIdx((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        filtered[selectedIdx]?.action();
      } else if (e.key === "Escape") {
        onClose();
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, filtered, selectedIdx]);

  if (!open) return null;

  const navItems = filtered.filter((c) => c.group === "nav");
  const actionItems = filtered.filter((c) => c.group === "actions");

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[20vh] px-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-4 border-b border-slate-200 dark:border-slate-800">
          <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("searchCommands")}
            className="flex-1 bg-transparent py-4 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none"
          />
          <kbd className="px-1.5 py-0.5 text-xs text-slate-400 bg-slate-100 dark:bg-slate-800 rounded font-mono">ESC</kbd>
        </div>
        <div className="max-h-80 overflow-y-auto scrollbar-thin p-2">
          {filtered.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-8">No results</p>
          ) : (
            <>
              {navItems.length > 0 && (
                <div className="mb-2">
                  <p className="text-xs text-slate-400 font-medium px-2 py-1">{t("goTo")}</p>
                  {navItems.map((cmd) => {
                    const idx = filtered.indexOf(cmd);
                    const Icon = cmd.icon;
                    return (
                      <button
                        key={cmd.id}
                        onClick={cmd.action}
                        onMouseEnter={() => setSelectedIdx(idx)}
                        className={`w-full flex items-center gap-3 px-2 py-2 rounded-lg text-sm transition-colors ${
                          selectedIdx === idx ? "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400" : "text-slate-600 dark:text-slate-300"
                        }`}
                      >
                        <Icon className="w-4 h-4 flex-shrink-0" />
                        {t(cmd.labelKey)}
                      </button>
                    );
                  })}
                </div>
              )}
              {actionItems.length > 0 && (
                <div>
                  <p className="text-xs text-slate-400 font-medium px-2 py-1">{t("actions")}</p>
                  {actionItems.map((cmd) => {
                    const idx = filtered.indexOf(cmd);
                    const Icon = cmd.icon;
                    return (
                      <button
                        key={cmd.id}
                        onClick={cmd.action}
                        onMouseEnter={() => setSelectedIdx(idx)}
                        className={`w-full flex items-center gap-3 px-2 py-2 rounded-lg text-sm transition-colors ${
                          selectedIdx === idx ? "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400" : "text-slate-600 dark:text-slate-300"
                        }`}
                      >
                        <Icon className="w-4 h-4 flex-shrink-0" />
                        {t(cmd.labelKey)}
                      </button>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
