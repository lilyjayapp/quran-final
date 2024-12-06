import { useState } from "react";

interface UseVerseProgressionProps {
  totalVerses: number;
  onVerseChange?: (verseNumber: number) => void;
}

export const useVerseProgression = ({ totalVerses, onVerseChange }: UseVerseProgressionProps) => {
  const [currentVerseIndex, setCurrentVerseIndex] = useState(0);

  const playNextVerse = () => {
    if (currentVerseIndex < totalVerses - 1) {
      const nextIndex = currentVerseIndex + 1;
      setCurrentVerseIndex(nextIndex);
      if (onVerseChange) {
        onVerseChange(nextIndex + 1);
      }
      return true;
    }
    setCurrentVerseIndex(0);
    if (onVerseChange) {
      onVerseChange(1);
    }
    return false;
  };

  const resetVerse = () => {
    setCurrentVerseIndex(0);
    if (onVerseChange) {
      onVerseChange(1);
    }
  };

  return {
    currentVerseIndex,
    playNextVerse,
    resetVerse,
  };
};