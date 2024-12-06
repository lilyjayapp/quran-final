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
    
    const translations = verses.map(verse => verse.translation);
    let currentIndex = currentVerseIndex;

    const speakNextVerse = () => {
      console.log("Speaking verse:", currentIndex, "in language:", language);
      if (!isPlaying) {
        console.log("Playback stopped");
        return;
      }
      
      if (currentIndex < translations.length) {
        if (onVerseChange) {
          onVerseChange(verses[currentIndex].number);
        }
        
        speak(translations[currentIndex], () => {
          currentIndex++;
          if (currentIndex < translations.length && isPlaying) {
            speakNextVerse();
          } else if (currentIndex >= translations.length) {
            console.log("Reached end of translations");
            setIsPlaying(false);
            currentIndex = 0;
            if (onVerseChange) {
              onVerseChange(verses[0].number);
            }
          }
        }, language);
      }
    };

    try {
      speakNextVerse();
    } catch (error) {
      console.error("Text-to-speech error:", error);
      toast.error("Error playing translation. Please try a different language.");
      setIsPlaying(false);
    }
  };

  return {
    playTranslations,
    stopTranslations: stopSpeaking
  };
};