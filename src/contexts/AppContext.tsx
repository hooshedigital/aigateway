import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { translations, type Lang, type TranslationKey } from "@/i18n";

type Theme = "dark" | "light";

interface AppContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: TranslationKey) => string;
  theme: Theme;
  setTheme: (th: Theme) => void;
  toggleTheme: () => void;
  toggleLang: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    const saved = localStorage.getItem("aigw-lang");
    return (saved as Lang) || "en";
  });
  const [theme, setThemeState] = useState<Theme>(() => {
    const saved = localStorage.getItem("aigw-theme");
    return (saved as Theme) || "dark";
  });

  useEffect(() => {
    localStorage.setItem("aigw-lang", lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "fa" ? "rtl" : "ltr";
  }, [lang]);

  useEffect(() => {
    localStorage.setItem("aigw-theme", theme);
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  const t = (key: TranslationKey): string => {
    return translations[lang][key] ?? translations.en[key] ?? key;
  };

  const setLang = (l: Lang) => setLangState(l);
  const setTheme = (th: Theme) => setThemeState(th);
  const toggleTheme = () => setThemeState((p) => (p === "dark" ? "light" : "dark"));
  const toggleLang = () => setLangState((p) => (p === "en" ? "fa" : "en"));

  return (
    <AppContext.Provider value={{ lang, setLang, t, theme, setTheme, toggleTheme, toggleLang }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
