import type { DialogueChoice, DialogueScript } from "./types";
import { llama, owner } from "./profile";

/** Where the conversation starts. */
export const START_NODE = "intro";

const backHome: DialogueChoice = { label: "Autre chose", next: START_NODE };

/**
 * The llama's conversation tree.
 *
 * Each key is a node. `text` is what Paco says (typed out letter by letter),
 * `choices` are the buttons offered underneath. A choice either moves to
 * another node with `next`, or opens a link with `href`.
 *
 * Editing this file is all it takes to change the conversation.
 */
export const llamaScript = {
  intro: {
    text: `Bienvenue dans mon univers ! Je suis ${llama.name}, le lama qui garde ce portfolio. Qu'est-ce qui t'amène ?`,
    choices: [
      { label: "Parle-moi de ton humain", next: "owner" },
      { label: "Et toi, qui es-tu ?", next: "about" },
      { label: "Montre-moi ses projets", next: "projects" },
      { label: "Comment le contacter ?", next: "contact" },
    ],
  },

  owner: {
    text: `Mon humain s'appelle ${owner.name}. ${capitalize(owner.role)} basé à ${owner.location}. ${owner.bio}`,
    choices: [
      { label: "Voir ses projets", next: "projects" },
      { label: "Le contacter", next: "contact" },
      backHome,
    ],
  },

  about: {
    text: `${llama.personality} Je suis fait de courbes, de lumière et d'un peu de code.`,
    choices: [
      { label: "Parle-moi de ton humain", next: "owner" },
      { label: "Comment le contacter ?", next: "contact" },
      backHome,
    ],
  },

  projects: {
    text: `Voici ce qu'il a construit récemment. Clique pour ouvrir un projet, je garde un œil sur toi.`,
    choices: [
      ...owner.projects.map((project) => ({
        label: `${project.name} — ${project.summary}`,
        href: project.href,
      })),
      { label: "Comment le contacter ?", next: "contact" },
      backHome,
    ],
  },

  contact: {
    text: `Le plus simple, c'est un email : ${owner.email}. Il répond vite, sauf quand il débogue.`,
    choices: [
      { label: "Envoyer un email", href: `mailto:${owner.email}` },
      ...owner.links.map((link) => ({ label: link.label, href: link.href })),
      backHome,
    ],
  },
} satisfies DialogueScript;

export type DialogueNodeId = keyof typeof llamaScript;

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
