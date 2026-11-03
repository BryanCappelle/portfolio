export type Language = "fr" | "en" | "es";

export type Translation = {
  ui: {
    conversationWith: string;
    llamaPortfolio: string;
    closeConversation: string;
    close: string;
    talkTo: string;
    enableSound: string;
    disableSound: string;
    voiceVolume: string;
    language: string;
  };
  owner: {
    role: string;
    location: string;
    bio: string;
    projectSummaries: string[];
  };
  llama: {
    personality: string;
  };
  dialogue: {
    intro: { text: string; choices: string[] };
    owner: { text: (name: string, role: string, location: string, bio: string) => string; choices: string[] };
    about: { text: string; choices: string[] };
    projects: { text: string; choices: string[] };
    contact: { text: (email: string) => string; choices: string[] };
  };
};
