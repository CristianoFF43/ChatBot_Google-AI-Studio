
import { useState, useRef, useEffect } from 'react';

interface SpeechToTextOptions {
  onTranscript: (transcript: string) => void;
}

const getSpeechRecognition = () => {
  // Fix: Use 'as any' to bypass TypeScript errors for non-standard browser APIs.
  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  if (SpeechRecognition) {
    return new SpeechRecognition();
  }
  return null;
};

export const useSpeechToText = ({ onTranscript }: SpeechToTextOptions) => {
  const [isListening, setIsListening] = useState(false);
  // Fix: Use 'any' for the ref type as SpeechRecognition is not a standard type.
  const recognitionRef = useRef<any | null>(getSpeechRecognition());

  useEffect(() => {
    const recognition = recognitionRef.current;
    if (!recognition) {
      console.warn('SpeechRecognition API not supported in this browser.');
      return;
    }

    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'pt-BR';

    // Fix: Use 'any' for the event type to resolve missing type definition.
    const handleResult = (event: any) => {
      const last = event.results.length - 1;
      const transcript = event.results[last][0].transcript.trim();
      onTranscript(transcript);
    };

    // Fix: Use 'any' for the event type to resolve missing type definition.
    const handleError = (event: any) => {
      console.error('Speech recognition error', event.error);
      setIsListening(false);
    };

    const handleEnd = () => {
      // In 'continuous' mode, this can fire unexpectedly. 
      // We only set listening to false if explicitly stopped.
    };

    recognition.addEventListener('result', handleResult);
    recognition.addEventListener('error', handleError);
    recognition.addEventListener('end', handleEnd);

    return () => {
      recognition.removeEventListener('result', handleResult);
      recognition.removeEventListener('error', handleError);
      recognition.removeEventListener('end', handleEnd);
      recognition.abort();
    };
  }, [onTranscript]);

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch(e) {
        console.error("Error starting speech recognition:", e)
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  return { isListening, startListening, stopListening };
};