import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { isMobileDevice, isIOSDevice } from "@/utils/deviceUtils";
import { useAudioError } from "./useAudioError";

interface UseAudioPlaybackProps {
  verses: {
    number: number;
    audio: string;
    translation: string;
  }[];
  onVerseChange?: (verseNumber: number) => void;
  onError?: () => void;
}

export const useAudioPlayback = ({ onError }: UseAudioPlaybackProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const retryCount = useRef(0);

  useAudioError(audioRef, onError);

  const retryPlayback = async () => {
    if (!audioRef.current) return;
    
    try {
      console.log('Retrying playback:', {
        retryCount: retryCount.current,
        isIOS: isIOSDevice(),
        currentSrc: audioRef.current.src
      });

      setIsLoading(true);
      if (isIOSDevice()) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      await audioRef.current.load();
      await audioRef.current.play();
      setIsPlaying(true);
    } catch (error) {
      console.error('Retry playback failed:', error);
      if (onError) onError();
    } finally {
      setIsLoading(false);
    }
  };

  const togglePlay = async () => {
    if (!audioRef.current) return;

    try {
      console.log('Toggle play:', {
        currentState: isPlaying,
        readyState: audioRef.current.readyState,
        isIOS: isIOSDevice()
      });

      if (!isPlaying) {
        setIsLoading(true);
        if (isIOSDevice()) {
          audioRef.current.currentTime = 0;
          await audioRef.current.load();
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        await audioRef.current.play();
        setIsPlaying(true);
      } else {
        audioRef.current.pause();
        setIsPlaying(false);
      }
    } catch (error) {
      console.error('Toggle play failed:', error);
      if (onError) onError();
    } finally {
      setIsLoading(false);
    }
  };

  const resetAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
      retryCount.current = 0;
    }
  };

  return {
    isPlaying,
    isLoading,
    audioRef,
    togglePlay,
    resetAudio,
    retryPlayback,
    setIsPlaying
  };
};