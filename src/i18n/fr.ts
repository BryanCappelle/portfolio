import type { Translation } from "./types";

export const fr: Translation = {
  ui: {
    conversationWith: "Conversation avec",
    llamaPortfolio: "Paco, le lama du portfolio",
    closeConversation: "Fermer la conversation",
    close: "Fermer",
    talkTo: "Parler à",
    enableSound: "Activer le son",
    disableSound: "Couper le son",
    voiceVolume: "Volume de la voix du lama",
    playMusic: "Mettre sa musique en boucle",
    stopMusic: "Arrêter la musique",
    language: "Langue",
  },
  owner: {
    role: "développeur web",
    location: "Lima, Pérou",
    bio: "Il transforme des idées en interfaces rapides, animées et agréables à utiliser. Il aime autant le détail d'une courbe que la propreté d'un code.",
    projectSummaries: [
      "Ce site : un lama en 3D et une conversation.",
      "À venir",
    ],
  },
  llama: {
    personality:
      "Je suis un lama dessiné trait par trait, puis animé dans un canvas 3D. Je respire, je cligne de l'œil et je parle — clique sur mes réponses pour qu'on discute.",
  },
  dialogue: {
    intro: {
      text: "Bienvenue dans mon univers ! Je suis Paco, le lama qui garde ce portfolio. Qu'est-ce qui t'amène ?",
      choices: [
        "Parle-moi de ton humain",
        "Et toi, qui es-tu ?",
        "Montre-moi ses projets",
        "Comment le contacter ?",
      ],
    },
    owner: {
      text: (name, role, location, bio) =>
        `Mon humain s'appelle ${name}. ${role.charAt(0).toUpperCase()}${role.slice(1)} basé à ${location}. ${bio}`,
      choices: ["Voir ses projets", "Le contacter", "Écouter sa musique", "Autre chose"],
    },
    about: {
      text: "",
      choices: [
        "Parle-moi de ton humain",
        "Comment le contacter ?",
        "Autre chose",
      ],
    },
    projects: {
      text: "Voici ce qu'il a construit récemment. Clique pour ouvrir un projet, je garde un œil sur toi.",
      choices: ["Comment le contacter ?", "Autre chose"],
    },
    contact: {
      text: (email) =>
        `Le plus simple, c'est un email : ${email}. Il répond vite, sauf quand il débogue.`,
      choices: ["Envoyer un email", "GitHub", "LinkedIn", "Autre chose"],
    },
  },
};
