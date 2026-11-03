/** One answer the visitor can pick in a speech bubble. */
export type DialogueChoice = {
  label: string;
  /** Node to move to when picked. Leave empty for links and actions. */
  next?: string;
  /** Opens in a new tab instead of navigating the conversation. */
  href?: string;
};

/** A single thing the llama says, and the answers it offers. */
export type DialogueNode = {
  text: string;
  choices: DialogueChoice[];
};

/**
 * The whole conversation. Keys are node ids; `DialogueChoice.next` must be
 * one of them.
 */
export type DialogueScript = Record<string, DialogueNode>;
