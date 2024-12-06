import { speak, stopSpeaking } from "@/utils/ttsUtils";

interface UseTextToSpeechProps {
  verses: {
    number: number;
    translation: string;
  }[];
  isPlaying: boolean;
  currentVerseIndex: number;
  onVerseChange?: (verseNumber: number) => void;
  setIsPlaying: (playing: boolean) => void;
}

export const useTextToSpeech = ({
  verses,
  isPlaying,
  currentVerseIndex,
  onVerseChange,
  setIsPlaying,
}: UseTextToSpeechProps) => {
  const playTranslations = async () => {
    if (!verses || verses.length === 0) return;
    
    const translations = verses.map(verse => verse.translation);
    let currentIndex = currentVerseIndex;

    const speakNextVerse = () => {
      if (!isPlaying) return;
      
      if (currentIndex < translations.length) {
        if (onVerseChange) {
          onVerseChange(verses[currentIndex].number);
        }
        
        speak(translations[currentIndex], () => {
          currentIndex++;
          if (currentIndex < translations.length && isPlaying) {
            speakNextVerse();
          } else if (currentIndex >= translations.length) {
            setIsPlaying(false);
            currentIndex = 0;
            if (onVerseChange) {
              onVerseChange(verses[0].number);
            }
          }
        });
      }
    };

    speakNextVerse();
  };

  return {
    playTranslations,
    stopTranslations: stopSpeaking
  };
};