import type { DialogueChoice, DialogueScript } from "./types";
import type { Translation } from "../../i18n/types";
import { owner } from "./profile";

/** Where the conversation starts. */
export const START_NODE = "intro";

export function createLlamaScript(t: Translation): DialogueScript {
  const backHome: DialogueChoice = { label: t.dialogue.owner.choices[3], next: START_NODE };
  const backHomeProject: DialogueChoice = { label: t.dialogue.projects.choices[1], next: START_NODE };
  const backHomeContact: DialogueChoice = { label: t.dialogue.contact.choices[3], next: START_NODE };

  return {
  intro: {
    text: t.dialogue.intro.text,
    choices: [
      { label: t.dialogue.intro.choices[0], next: "owner" },
      { label: t.dialogue.intro.choices[1], next: "about" },
      { label: t.dialogue.intro.choices[2], next: "projects" },
      { label: t.dialogue.intro.choices[3], next: "contact" },
    ],
  },

  owner: {
    text: t.dialogue.owner.text(owner.name, t.owner.role, t.owner.location, t.owner.bio),
    choices: [
      { label: t.dialogue.owner.choices[0], next: "projects" },
      { label: t.dialogue.owner.choices[1], next: "contact" },
      { label: t.dialogue.owner.choices[2], action: "toggleMusic" },
      backHome,
    ],
  },

  about: {
    text: t.llama.personality,
    choices: [
      { label: t.dialogue.about.choices[0], next: "owner" },
      { label: t.dialogue.about.choices[1], next: "contact" },
      backHome,
    ],
  },

  projects: {
    text: t.dialogue.projects.text,
    choices: [
      ...owner.projects.map((project, index) => ({
        label: `${project.name} — ${t.owner.projectSummaries[index] ?? project.summary}`,
        href: project.href,
      })),
      { label: t.dialogue.projects.choices[0], next: "contact" },
      backHomeProject,
    ],
  },

  contact: {
    text: t.dialogue.contact.text(owner.email),
    choices: [
      { label: t.dialogue.contact.choices[0], href: `mailto:${owner.email}` },
      ...owner.links.map((link) => ({ label: link.label, href: link.href })),
      backHomeContact,
    ],
  },
  } satisfies DialogueScript;
}
