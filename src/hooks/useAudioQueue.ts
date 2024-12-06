import { useState, useRef, useEffect } from 'react';
import { speak, stopSpeaking } from "@/utils/ttsUtils";
import { toast } from "sonner";

interface QueuedVerse {
  number: number;
  audio?: string;
  translation: string;
}

export const useAudioQueue = ({
  verses,
  recitationLanguage,
  onVerseChange,
}: {
  verses: QueuedVerse[];
  recitationLanguage: string;
  onVerseChange?: (verseNumber: number) => void;
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(new Audio());

  const playCurrentVerse = async () => {
    if (!verses[currentIndex]) return;

    try {
      setIsLoading(true);
      
      if (onVerseChange) {
        onVerseChange(verses[currentIndex].number);
      }

      if (recitationLanguage === "ar.alafasy") {
        audioRef.current.src = verses[currentIndex].audio || '';
        await audioRef.current.play();
      } else {
        await new Promise<void>((resolve) => {
          speak(
            verses[currentIndex].translation,
            () => resolve(),
            recitationLanguage
          );
        });
        handleVerseComplete();
      }
    } catch (error) {
      console.error('Playback error:', error);
      toast.error("Error playing verse");
      setIsPlaying(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerseComplete = () => {
    if (currentIndex < verses.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setIsPlaying(false);
      setCurrentIndex(0);
    }
  };

  useEffect(() => {
    if (isPlaying) {
      playCurrentVerse();
    }
  }, [currentIndex, isPlaying]);

  useEffect(() => {
    const audio = audioRef.current;
    
    const handleEnded = () => {
      handleVerseComplete();
    };

    audio.addEventListener('ended', handleEnded);
    
    return () => {
      audio.removeEventListener('ended', handleEnded);
      stopSpeaking();
      audio.pause();
      setIsPlaying(false);
    };
  }, []);

  const togglePlay = () => {
    if (!isPlaying) {
      setIsPlaying(true);
    } else {
      setIsPlaying(false);
      if (recitationLanguage === "ar.alafasy") {
        audioRef.current.pause();
      } else {
        stopSpeaking();
      }
    }
  };

  const reset = () => {
    setCurrentIndex(0);
    setIsPlaying(false);
    stopSpeaking();
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
  };

  return {
    isPlaying,
    isLoading,
    currentIndex,
    togglePlay,
    reset
  };
};