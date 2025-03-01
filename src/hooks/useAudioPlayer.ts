import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";

interface UseAudioPlayerProps {
  verses: {
    number: number;
    audio: string;
    translation: string;
  }[];
  onVerseChange?: (verseNumber: number) => void;
  onError?: () => void;
}

export const useAudioPlayer = ({ verses, onVerseChange, onError }: UseAudioPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentVerseIndex, setCurrentVerseIndex] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleAudioError = (error: any) => {
    console.error("Audio Error:", error);
    setIsLoading(false);
    setIsPlaying(false);

    if (audioRef.current) {
      console.log("Current audio URL:", audioRef.current.src);
      console.log("Audio ready state:", audioRef.current.readyState);
      console.log("Network state:", audioRef.current.networkState);
    }

    let errorMessage = "Failed to load audio. Please try a different reciter or check your connection.";
    
    if (error instanceof Error) {
      if (error.name === "NotSupportedError") {
        errorMessage = "This audio format is not supported by your browser.";
      } else if (error.name === "NotAllowedError") {
        errorMessage = "Autoplay is not allowed. Please click play to start the audio.";
      }
    }

    toast.error(errorMessage);
    if (onError) onError();
  };

  const retryPlayback = async () => {
    if (!audioRef.current) return;
    
    try {
      setIsLoading(true);
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
        await audioRef.current.load();
        await audioRef.current.play();
        setIsPlaying(true);
      } else {
        audioRef.current.pause();
        setIsPlaying(false);
      }
      
      if (onVerseChange) {
        onVerseChange(verses[currentVerseIndex].number);
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
      setCurrentVerseIndex(0);
      if (onVerseChange) {
        onVerseChange(verses[0].number);
      }
    }
  };

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

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleCanPlay = () => {
      setIsLoading(false);
      if (isPlaying) {
        audio.play().catch(handleAudioError);
      }
    };

    const handleLoadStart = () => setIsLoading(true);
    const handleEnded = () => {
      setIsPlaying(false);
      playNextVerse();
    };

    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', (e) => handleAudioError(e.error));

    return () => {
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', (e) => handleAudioError(e.error));
    };
  }, [isPlaying, verses, currentVerseIndex]);

  return {
    isPlaying,
    isLoading,
    currentVerseIndex,
    audioRef,
    togglePlay,
    resetAudio,
    playNextVerse,
    retryPlayback,
    setIsPlaying
  };
};