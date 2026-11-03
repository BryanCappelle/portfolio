import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { en } from "./en";
import { es } from "./es";
import { fr } from "./fr";
import type { Language, Translation } from "./types";

export const translations = { fr, en, es } satisfies Record<Language, Translation>;

const STORAGE_KEY = "portfolio-language";

function detectLanguage(): Language {
  const stored = window.localStorage.getItem(STORAGE_KEY) as Language | null;
  if (stored && stored in translations) return stored;

  const browserLanguage = navigator.language.toLowerCase().split("-")[0];
  return browserLanguage === "en" || browserLanguage === "es" ? browserLanguage : "fr";
}

type I18nContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: Translation;
};

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(detectLanguage);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, language);
    document.documentElement.lang = language;
  }, [language]);

  const value = useMemo(
    () => ({
      language,
      setLanguage: (nextLanguage: Language) => setLanguageState(nextLanguage),
      t: translations[language],
    }),
    [language],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) throw new Error("useI18n must be used inside I18nProvider");
  return context;
}
