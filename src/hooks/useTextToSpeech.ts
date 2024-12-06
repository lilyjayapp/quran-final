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
    console.log("Starting playTranslations:", {
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
        console.log("Setting up TTS for verse:", currentVerse.number);
        
        if (onVerseChange) {
          console.log("Triggering verse change to:", currentVerse.number);
          onVerseChange(currentVerse.number);
        }

        speak(currentVerse.translation, () => {
          console.log("Speech ended for verse:", currentVerse.number);
          console.log("Current verse index:", currentVerseIndex);
          console.log("Total verses:", verses.length);
          
          if (currentVerseIndex < verses.length - 1) {
            console.log("Moving to next verse");
            if (onVerseChange) {
              const nextVerseNumber = verses[currentVerseIndex + 1].number;
              console.log("Triggering verse change to:", nextVerseNumber);
              onVerseChange(nextVerseNumber);
            }
          } else {
            console.log("Reached end of verses");
            setIsPlaying(false);
          }
          resolve();
        }, language);
      });
    } catch (error) {
      console.error("Text-to-speech error:", error);
      toast.error("Error playing translation");
      setIsPlaying(false);
      throw error;
    }
  };

  const stopTranslations = () => {
    console.log("Stopping translations");
    stopSpeaking();
  };

  return {
    playTranslations,
    stopTranslations
  };
};