import { useEffect, useRef, useState } from "react";
import type { FormEvent, KeyboardEvent } from "react";
import { ArrowUp, Sparkles } from "lucide-react";
import { useI18n } from "../../i18n";
import { llama as llamaProfile } from "../dialogue/profile";

export type Exchange = {
  message: string;
  reply: string;
};

export type FreeChatAction =
  | { type: "navigate"; page: "projects" }
  | { type: "play_music" }
  | { type: "open_contact_form"; draft?: string };

const CHAT_ENDPOINT =
  "https://llamaagent-1036709080041.europe-west1.run.app/chat";
const MAX_HISTORY = 10; // = MAX_HISTORY côté serveur
const MAX_CONTENT = 500; // = MAX_HISTORY_CONTENT côté serveur
const MAX_DRAFT = 1000;

function toHistory(exchanges: Exchange[]) {
  return exchanges
    .flatMap((e) => [
      { role: "user", content: e.message },
      { role: "assistant", content: e.reply },
    ])
    .map((m) => ({ ...m, content: m.content.slice(0, MAX_CONTENT) }))
    .slice(-MAX_HISTORY);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === "object" && value !== null && !Array.isArray(value)
  );
}

function parseAction(value: unknown): FreeChatAction | null {
  if (!isRecord(value)) {
    console.warn("Ignoring invalid free-chat action.", value);
    return null;
  }

  if (value.type === "navigate" && value.page === "projects") {
    return { type: "navigate", page: "projects" };
  }
  if (value.type === "play_music") {
    return { type: "play_music" };
  }
  if (value.type === "open_contact_form") {
    return {
      type: "open_contact_form",
      ...(typeof value.draft === "string"
        ? { draft: value.draft.slice(0, MAX_DRAFT) }
        : {}),
    };
  }

  console.warn("Ignoring unsupported free-chat action.", value);
  return null;
}

function parseChatResponse(
  value: unknown,
): { reply: string; actions: FreeChatAction[] } | null {
  if (!isRecord(value) || typeof value.reply !== "string" || !value.reply.trim()) {
    return null;
  }

  if (value.actions !== undefined && !Array.isArray(value.actions)) {
    console.warn("Ignoring invalid free-chat actions.", value.actions);
  }

  return {
    reply: value.reply,
    actions: Array.isArray(value.actions)
      ? value.actions.flatMap((action) => {
          const parsed = parseAction(action);
          return parsed ? [parsed] : [];
        })
      : [],
  };
}

export default function FreeChat({
  onClose,
  exchanges,
  onExchangesChange,
  onAction,
}: {
  onClose: () => void;
  exchanges: Exchange[];
  onExchangesChange: (update: (current: Exchange[]) => Exchange[]) => void;
  onAction: (action: FreeChatAction) => void;
}) {
  const { t } = useI18n();
  const labels = t.ui.freeChat;
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [hasError, setHasError] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const historyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const input = inputRef.current;
    if (input) {
      input.style.height = "auto";
      input.style.height = `${Math.min(input.scrollHeight, 140)}px`;
    }
  }, [message]);

  useEffect(() => {
    const history = historyRef.current;
    if (history) {
      history.scrollTo({ top: history.scrollHeight, behavior: "smooth" });
    }
  }, [exchanges, sending]);

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (
      event.key === "Enter" &&
      !event.shiftKey &&
      !event.nativeEvent.isComposing &&
      message.trim()
    ) {
      event.preventDefault();
      event.currentTarget.form?.requestSubmit();
    }
  }

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
        body: JSON.stringify({
          message: submittedMessage,
          history: toHistory(exchanges),
        }),
      });

      if (!response.ok)
        throw new Error(`Chat request failed: ${response.status}`);

      const result = parseChatResponse(await response.json());
      if (!result) {
        throw new Error("Chat response did not contain a reply.");
      }

      onExchangesChange((current) => [
        ...current,
        { message: submittedMessage, reply: result.reply },
      ]);
      result.actions.forEach(onAction);
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
      <header className="llama-free-chat__header">
        <span className="llama-free-chat__avatar" aria-hidden="true">
          <Sparkles size={16} />
        </span>
        <div>
          <div className="llama-free-chat__title">{labels.title}</div>
          <p className="llama-free-chat__description">{labels.description}</p>
        </div>
      </header>
      <div
        className={`llama-free-chat__history${exchanges.length ? "" : " llama-free-chat__history--empty"}`}
        ref={historyRef}
        aria-live="polite"
        aria-relevant="additions text"
      >
        {exchanges.length === 0 && (
          <div className="llama-free-chat__empty">{labels.empty}</div>
        )}
        {exchanges.map((exchange, index) => (
          <div className="llama-free-chat__exchange" key={index}>
            <span className="llama-free-chat__speaker">{labels.you}</span>
            <p className="llama-free-chat__message">{exchange.message}</p>
            <span className="llama-free-chat__speaker llama-free-chat__speaker--assistant">
              <Sparkles size={12} aria-hidden="true" />
              {llamaProfile.name}
            </span>
            <p className="llama-free-chat__reply">{exchange.reply}</p>
          </div>
        ))}
        {sending && (
          <div className="llama-free-chat__sending" role="status">
            <span className="llama-free-chat__typing-dots" aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
            {labels.sending}
          </div>
        )}
      </div>
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
          onKeyDown={handleKeyDown}
          placeholder={labels.placeholder}
          rows={1}
          required
          disabled={sending}
        />
        {hasError && (
          <div
            className="llama-contact-form__status llama-contact-form__status--error"
            role="alert"
          >
            {labels.error}
          </div>
        )}
        <div className="llama-free-chat__actions">
          <button
            className="llama-contact-form__back"
            type="button"
            onClick={onClose}
          >
            <span>{labels.back}</span>
          </button>
          <button
            className="llama-free-chat__submit"
            type="submit"
            disabled={sending || !message.trim()}
            aria-label={labels.send}
            title={labels.keyHint}
          >
            <ArrowUp size={18} strokeWidth={2.5} aria-hidden="true" />
          </button>
        </div>
        <p className="llama-free-chat__key-hint">{labels.keyHint}</p>
      </form>
    </section>
  );
}
