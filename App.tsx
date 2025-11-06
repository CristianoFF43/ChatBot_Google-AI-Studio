
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Chat } from '@google/genai';
import { ChatWindow } from './components/ChatWindow';
import { ChatInput } from './components/ChatInput';
import { Header } from './components/Header';
import { Message, ChatRole, ImagePart } from './types';
import { initializeChat, sendMessageToAI, textToSpeech } from './services/geminiService';
import { useAudioPlayback } from './hooks/useAudioPlayback';

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const chatRef = useRef<Chat | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [isAwaitingName, setIsAwaitingName] = useState(false);

  const { playAudio, isPlaying, stopAudio } = useAudioPlayback();

  useEffect(() => {
    const initChat = async () => {
      try {
        setIsLoading(true);
        chatRef.current = await initializeChat();
        setMessages([
          {
            role: ChatRole.BOT,
            parts: [{ type: 'text', content: "Olá! Eu sou Quantum, seu assistente virtual do Sabedoria Quântica. Como posso ajudar você a explorar os fascinantes mundos da física quântica, neurociência e da mente humana hoje?" }],
          },
        ]);
      } catch (e) {
        setError('Failed to initialize the chatbot. Please check your API key and refresh the page.');
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    initChat();
  }, []);

  const handleSendMessage = useCallback(async (text: string, image?: ImagePart | null) => {
    if (isLoading || (!text && !image)) return;

    setIsLoading(true);
    setError(null);
    stopAudio();

    const userMessageParts: ( { type: 'text', content: string } | { type: 'image', content: ImagePart } )[] = [];
    if (text) userMessageParts.push({ type: 'text', content: text });
    if (image) userMessageParts.push({ type: 'image', content: image });

    const newUserMessage: Message = {
      role: ChatRole.USER,
      parts: userMessageParts,
    };

    setMessages(prevMessages => [...prevMessages, newUserMessage]);
    
    // Handle name-gathering logic
    if (isAwaitingName) {
        setUserName(text);
        setIsAwaitingName(false);
        const botResponseText = `Obrigado, ${text}! É um prazer conhecer você. Agora, o que você gostaria de saber?`;
        const botMessage: Message = {
            role: ChatRole.BOT,
            parts: [{ type: 'text', content: botResponseText }],
        };
        setMessages(prevMessages => [...prevMessages, botMessage]);
        
        try {
            const audioData = await textToSpeech(botResponseText);
            if (audioData) {
                playAudio(audioData);
            }
        } catch (e) {
            console.error("TTS failed for name confirmation message", e);
        } finally {
            setIsLoading(false);
        }
        return;
    }

    if (!userName) { 
        setIsAwaitingName(true);
        const botResponseText = `Com certeza! Antes de continuarmos, como você gostaria que eu o chamasse?`;
        const botMessage: Message = {
            role: ChatRole.BOT,
            parts: [{ type: 'text', content: botResponseText }],
        };
        setMessages(prevMessages => [...prevMessages, botMessage]);

        try {
            const audioData = await textToSpeech(botResponseText);
            if (audioData) {
                playAudio(audioData);
            }
        } catch (e) {
            console.error("TTS failed for name request message", e);
        } finally {
            setIsLoading(false);
        }
        return;
    }
    
    // Regular AI interaction
    try {
      if (!chatRef.current) {
        throw new Error('Chat session not initialized.');
      }

      const response = await sendMessageToAI(chatRef.current, text, image);
      const botMessage: Message = {
        role: ChatRole.BOT,
        parts: [{ type: 'text', content: response }],
      };

      setMessages(prevMessages => [...prevMessages, botMessage]);
      
      const audioData = await textToSpeech(response);
      if (audioData) {
        playAudio(audioData);
      }
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      setError(`Error communicating with the AI: ${errorMessage}`);
      const errorBotMessage: Message = {
        role: ChatRole.BOT,
        parts: [{ type: 'text', content: "Desculpe, não consegui processar sua solicitação no momento. Por favor, tente novamente mais tarde." }],
      };
      setMessages(prevMessages => [...prevMessages, errorBotMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, playAudio, stopAudio, isAwaitingName, userName]);

  return (
    <div className="flex flex-col h-screen bg-slate-900 text-white font-sans antialiased">
      <Header />
      <ChatWindow messages={messages} isLoading={isLoading} />
      {error && <div className="text-red-400 text-center py-2 px-4 bg-red-900/50">{error}</div>}
      <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} isAudioPlaying={isPlaying} stopAudioPlayback={stopAudio} />
    </div>
  );
};

export default App;
