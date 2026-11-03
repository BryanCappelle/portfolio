import { useCallback, useMemo, useState } from "react";
import type { DialogueChoice, DialogueNode, DialogueScript } from "./types";

export type DialogueState = {
  nodeId: string;
  node: DialogueNode;
  isOpen: boolean;
  /** Moves to the node of a choice, ignores link-only choices. */
  choose: (choice: DialogueChoice) => void;
  close: () => void;
  open: () => void;
};

/**
 * Walks through a dialogue script. Navigation is guarded: a choice pointing
 * at an unknown node is ignored instead of breaking the conversation.
 */
export function useDialogue(
  script: DialogueScript,
  startId: string,
): DialogueState {
  const [nodeId, setNodeId] = useState(startId);
  const [isOpen, setIsOpen] = useState(true);

  const node = useMemo(
    () => script[nodeId] ?? script[startId],
    [script, nodeId, startId],
  );

  const choose = useCallback(
    (choice: DialogueChoice) => {
      if (!choice.next || !script[choice.next]) return;
      setNodeId(choice.next);
    },
    [script],
  );

  const close = useCallback(() => setIsOpen(false), []);
  const open = useCallback(() => setIsOpen(true), []);

  return { nodeId, node, isOpen, choose, close, open };
}
