
import { useState, useCallback, useRef, useEffect } from 'react';

// Helper to decode Base64 string to Uint8Array
function decode(base64: string): Uint8Array {
    const binaryString = window.atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
}

// Helper to decode raw PCM audio data into an AudioBuffer
async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}


export const useAudioPlayback = (sampleRate: number = 24000) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const audioContextRef = useRef<AudioContext | null>(null);
    const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);

    useEffect(() => {
        // Initialize AudioContext lazily on first use or component mount
        if (!audioContextRef.current) {
            try {
                audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate });
            } catch (e) {
                console.error("Web Audio API is not supported in this browser.", e);
            }
        }
        
        return () => {
            // Clean up on unmount
            if (sourceNodeRef.current) {
                sourceNodeRef.current.stop();
            }
            if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
                audioContextRef.current.close();
            }
        };
    }, [sampleRate]);

    const playAudio = useCallback(async (base64Audio: string) => {
        const audioContext = audioContextRef.current;
        if (!audioContext) return;
        
        if (audioContext.state === 'suspended') {
            await audioContext.resume();
        }

        if (sourceNodeRef.current) {
            sourceNodeRef.current.stop();
        }

        try {
            const audioData = decode(base64Audio);
            const audioBuffer = await decodeAudioData(audioData, audioContext, sampleRate, 1);
            
            const sourceNode = audioContext.createBufferSource();
            sourceNode.buffer = audioBuffer;
            sourceNode.connect(audioContext.destination);
            
            sourceNode.onended = () => {
                setIsPlaying(false);
                sourceNodeRef.current = null;
            };

            sourceNode.start();
            sourceNodeRef.current = sourceNode;
            setIsPlaying(true);
        } catch (error) {
            console.error('Failed to decode or play audio:', error);
            setIsPlaying(false);
        }
    }, [sampleRate]);

    const stopAudio = useCallback(() => {
        if (sourceNodeRef.current) {
            sourceNodeRef.current.stop();
            setIsPlaying(false);
            sourceNodeRef.current = null;
        }
    }, []);

    return { playAudio, stopAudio, isPlaying };
};
