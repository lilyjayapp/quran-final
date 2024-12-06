import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { isMobileDevice, isIOSDevice, isAndroidDevice } from "@/utils/deviceUtils";

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

  const handleAudioError = (error: any) => {
    console.error("Audio Error:", error);
    setIsLoading(false);
    
    // Don't show error toast for user interaction errors on mobile
    if (error instanceof Error && error.name === "NotAllowedError" && isMobileDevice()) {
      console.log("Suppressing user interaction error on mobile");
      return;
    }

    // For iOS devices, retry playback a few times before showing error
    if (isIOSDevice() && retryCount.current < 3) {
      retryCount.current++;
      console.log(`Retrying playback on iOS (attempt ${retryCount.current})`);
      setTimeout(() => retryPlayback(), 500);
      return;
    }

    // Reset retry count
    retryCount.current = 0;
    
    // Only show error toast if we're not on Android (to reduce noise)
    if (!isAndroidDevice()) {
      toast.error("Audio playback error", {
        description: "Please try again or select a different reciter.",
      });
    }
    
    if (onError) onError();
  };

  const retryPlayback = async () => {
    if (!audioRef.current) return;
    
    try {
      setIsLoading(true);
      if (isIOSDevice()) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      await audioRef.current.load();
      await audioRef.current.play();
      setIsPlaying(true);
    } catch (error) {
      handleAudioError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const togglePlay = async () => {
    if (!audioRef.current) return;

    try {
      if (!isPlaying) {
        setIsLoading(true);
        if (isIOSDevice()) {
          // For iOS, we need to reset and reload the audio
          audioRef.current.currentTime = 0;
          await audioRef.current.load();
          // Small delay to ensure audio is loaded
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        await audioRef.current.play();
        setIsPlaying(true);
      } else {
        audioRef.current.pause();
        setIsPlaying(false);
      }
    } catch (error) {
      handleAudioError(error);
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

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleCanPlay = () => {
      console.log("Audio can play");
      setIsLoading(false);
      if (isPlaying) {
        audio.play().catch(handleAudioError);
      }
    };

    const handleLoadStart = () => {
      console.log("Audio loading started");
      setIsLoading(true);
    };

    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('error', (e) => handleAudioError(e));

    return () => {
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('error', (e) => handleAudioError(e));
    };
  }, [isPlaying]);

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