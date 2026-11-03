/**
 * Everything the llama knows about itself and its owner.
 * This is the only file to edit when your details change — the conversation
 * in `script.ts` is built from it.
 */

export type ProfileLink = {
  label: string;
  href: string;
};

export type ProfileProject = {
  name: string;
  /** One short line: what it is. */
  summary: string;
  href: string;
};

export const llama = {
  name: "Paco",
  species: "lama dessiné en 3D",
  intro: "Bienvenue dans mon univers !",
};

export const owner = {
  // TODO: remplace ces informations par les tiennes.
  name: "Bryan Cappelle",
  email: "bryan.cappelle@gmail.com",
  links: [
    { label: "GitHub", href: "https://github.com/BryanCappelle" },
    {
      label: "LinkedIn",
      href: "https://www.linkedin.com/in/bryan-cappelle-9b0a11199/",
    },
  ] satisfies ProfileLink[],
  projects: [
    {
      name: "Portfolio",
      summary: "Ce site : un lama en 3D et une conversation.",
      href: "#",
    },
    {
      name: "WIP",
      summary: "Soon to come",
      href: "#",
    },
  ] satisfies ProfileProject[],
};
