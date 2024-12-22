import { useState, useRef, useEffect } from 'react';
import { getAudioUrl } from '@/utils/audioUtils';
import { speak, stopSpeaking } from '@/utils/ttsUtils';
import { toast } from 'sonner';

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
  const audioRef = useRef<HTMLAudioElement | null>(null);

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
        
        // Create a new audio element for each verse
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.removeAttribute('src');
          audioRef.current.load();
        }
        
        const audio = new Audio(audioUrl);
        audioRef.current = audio;
        
        // Set up event listeners
        audio.onended = () => {
          if (currentIndex < verses.length - 1) {
            setCurrentIndex(prev => prev + 1);
          } else {
            setIsPlaying(false);
            setCurrentIndex(0);
          }
        };

        audio.oncanplay = () => {
          setIsLoading(false);
        };

        audio.onerror = (e) => {
          console.error('Audio loading error:', e);
          toast.error('Error loading audio. Please try again.');
          setIsLoading(false);
          setIsPlaying(false);
        };

        // Start playing
        await audio.play();
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
      toast.error('Error playing audio. Please try again.');
      setIsLoading(false);
      setIsPlaying(false);
    }
  };

  useEffect(() => {
    if (isPlaying) {
      playCurrentVerse();
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if (!recitationLanguage.startsWith("ar.")) {
        stopSpeaking();
      }
    }
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.removeAttribute('src');
        audioRef.current.load();
      }
      stopSpeaking();
    };
  }, [currentIndex, isPlaying, recitationLanguage, selectedReciter]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const reset = () => {
    setCurrentIndex(0);
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.removeAttribute('src');
      audioRef.current.load();
    }
    stopSpeaking();
    if (onVerseChange) {
      onVerseChange(verses[0].number);
    }
  };

  const repeatCurrentVerse = () => {
    if (recitationLanguage.startsWith("ar.")) {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
      }
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