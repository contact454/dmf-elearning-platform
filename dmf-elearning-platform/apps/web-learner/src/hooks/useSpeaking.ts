'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface UseSpeakingOptions {
  lang?: string;
  rate?: number;
  pitch?: number;
}

interface UseSpeakingReturn {
  speak: (text: string) => void;
  stop: () => void;
  isSpeaking: boolean;
  isSupported: boolean;
  voices: SpeechSynthesisVoice[];
}

/**
 * Custom hook for Text-to-Speech using Web Speech API
 * Optimized for German pronunciation with preferred voices
 */
export function useSpeaking(options: UseSpeakingOptions = {}): UseSpeakingReturn {
  const { lang = 'de-DE', rate = 0.85, pitch = 1 } = options;

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [isSupported, setIsSupported] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Check browser support and load voices
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setIsSupported(false);
      return;
    }

    setIsSupported(true);

    const loadVoices = () => {
      const availableVoices = speechSynthesis.getVoices();
      setVoices(availableVoices);
    };

    // Load voices immediately if available
    loadVoices();

    // Chrome loads voices asynchronously
    speechSynthesis.addEventListener('voiceschanged', loadVoices);

    return () => {
      speechSynthesis.removeEventListener('voiceschanged', loadVoices);
    };
  }, []);

  // Find the best German voice
  const getBestVoice = useCallback((): SpeechSynthesisVoice | null => {
    if (voices.length === 0) return null;

    // Priority list of preferred German voices
    const preferredVoices = [
      'Google Deutsch',
      'Anna',           // Apple German
      'Helena',         // Microsoft German
      'Petra',          // Apple German
      'Markus',         // Apple German
      'Microsoft Stefan',
      'Microsoft Katja',
    ];

    // Try to find a preferred voice
    for (const preferred of preferredVoices) {
      const found = voices.find(
        v => v.name.includes(preferred) && v.lang.startsWith('de')
      );
      if (found) return found;
    }

    // Fall back to any German voice
    const germanVoice = voices.find(v => v.lang.startsWith('de'));
    if (germanVoice) return germanVoice;

    // Last resort: first available voice
    return voices[0] || null;
  }, [voices]);

  const speak = useCallback((text: string) => {
    if (!isSupported || !text) return;

    // Stop any ongoing speech
    speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = rate;
    utterance.pitch = pitch;

    // Set the best available voice
    const voice = getBestVoice();
    if (voice) {
      utterance.voice = voice;
    }

    // Event handlers
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    utterance.onpause = () => setIsSpeaking(false);
    utterance.onresume = () => setIsSpeaking(true);

    utteranceRef.current = utterance;
    speechSynthesis.speak(utterance);
  }, [isSupported, lang, rate, pitch, getBestVoice]);

  const stop = useCallback(() => {
    if (!isSupported) return;
    speechSynthesis.cancel();
    setIsSpeaking(false);
  }, [isSupported]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isSupported) {
        speechSynthesis.cancel();
      }
    };
  }, [isSupported]);

  return {
    speak,
    stop,
    isSpeaking,
    isSupported,
    voices,
  };
}

export default useSpeaking;
