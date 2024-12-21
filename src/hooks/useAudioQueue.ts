import { useState, useRef, useEffect } from 'react';
import { toast } from "sonner";
import { getAudioUrl } from '@/utils/audioUtils';
import { speak, stopSpeaking } from '@/utils/ttsUtils';

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
  const [repeatClickCount, setRepeatClickCount] = useState(0);
  const repeatClickTimeout = useRef<NodeJS.Timeout>();

  const playCurrentVerse = async () => {
    if (!verses[currentIndex]) return;

    try {
      setIsLoading(true);
      
      if (onVerseChange) {
        onVerseChange(verses[currentIndex].number);
      }

      if (recitationLanguage === "ar.alafasy") {
        const audioUrl = getAudioUrl(verses[currentIndex].number, recitationLanguage);
        console.log('Playing Arabic audio URL:', audioUrl);
        audioRef.current.src = audioUrl;
        await audioRef.current.play();
      } else {
        console.log('Playing English translation:', verses[currentIndex].translation);
        speak(verses[currentIndex].translation, () => {
          if (currentIndex < verses.length - 1 && isPlaying) {
            setCurrentIndex(prev => prev + 1);
          } else {
            setIsPlaying(false);
          }
        });
      }
    } catch (error) {
      console.error('Playback error:', error);
      toast.error("Error playing verse");
      setIsPlaying(false);
    } finally {
      setIsLoading(false);
    }
  };

  const repeatCurrentVerse = async () => {
    // Clear any existing timeout
    if (repeatClickTimeout.current) {
      clearTimeout(repeatClickTimeout.current);
    }

    // Increment click count
    setRepeatClickCount(prev => prev + 1);

    // Set a timeout to reset the click count after 1 second
    repeatClickTimeout.current = setTimeout(() => {
      setRepeatClickCount(0);
    }, 1000);

    // Calculate how many verses to go back based on click count
    const versesToGoBack = Math.min(repeatClickCount, currentIndex);
    const newIndex = currentIndex - versesToGoBack;

    if (newIndex >= 0) {
      setCurrentIndex(newIndex);
      if (recitationLanguage === "ar.alafasy") {
        audioRef.current.currentTime = 0;
        await audioRef.current.play();
      } else {
        stopSpeaking();
        speak(verses[newIndex].translation, () => {
          // After repeating, if we're still playing and not at the end, continue to next verse
          if (isPlaying && newIndex < verses.length - 1) {
            setCurrentIndex(prev => prev + 1);
          }
        });
      }
    }
  };

  useEffect(() => {
    if (isPlaying) {
      playCurrentVerse();
    } else {
      if (recitationLanguage !== "ar.alafasy") {
        stopSpeaking();
      } else {
        audioRef.current.pause();
      }
    }
  }, [currentIndex, isPlaying, recitationLanguage]);

  useEffect(() => {
    const audio = audioRef.current;
    
    const handleEnded = () => {
      if (currentIndex < verses.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else {
        setIsPlaying(false);
        setCurrentIndex(0);
      }
    };

    audio.addEventListener('ended', handleEnded);
    
    return () => {
      audio.removeEventListener('ended', handleEnded);
      audio.pause();
      stopSpeaking();
      setIsPlaying(false);
      if (repeatClickTimeout.current) {
        clearTimeout(repeatClickTimeout.current);
      }
    };
  }, [verses.length]);

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
    if (recitationLanguage === "ar.alafasy") {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    } else {
      stopSpeaking();
    }
    if (onVerseChange) {
      onVerseChange(verses[0].number);
    }
  };

  return {
    isPlaying,
    isLoading,
    currentIndex,
    togglePlay,
    reset,
    setIsPlaying,
    repeatCurrentVerse
  };
};