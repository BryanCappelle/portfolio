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
  personality:
    "Je suis un lama dessiné trait par trait, puis animé dans un canvas 3D. Je respire, je cligne de l'œil et je parle — clique sur mes réponses pour qu'on discute.",
};

export const owner = {
  // TODO: remplace ces informations par les tiennes.
  name: "Ton prénom",
  role: "développeur web",
  location: "Lima, Pérou",
  bio: "Il transforme des idées en interfaces rapides, animées et agréables à utiliser. Il aime autant le détail d'une courbe que la propreté d'un code.",
  email: "bonjour@exemple.com",
  links: [
    { label: "GitHub", href: "https://github.com/" },
    { label: "LinkedIn", href: "https://www.linkedin.com/" },
  ] satisfies ProfileLink[],
  projects: [
    {
      name: "Portfolio",
      summary: "Ce site : un lama en 3D et une conversation.",
      href: "#",
    },
    {
      name: "Projet suivant",
      summary: "À remplacer par un vrai projet.",
      href: "#",
    },
  ] satisfies ProfileProject[],
};
