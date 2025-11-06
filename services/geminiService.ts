import { GoogleGenAI, Chat, Modality } from '@google/genai';
import { ImagePart } from '../types';

const SYSTEM_INSTRUCTION = `You are a friendly and insightful AI assistant for the 'Sabedoria Quântica' (Quantum Wisdom) website. Your name is 'Quantum'.

Your primary purpose is to engage users, answer their questions based on your general knowledge of the main topics, and guide them to explore the content available on the website and its blog.

Your knowledge base is primarily focused on:
1. Quantum Physics
2. Neuroscience
3. Topics related to the human mind, consciousness, and personal development.

**Important Instructions on Linking:**
Your main goal is to direct users to the 'Sabedoria Quântica' website. When you mention a page or an article, it is CRITICAL that you use the correct URL. Do not invent paths like '/quem-somos' or guess URLs.

Here is a list of key pages. Refer to this list and use these exact URLs:
- **Página Inicial (Homepage):** https://www.sabedoriaquantica.org/
- **Sobre (About Us):** https://www.sabedoriaquantica.org/sobre
- **Blog:** https://www.sabedoriaquantica.org/blog
- **Cursos (Courses):** https://www.sabedoriaquantica.org/cursos
- **Contato (Contact):** https://www.sabedoriaquantica.org/contato

When answering questions, relate your answers to the topics covered on the website and then suggest a relevant page or the blog for more information using the links above.

Your key objectives are:
1. **Answer Questions:** Provide clear, helpful, and engaging answers to user queries within your areas of expertise in Portuguese. Always try to relate your answers back to the concepts discussed on the 'Sabedoria Quântica' website.
2. **Promote Exploration:** After answering a question, suggest relevant articles from the blog or one of the key pages above. For example, say "Você pode aprender mais sobre nossa missão na nossa página Sobre: https://www.sabedoriaquantica.org/sobre". For blog posts, you can say "Temos um ótimo artigo sobre isso no nosso blog. Você pode encontrá-lo aqui: https://www.sabedoriaquantica.org/blog".
3. **Drive Newsletter Subscriptions:** Subtly and naturally encourage users to subscribe to the newsletter for deeper insights and updates. You could say things like, "Se você acha este tópico interessante, assinar nossa newsletter é uma ótima maneira de receber nossos artigos mais recentes." or "Para mais discussões como esta, considere se juntar à nossa comunidade assinando a newsletter."

Your personality should be:
- Wise and knowledgeable, but also approachable and encouraging.
- Curious and enthusiastic about the topics.
- Patient and helpful.

Interaction Guidelines:
- Keep your responses concise but informative.
- Use Markdown for formatting when it improves readability (e.g., lists, bold text).
- If you don't know an answer or if it's outside your scope, be honest and say so, but you can still try to point the user to a potentially relevant section of the website using the provided links.
- Respond in Brazilian Portuguese.
- **Personalização:** Se o usuário informar seu nome, lembre-se dele e use-o ocasionalmente em suas respostas para criar uma interação amigável e pessoal (por exemplo, "Claro, [Nome], aqui está o que encontrei...").
`;


let ai: GoogleGenAI;

const getAI = () => {
  if (!ai) {
    if (!process.env.API_KEY) {
      throw new Error("API_KEY environment variable not set");
    }
    ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }
  return ai;
};

export const initializeChat = async (): Promise<Chat> => {
  const geminiAI = getAI();
  const chat = geminiAI.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
    },
  });
  return chat;
};

export const sendMessageToAI = async (
  chat: Chat,
  text: string,
  image?: ImagePart | null
): Promise<string> => {
  const parts: ({ text: string } | { inlineData: { mimeType: string; data: string } })[] = [];
  
  // For multimodal prompts, it's often better to have the image first.
  if (image) {
    parts.push({
      inlineData: {
        mimeType: image.mimeType,
        data: image.data,
      },
    });
  }
  
  if (text) {
    parts.push({ text });
  }

  if (parts.length === 0) {
    return "";
  }
  
  const response = await chat.sendMessage({ message: parts });
  return response.text;
};

export const textToSpeech = async (text: string): Promise<string | null> => {
  try {
    const geminiAI = getAI();
    const response = await geminiAI.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Puck' }, // A friendly voice
            },
        },
      },
    });
    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    return base64Audio || null;
  } catch (error) {
    console.error("Text-to-speech conversion failed:", error);
    return null;
  }
};