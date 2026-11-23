import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { ArrowRight } from "lucide-react";
import { useI18n } from "../../i18n";
import { llama as llamaProfile } from "../dialogue/profile";

type Exchange = {
  message: string;
  reply: string;
};

const CHAT_ENDPOINT = "https://llamaagent-1036709080041.europe-west1.run.app/chat";

function hasReply(result: unknown): result is { reply: string } {
  return (
    typeof result === "object" &&
    result !== null &&
    "reply" in result &&
    typeof result.reply === "string" &&
    result.reply.trim().length > 0
  );
}

export default function FreeChat({ onClose }: { onClose: () => void }) {
  const { t } = useI18n();
  const labels = t.ui.freeChat;
  const [message, setMessage] = useState("");
  const [exchanges, setExchanges] = useState<Exchange[]>([]);
  const [sending, setSending] = useState(false);
  const [hasError, setHasError] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const submittedMessage = message.trim();
    if (!submittedMessage || sending) return;

    setSending(true);
    setHasError(false);
    try {
      const response = await fetch(CHAT_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ message: submittedMessage }),
      });

      if (!response.ok) throw new Error(`Chat request failed: ${response.status}`);

      const result: unknown = await response.json();
      if (!hasReply(result)) {
        throw new Error("Chat response did not contain a reply.");
      }

      setExchanges((current) => [
        ...current,
        { message: submittedMessage, reply: result.reply },
      ]);
      setMessage("");
    } catch (error) {
      console.error("Could not send a message to the llama.", error);
      setHasError(true);
    } finally {
      setSending(false);
    }
  }

  return (
    <section className="llama-free-chat" aria-label={labels.title}>
      <div className="llama-free-chat__title">{labels.title}</div>
      {exchanges.length > 0 && (
        <div className="llama-free-chat__history" aria-live="polite">
          {exchanges.map((exchange, index) => (
            <div className="llama-free-chat__exchange" key={index}>
              <p className="llama-free-chat__message">
                <span className="visually-hidden">{labels.you} : </span>
                {exchange.message}
              </p>
              <p className="llama-free-chat__reply">
                <span className="visually-hidden">{llamaProfile.name} : </span>
                {exchange.reply}
              </p>
            </div>
          ))}
        </div>
      )}
      <form className="llama-free-chat__form" onSubmit={handleSubmit}>
        <label className="visually-hidden" htmlFor="llama-free-chat-message">
          {labels.placeholder}
        </label>
        <textarea
          ref={inputRef}
          id="llama-free-chat-message"
          value={message}
          onChange={(event) => {
            setMessage(event.target.value);
            if (hasError) setHasError(false);
          }}
          placeholder={labels.placeholder}
          rows={3}
          required
          disabled={sending}
        />
        {hasError && (
          <div className="llama-contact-form__status llama-contact-form__status--error" role="alert">
            {labels.error}
          </div>
        )}
        {sending && (
          <div className="llama-free-chat__sending" role="status">
            {labels.sending}
          </div>
        )}
        <div className="llama-contact-form__actions">
          <button className="llama-contact-form__back" type="button" onClick={onClose}>
            <span>{labels.back}</span>
          </button>
          <button
            className="llama-contact-form__submit"
            type="submit"
            disabled={sending || !message.trim()}
          >
            <span>{labels.send}</span>
            {!sending && (
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
    </section>
  );
}

