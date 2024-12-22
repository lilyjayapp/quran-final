import { useEffect } from 'react';
import { getAudioUrl } from '@/utils/audioUtils';
import { speak, stopSpeaking } from '@/utils/ttsUtils';
import { toast } from 'sonner';
import { useAudioElement } from './useAudioElement';
import { useAudioPlaybackState } from './useAudioPlaybackState';

interface UseVersePlaybackProps {
  verses: {
    number: number;
    audio: string;
    translation: string;
  }[];
  recitationLanguage: string;
  selectedReciter: string;
  onVerseChange?: (verseNumber: number) => void;
}

export const useVersePlayback = ({
  verses,
  recitationLanguage,
  selectedReciter,
  onVerseChange
}: UseVersePlaybackProps) => {
  const {
    isPlaying,
    setIsPlaying,
    isLoading,
    setIsLoading,
    currentIndex,
    setCurrentIndex,
    reset: resetState
  } = useAudioPlaybackState();

  const { audioRef, createNewAudio, cleanup } = useAudioElement({
    onEnded: () => {
      if (currentIndex < verses.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else {
        setIsPlaying(false);
        setCurrentIndex(0);
      }
    },
    onCanPlay: () => setIsLoading(false)
  });

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
        
        const audio = createNewAudio(audioUrl);
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
    
    return cleanup;
  }, [currentIndex, isPlaying, recitationLanguage, selectedReciter]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const reset = () => {
    resetState();
    cleanup();
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