import { useState, useRef, useEffect } from 'react';
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
  selectedReciter,
  onVerseChange,
}: {
  verses: QueuedVerse[];
  recitationLanguage: string;
  selectedReciter: string;
  onVerseChange?: (verseNumber: number) => void;
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(new Audio());

  const playCurrentVerse = async () => {
    if (!verses[currentIndex]) return;

    try {
      setIsLoading(true);
      
      if (onVerseChange) {
        onVerseChange(verses[currentIndex].number);
      }

      if (recitationLanguage.startsWith("ar.")) {
        const audioUrl = getAudioUrl(verses[currentIndex].number, selectedReciter);
        console.log('Playing Arabic audio URL:', audioUrl);
        
        // Reset the audio element
        audioRef.current.pause();
        audioRef.current = new Audio(audioUrl);
        
        // Set up event listeners
        audioRef.current.onended = () => {
          if (currentIndex < verses.length - 1) {
            setCurrentIndex(prev => prev + 1);
          } else {
            setIsPlaying(false);
            setCurrentIndex(0);
          }
        };

        audioRef.current.oncanplay = () => {
          setIsLoading(false);
        };

        audioRef.current.onerror = () => {
          console.error('Audio loading error:', audioRef.current.error);
          setIsLoading(false);
          setIsPlaying(false);
        };

        // Start loading and playing
        await audioRef.current.load();
        await audioRef.current.play();
      } else {
        stopSpeaking();
        speak(verses[currentIndex].translation, () => {
          if (currentIndex < verses.length - 1 && isPlaying) {
            setCurrentIndex(prev => prev + 1);
          } else {
            setIsPlaying(false);
            setCurrentIndex(0);
          }
        });
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Playback error:', error);
      setIsLoading(false);
      setIsPlaying(false);
    }
  };

  useEffect(() => {
    if (isPlaying) {
      playCurrentVerse();
    } else {
      if (recitationLanguage.startsWith("ar.")) {
        audioRef.current.pause();
      } else {
        stopSpeaking();
      }
    }
    
    return () => {
      audioRef.current.pause();
      stopSpeaking();
    };
  }, [currentIndex, isPlaying, recitationLanguage]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const reset = () => {
    setCurrentIndex(0);
    setIsPlaying(false);
    audioRef.current.pause();
    stopSpeaking();
    if (onVerseChange) {
      onVerseChange(verses[0].number);
    }
  };

  const repeatCurrentVerse = () => {
    if (recitationLanguage.startsWith("ar.")) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
    } else {
      stopSpeaking();
      speak(verses[currentIndex].translation);
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