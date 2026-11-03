import type { Translation } from "./types";

export const es: Translation = {
  ui: {
    conversationWith: "Conversación con",
    llamaPortfolio: "Paco, la llama del portfolio",
    closeConversation: "Cerrar la conversación",
    close: "Cerrar",
    talkTo: "Hablar con",
    enableSound: "Activar sonido",
    disableSound: "Silenciar",
    voiceVolume: "Volumen de la voz de la llama",
    playMusic: "Poner su música en bucle",
    stopMusic: "Detener la música",
    language: "Idioma",
  },
  owner: {
    role: "desarrollador web",
    location: "Lima, Perú",
    bio: "Convierte ideas en interfaces rápidas, animadas y agradables de usar. Cuida tanto el detalle de una curva como la limpieza del código.",
    projectSummaries: [
      "Este sitio: una llama en 3D y una conversación.",
      "Próximamente",
    ],
  },
  llama: {
    personality:
      "Soy una llama dibujada trazo a trazo y animada en un lienzo 3D. Respiro, parpadeo y hablo: haz clic en mis respuestas para conversar.",
  },
  dialogue: {
    intro: {
      text: "¡Bienvenido a mi universo! Soy Paco, la llama que cuida este portfolio. ¿Qué te trae por aquí?",
      choices: [
        "Háblame de tu humano",
        "¿Y tú, quién eres?",
        "Muéstrame sus proyectos",
        "¿Cómo puedo contactar con él?",
      ],
    },
    owner: {
      text: (name, role, location, bio) =>
        `Mi humano se llama ${name}. Es ${role} y vive en ${location}. ${bio}`,
      choices: ["Ver sus proyectos", "Contactarlo", "Reproducir su música", "Otra cosa"],
    },
    about: {
      text: "",
      choices: [
        "Háblame de tu humano",
        "¿Cómo puedo contactar con él?",
        "Otra cosa",
      ],
    },
    projects: {
      text: "Esto es lo que ha construido recientemente. Haz clic para abrir un proyecto; yo vigilaré.",
      choices: ["¿Cómo puedo contactar con él?", "Otra cosa"],
    },
    contact: {
      text: (email) =>
        `Lo más sencillo es enviar un correo: ${email}. Responde rápido, salvo cuando depura.`,
      choices: ["Enviar un correo", "GitHub", "LinkedIn", "Otra cosa"],
    },
  },
};
