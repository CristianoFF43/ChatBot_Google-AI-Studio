
import React, { useState, useRef, ChangeEvent, KeyboardEvent } from 'react';
import { useSpeechToText } from '../hooks/useSpeechToText';
import { ImagePart } from '../types';

interface ChatInputProps {
  onSendMessage: (text: string, image?: ImagePart | null) => void;
  isLoading: boolean;
  isAudioPlaying: boolean;
  stopAudioPlayback: () => void;
}

const SendIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
    </svg>
);
const MicIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M8.25 4.5a3.75 3.75 0 117.5 0v8.25a3.75 3.75 0 11-7.5 0V4.5z" />
      <path d="M6 10.5a.75.75 0 01.75.75v1.5a5.25 5.25 0 1010.5 0v-1.5a.75.75 0 011.5 0v1.5a6.75 6.75 0 11-13.5 0v-1.5A.75.75 0 016 10.5z" />
    </svg>
);
const StopIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M4.5 7.5a3 3 0 013-3h9a3 3 0 013 3v9a3 3 0 01-3 3h-9a3 3 0 01-3-3v-9z" clipRule="evenodd" />
    </svg>
);
const ImageIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
    </svg>
);
const XCircleIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-1.72 6.97a.75.75 0 10-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 101.06 1.06L12 13.06l1.72 1.72a.75.75 0 101.06-1.06L13.06 12l1.72-1.72a.75.75 0 10-1.06-1.06L12 10.94l-1.72-1.72z" clipRule="evenodd" />
    </svg>
);


export const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading, isAudioPlaying, stopAudioPlayback }) => {
  const [text, setText] = useState('');
  const [image, setImage] = useState<ImagePart | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fix: Removed 'transcript' as it's not returned by the hook.
  const { isListening, startListening, stopListening } = useSpeechToText({
    onTranscript: (newTranscript) => setText(prev => prev ? `${prev} ${newTranscript}` : newTranscript),
  });
  
  const handleSend = () => {
    const trimmedText = text.trim();
    if (isLoading || (!trimmedText && !image)) return;
    onSendMessage(trimmedText, image);
    setText('');
    setImage(null);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        const base64Data = base64String.split(',')[1];
        setImage({
            data: base64Data,
            mimeType: file.type,
            preview: URL.createObjectURL(file)
        });
      };
      reader.readAsDataURL(file);
    }
    // Reset file input value to allow selecting the same file again
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  return (
    <div className="bg-slate-800 p-4 border-t border-slate-700">
      <div className="max-w-4xl mx-auto">
        {image && (
            <div className="relative inline-block mb-2">
                <img src={image.preview} alt="Preview" className="h-20 w-20 object-cover rounded-md border-2 border-slate-600"/>
                <button 
                    onClick={() => setImage(null)}
                    className="absolute -top-2 -right-2 bg-slate-700 text-white rounded-full p-0.5 hover:bg-red-500 transition-colors"
                    aria-label="Remove image"
                >
                    <XCircleIcon className="w-5 h-5" />
                </button>
            </div>
        )}
        <div className="relative flex items-end bg-slate-700 rounded-lg p-2">
          <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
          <button
              onClick={() => fileInputRef.current?.click()}
              className="p-2 text-slate-400 hover:text-cyan-400 disabled:opacity-50"
              disabled={isLoading || isListening}
              aria-label="Attach image"
          >
              <ImageIcon className="w-6 h-6" />
          </button>
          
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isListening ? "Ouvindo..." : "Digite sua mensagem ou use o microfone..."}
            className="flex-1 bg-transparent text-slate-200 placeholder-slate-400 resize-none outline-none px-2 max-h-40"
            rows={1}
            disabled={isLoading}
          />
          
          <button
              onClick={isListening ? stopListening : startListening}
              className={`p-2 transition-colors duration-200 disabled:opacity-50 ${isListening ? 'text-red-500 animate-pulse' : 'text-slate-400 hover:text-cyan-400'}`}
              disabled={isLoading}
              aria-label={isListening ? "Stop recording" : "Start recording"}
          >
              <MicIcon className="w-6 h-6" />
          </button>
          
          {isAudioPlaying ? (
              <button onClick={stopAudioPlayback} className="p-2 text-red-500 hover:text-red-400" aria-label="Stop audio">
                  <StopIcon className="w-6 h-6" />
              </button>
          ) : (
            <button
                onClick={handleSend}
                disabled={isLoading || (!text.trim() && !image)}
                className="p-2 rounded-md bg-purple-600 text-white disabled:bg-slate-600 disabled:cursor-not-allowed hover:bg-purple-700 transition-colors"
                aria-label="Send message"
            >
                <SendIcon className="w-6 h-6" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};