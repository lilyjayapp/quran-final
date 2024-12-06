import { useState } from "react";

interface UseVerseProgressionProps {
  totalVerses: number;
  onVerseChange?: (verseNumber: number) => void;
}

export const useVerseProgression = ({ totalVerses, onVerseChange }: UseVerseProgressionProps) => {
  const [currentVerseIndex, setCurrentVerseIndex] = useState(0);

  const playNextVerse = () => {
    console.log("Playing next verse, current index:", currentVerseIndex, "total verses:", totalVerses);
    if (currentVerseIndex < totalVerses - 1) {
      const nextIndex = currentVerseIndex + 1;
      setCurrentVerseIndex(nextIndex);
      if (onVerseChange) {
        onVerseChange(nextIndex + 1); // Adding 1 because verse numbers are 1-based
      }
      return true;
    } else {
      setCurrentVerseIndex(0);
      if (onVerseChange) {
        onVerseChange(1);
      }
      return false;
    }
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