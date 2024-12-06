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
  language: string;
}

export const useTextToSpeech = ({
  verses,
  isPlaying,
  currentVerseIndex,
  onVerseChange,
  setIsPlaying,
  language,
}: UseTextToSpeechProps) => {
  const playTranslations = async () => {
    console.log("Starting text-to-speech playback:", {
      currentVerseIndex,
      totalVerses: verses.length,
      language,
      isPlaying
    });

    if (!verses || verses.length === 0) {
      console.error("No verses available for playback");
      return;
    }
    
    const currentVerse = verses[currentVerseIndex];
    if (!currentVerse) {
      console.error("No verse found at index:", currentVerseIndex);
      return;
    }

    try {
      if (onVerseChange) {
        onVerseChange(currentVerse.number);
      }
      
      return new Promise<void>((resolve) => {
        speak(currentVerse.translation, () => {
          console.log("Finished speaking verse:", currentVerse.number);
          if (currentVerseIndex < verses.length - 1) {
            setIsPlaying(true);
          }
          resolve();
        }, language);
      });
    } catch (error) {
      console.error("Text-to-speech error:", error);
      setIsPlaying(false);
      throw error;
    }
  };

  return {
    playTranslations,
    stopTranslations: stopSpeaking
  };
};