import { useVersePlayback } from './useVersePlayback';

interface UseAudioQueueProps {
  verses: {
    number: number;
    audio: string;
    translation: string;
  }[];
  recitationLanguage: string;
  selectedReciter: string;
  onVerseChange?: (verseNumber: number) => void;
}

export const useAudioQueue = ({
  verses,
  recitationLanguage,
  selectedReciter,
  onVerseChange
}: UseAudioQueueProps) => {
  return useVersePlayback({
    verses,
    recitationLanguage,
    selectedReciter,
    onVerseChange
  });
};