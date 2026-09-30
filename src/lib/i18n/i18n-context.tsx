"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { setActiveLocale } from "@/lib/format";
import { DEFAULT_LANG, LANGUAGES, MESSAGES, type Lang, type MessageKey } from "./messages";

const STORAGE_KEY = "konoom_hub_lang";

interface I18nContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: MessageKey, vars?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

const isLang = (v: string | null): v is Lang =>
  !!v && LANGUAGES.some((l) => l.code === v);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(DEFAULT_LANG);
  setActiveLocale(lang);

  // Restore the saved choice (or the browser language) after hydration.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (isLang(saved)) {
        setLangState(saved);
        return;
      }
      const browser = navigator.language?.slice(0, 2).toLowerCase() ?? null;
      if (isLang(browser)) setLangState(browser);
    } catch {
      // storage unavailable — stay on default
    }
  }, []);

  useEffect(() => {
    const current = LANGUAGES.find((item) => item.code === lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = current?.dir ?? "ltr";
  }, [lang]);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore
    }
  }, []);

  const t = useCallback<I18nContextValue["t"]>(
    (key, vars) => {
      let text = MESSAGES[lang][key] ?? MESSAGES[DEFAULT_LANG][key] ?? key;
      if (vars) {
        for (const [k, v] of Object.entries(vars)) {
          text = text.replace(`{${k}}`, String(v));
        }
      }
      return text;
    },
    [lang],
  );

  const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
