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
  isPlaying,
  currentVerseIndex,
  onVerseChange,
  setIsPlaying,
  language,
}: UseTextToSpeechProps) => {
  const playTranslations = async () => {
    console.log("Starting text-to-speech playback in language:", language);
    if (!verses || verses.length === 0) return;
    
    const currentVerse = verses[currentVerseIndex];
    if (!currentVerse) {
      console.error("No verse found at index:", currentVerseIndex);
      return;
    }

    console.log("Speaking verse:", currentVerse.number, "in language:", language);
    
    try {
      if (onVerseChange) {
        onVerseChange(currentVerse.number);
      }
      
      await new Promise<void>((resolve, reject) => {
        speak(currentVerse.translation, () => {
          console.log("Finished speaking verse:", currentVerse.number);
          resolve();
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