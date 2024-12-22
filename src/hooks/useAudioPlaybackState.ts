import { useState } from 'react';

export const useAudioPlaybackState = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const reset = () => {
    setCurrentIndex(0);
    setIsPlaying(false);
  };

  return {
    isPlaying,
    setIsPlaying,
    isLoading,
    setIsLoading,
    currentIndex,
    setCurrentIndex,
    reset
  };
};