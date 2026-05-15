import { useRef, useState, useEffect } from 'react';
import { fetchTTSBase64, bufferFromBase64, getAudioCtx, fetchTTSBuffer } from './geminiService.ts';
import { AppLanguage } from './types.ts';

export function useAudioPreloader(text: string | null, language: AppLanguage) {
  const audioBufferRef = useRef<AudioBuffer | null>(null);
  const [isPreloading, setIsPreloading] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);

  // Pre-generate audio as soon as text is available
  useEffect(() => {
    if (!text || text.trim().length === 0) {
      setIsReady(false);
      audioBufferRef.current = null;
      return;
    }

    // Check sessionStorage cache first
    const cacheKey = `sauti_audio_${btoa(unescape(encodeURIComponent(text.slice(0, 100))))}_${language}`;
    const cached = sessionStorage.getItem(cacheKey);

    if (cached) {
      // Already have it — decode from cache instantly
      bufferFromBase64(cached).then((buffer) => {
        if (buffer) {
          audioBufferRef.current = buffer;
          setIsReady(true);
        }
      });
      return;
    }

    // Not cached — pre-fetch from Gemini in background
    setIsPreloading(true);
    setIsReady(false);
    fetchTTSBase64(text, language).then((b64) => {
      if (b64) {
        sessionStorage.setItem(cacheKey, b64); // cache raw base64
        bufferFromBase64(b64).then((buffer) => {
          if (buffer) {
            audioBufferRef.current = buffer;
            setIsReady(true);
          }
        });
      }
    }).finally(() => {
      setIsPreloading(false);
    });
  }, [text, language]);

  const play = async () => {
    const ctx = getAudioCtx();
    
    if (isPlaying) {
      // Stop if already playing
      try {
        sourceRef.current?.stop();
      } catch (e) {
        // Source might have already stopped
      }
      setIsPlaying(false);
      return;
    }

    if (audioBufferRef.current) {
      // Audio ready — play instantly
      const src = ctx.createBufferSource();
      src.buffer = audioBufferRef.current;
      src.connect(ctx.destination);
      src.onended = () => setIsPlaying(false);
      sourceRef.current = src;
      setIsPlaying(true);
      src.start(0);
    } else if (text) {
      // Still loading — fetch now (fallback)
      setIsPreloading(true);
      const buffer = await fetchTTSBuffer(text, language);
      setIsPreloading(false);
      if (buffer) {
        audioBufferRef.current = buffer;
        const src = ctx.createBufferSource();
        src.buffer = buffer;
        src.connect(ctx.destination);
        src.onended = () => setIsPlaying(false);
        sourceRef.current = src;
        setIsPlaying(true);
        src.start(0);
      }
    }
  };

  return { play, isReady, isPreloading, isPlaying };
}
