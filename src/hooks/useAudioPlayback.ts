import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";

interface UseAudioPlaybackProps {
  verses: {
    number: number;
    audio: string;
    translation: string;
  }[];
  onVerseChange?: (verseNumber: number) => void;
  onError?: () => void;
}

export const useAudioPlayback = ({ verses, onVerseChange, onError }: UseAudioPlaybackProps) => {
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
    console.log("togglePlay called");
    if (!audioRef.current) {
      console.log("No audio reference");
      return;
    }

    try {
      if (!isPlaying) {
        console.log("Starting playback");
        setIsLoading(true);
        await audioRef.current.load();
        await audioRef.current.play();
        setIsPlaying(true);
      } else {
        console.log("Pausing playback");
        audioRef.current.pause();
        setIsPlaying(false);
      }
      
      if (onVerseChange) {
        onVerseChange(verses[currentVerseIndex].number);
      }
    } catch (error) {
      console.error("Error in togglePlay:", error);
      handleAudioError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetAudio = () => {
    console.log("Resetting audio");
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
    console.log("Playing next verse");
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

    const handleEnded = () => {
      console.log("Audio ended");
      setIsPlaying(false);
      playNextVerse();
    };

    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', (e) => handleAudioError(e));

    return () => {
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', (e) => handleAudioError(e));
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