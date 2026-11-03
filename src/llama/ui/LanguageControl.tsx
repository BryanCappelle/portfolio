import { useI18n } from "../../i18n";
import type { Language } from "../../i18n/types";

const languages: { code: Language; label: string }[] = [
  { code: "fr", label: "FR" },
  { code: "en", label: "EN" },
  { code: "es", label: "ES" },
];

export default function LanguageControl() {
  const { language, setLanguage, t } = useI18n();

  return (
    <div className="llama-language-control" role="group" aria-label={t.ui.language}>
      {languages.map(({ code, label }) => (
        <button
          key={code}
          type="button"
          className={language === code ? "is-active" : undefined}
          aria-pressed={language === code}
          onClick={() => setLanguage(code)}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
