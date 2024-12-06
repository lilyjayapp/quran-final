import { speak, stopSpeaking } from "@/utils/ttsUtils";
import { toast } from "sonner";

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
  currentVerseIndex,
  onVerseChange,
  setIsPlaying,
  language,
}: UseTextToSpeechProps) => {
  const playTranslations = async () => {
    console.log("Starting translations playback:", {
      currentVerseIndex,
      totalVerses: verses.length,
      language
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
      return new Promise<void>((resolve) => {
        if (onVerseChange) {
          onVerseChange(currentVerse.number);
        }

        speak(currentVerse.translation, () => {
          console.log("Finished speaking verse:", currentVerse.number);
          if (currentVerseIndex < verses.length - 1) {
            setIsPlaying(true);
            if (onVerseChange) {
              onVerseChange(verses[currentVerseIndex + 1].number);
            }
            resolve();
          } else {
            setIsPlaying(false);
            resolve();
          }
        }, language);
      });
    } catch (error) {
      console.error("Text-to-speech error:", error);
      toast.error("Error playing translation. Please try a different language.");
      setIsPlaying(false);
      throw error;
    }
  };

  return {
    playTranslations,
    stopTranslations: stopSpeaking
  };
};