import { useState, useRef, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";

interface UseAudioPlayerProps {
  verses: {
    number: number;
    audio: string;
    translation: string;
  }[];
  onVerseChange?: (verseNumber: number) => void;
}

export const useAudioPlayer = ({ verses, onVerseChange }: UseAudioPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentVerseIndex, setCurrentVerseIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const { toast } = useToast();

  const playNextVerse = () => {
    if (currentVerseIndex < verses.length - 1) {
      const nextIndex = currentVerseIndex + 1;
      setCurrentVerseIndex(nextIndex);
      if (onVerseChange) {
        onVerseChange(verses[nextIndex].number);
      }
    } else {
      setIsPlaying(false);
      setCurrentVerseIndex(0);
      if (onVerseChange) {
        onVerseChange(verses[0].number);
      }
    }
  };

  const handleAudioError = () => {
    setIsLoading(false);
    setIsPlaying(false);
    toast({
      title: "Audio Error",
      description: "Failed to load audio. Please try again.",
      variant: "destructive",
    });
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleCanPlay = () => {
      setIsLoading(false);
      if (isPlaying) {
        audio.play().catch((error) => {
          console.error("Audio playback error:", error);
          handleAudioError();
        });
      }
    };

    const handleLoadStart = () => {
      setIsLoading(true);
    };

    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('error', handleAudioError);

    return () => {
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('error', handleAudioError);
    };
  }, [isPlaying, toast]);

  const togglePlay = async () => {
    if (!audioRef.current) return;

    try {
      if (!isPlaying) {
        setIsLoading(true);
        await audioRef.current.load();
      } else {
        audioRef.current.pause();
        setIsPlaying(false);
      }
      setIsPlaying(!isPlaying);
      if (onVerseChange) {
        onVerseChange(verses[currentVerseIndex].number);
      }
    } catch (error) {
      console.error("Toggle play error:", error);
      handleAudioError();
    }
  };

  const resetAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
      setCurrentVerseIndex(0);
      if (onVerseChange) {
        onVerseChange(verses[0].number);
      }
    }
  };

  return {
    isPlaying,
    isLoading,
    currentVerseIndex,
    audioRef,
    togglePlay,
    resetAudio,
    playNextVerse,
    setCurrentVerseIndex,
  };
};