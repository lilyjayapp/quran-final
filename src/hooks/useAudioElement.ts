import { useRef, useEffect } from 'react';
import { toast } from 'sonner';

interface AudioElementConfig {
  onEnded: () => void;
  onCanPlay: () => void;
}

export const useAudioElement = ({ onEnded, onCanPlay }: AudioElementConfig) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const createNewAudio = (url: string) => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.removeAttribute('src');
      audioRef.current.load();
    }

    const audio = new Audio(url);
    audioRef.current = audio;

    audio.onended = onEnded;
    audio.oncanplay = onCanPlay;
    audio.onerror = (e) => {
      console.error('Audio loading error:', e);
      toast.error('Error loading audio. Please try again.');
    };

    return audio;
  };

  const cleanup = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.removeAttribute('src');
      audioRef.current.load();
    }
  };

  useEffect(() => {
    return cleanup;
  }, []);

  return {
    audioRef,
    createNewAudio,
    cleanup
  };
};