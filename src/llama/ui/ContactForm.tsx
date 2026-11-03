import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { ArrowRight } from "lucide-react";
import { useI18n } from "../../i18n";

type Props = {
  onClose: () => void;
};

export default function ContactForm({ onClose }: Props) {
  const { t } = useI18n();
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const subjectRef = useRef<HTMLSelectElement>(null);

  useEffect(() => {
    subjectRef.current?.focus();

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "sending") return;

    setStatus("sending");
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          access_key: import.meta.env.VITE_WEB3FORMS_ACCESS_KEY,
          subject: data.subject,
          email: data.email,
          message: data.message,
          from_name: "Portfolio - Paco",
          botcheck: "",
        }),
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        setStatus("error");
        return;
      }

      setStatus("success");
      form.reset();
    } catch {
      setStatus("error");
    }
  }

  const labels = t.ui.contactForm;

  return (
    <div className="llama-contact-form">
      <div className="llama-contact-form__title">{labels.title}</div>
      {status === "success" ? (
        <div className="llama-contact-form__status llama-contact-form__status--success">
          <span aria-hidden="true">✓</span>
          {labels.success}
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="llama-contact-form__row">
            <label>
              <span>{labels.subject}</span>
              <select ref={subjectRef} name="subject" required defaultValue="">
                <option value="" disabled>{labels.subjectPlaceholder}</option>
                {labels.subjectOptions.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </label>
          </div>
          <div className="llama-contact-form__email">
            <label>
              <span>{labels.email}</span>
              <input name="email" type="email" required maxLength={254} />
            </label>
          </div>
          <label className="llama-contact-form__message">
            <span>{labels.message}</span>
            <textarea name="message" required minLength={10} maxLength={1000} rows={4} />
          </label>
          <input type="checkbox" name="botcheck" className="visually-hidden" tabIndex={-1} autoComplete="off" />
          {status === "error" && (
            <div className="llama-contact-form__status llama-contact-form__status--error">
              {labels.error}
            </div>
          )}
          <div className="llama-contact-form__actions">
            <button className="llama-contact-form__back" type="button" onClick={onClose}>
              <span>{labels.close}</span>
            </button>
            <button
              className="llama-contact-form__submit"
              type="submit"
              disabled={status === "sending"}
            >
              <span>{status === "sending" ? labels.sending : labels.send}</span>
              {status !== "sending" && (
                <ArrowRight
                  className="llama-contact-form__arrow"
                  size={16}
                  strokeWidth={2.5}
                  aria-hidden="true"
                />
              )}
            </button>
          </div>
        </form>
      )}
      {status === "success" && (
        <button className="llama-contact-form__back llama-contact-form__back--success" type="button" onClick={onClose}>
          <span>{labels.close}</span>
        </button>
      )}
    </div>
  );
}
