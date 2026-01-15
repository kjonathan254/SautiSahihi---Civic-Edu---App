import { useState, useCallback } from 'react';
import { AppLanguage } from './types.ts';
import { hapticTap, hapticSuccess, hapticWarning } from './utils.ts';

/**
 * Custom hook for accessible Speech-to-Text in a Kenyan context.
 * Supports English (KE) and Kiswahili (KE).
 */
export function useSpeechToText(lang: AppLanguage, onResult: (transcript: string) => void) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported] = useState(() => {
    return !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
  });

  const startListening = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      console.warn("Speech recognition not supported in this browser.");
      hapticWarning();
      return;
    }

    const recognition = new SpeechRecognition();
    
    // Set locale based on app language
    // Kenyan specific locales ensure better recognition for local accents
    recognition.lang = lang === 'ENG' ? 'en-KE' : 'sw-KE';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
      hapticTap();
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      if (transcript) {
        onResult(transcript);
        hapticSuccess();
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      hapticWarning();
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    try {
      recognition.start();
    } catch (e) {
      console.error("Failed to start recognition:", e);
      setIsListening(false);
    }
  }, [lang, onResult]);

  return {
    isListening,
    isSupported,
    startListening
  };
}