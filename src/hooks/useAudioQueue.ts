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
      console.log('Starting playback:', {
        index: currentIndex,
        verseNumber: verses[currentIndex].number,
        language: recitationLanguage,
        audioSrc: verses[currentIndex].audio
      });
      
      if (onVerseChange) {
        onVerseChange(verses[currentIndex].number);
      }

      if (recitationLanguage === "ar.alafasy") {
        if (!verses[currentIndex].audio) {
          console.error('No audio URL available');
          return;
        }
        
        audioRef.current.src = verses[currentIndex].audio;
        audioRef.current.load();
        await audioRef.current.play();
        console.log('Audio started playing');
      } else {
        await new Promise<void>((resolve) => {
          speak(
            verses[currentIndex].translation,
            () => {
              console.log('TTS completed');
              resolve();
            },
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
    console.log('Completing verse:', {
      currentIndex,
      totalVerses: verses.length,
      nextIndex: currentIndex + 1
    });
    
    if (currentIndex < verses.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      console.log('Reached end of surah');
      setIsPlaying(false);
      setCurrentIndex(0);
      if (onVerseChange) {
        onVerseChange(verses[0].number);
      }
    }
  };

  useEffect(() => {
    if (isPlaying) {
      console.log('Effect triggered - playing verse:', currentIndex);
      playCurrentVerse();
    }
  }, [currentIndex, isPlaying]);

  useEffect(() => {
    const audio = audioRef.current;
    
    const handleEnded = () => {
      console.log('Audio ended naturally');
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
    console.log('Toggling playback:', !isPlaying);
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
    if (onVerseChange) {
      onVerseChange(verses[0].number);
    }
  };

  return {
    isPlaying,
    isLoading,
    currentIndex,
    togglePlay,
    reset
  };
};