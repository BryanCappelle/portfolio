import type { Translation } from "./types";

export const en: Translation = {
  ui: {
    conversationWith: "Conversation with",
    llamaPortfolio: "Paco, the portfolio llama",
    closeConversation: "Close conversation",
    close: "Close",
    talkTo: "Talk to",
    enableSound: "Enable sound",
    disableSound: "Mute sound",
    voiceVolume: "Llama voice volume",
    playMusic: "Loop his music",
    stopMusic: "Stop the music",
    language: "Language",
  },
  owner: {
    role: "web developer",
    location: "Lima, Peru",
    bio: "He turns ideas into fast, animated and enjoyable interfaces. He cares as much about the detail of a curve as about clean code.",
    projectSummaries: [
      "This site: a 3D llama and a conversation.",
      "Soon to come",
    ],
  },
  llama: {
    personality:
      "I am a llama drawn stroke by stroke, then animated in a 3D canvas. I breathe, blink and speak — click my answers to chat.",
  },
  dialogue: {
    intro: {
      text: "Welcome to my world! I'm Paco, the llama guarding this portfolio. What brings you here?",
      choices: [
        "Tell me about your human",
        "Who are you?",
        "Show me their projects",
        "How can I contact them?",
      ],
    },
    owner: {
      text: (name, role, location, bio) =>
        `My human is called ${name}. They are a ${role} based in ${location}. ${bio}`,
      choices: ["See their projects", "Contact them", "Play his music", "Something else"],
    },
    about: {
      text: "",
      choices: [
        "Tell me about your human",
        "How can I contact them?",
        "Something else",
      ],
    },
    projects: {
      text: "Here is what they have built recently. Click a project to open it; I will keep an eye on you.",
      choices: ["How can I contact them?", "Something else"],
    },
    contact: {
      text: (email) =>
        `The easiest way is email: ${email}. They reply quickly, except when debugging.`,
      choices: ["Send an email", "GitHub", "LinkedIn", "Something else"],
    },
  },
};
