import { speak, stopSpeaking, isSpeaking } from "@/utils/ttsUtils";

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
    return new Promise<void>((resolve) => {
      console.log("Starting playTranslations:", {
        currentVerseIndex,
        totalVerses: verses.length,
        language,
        currentVerse: verses[currentVerseIndex]?.translation
      });

      if (!verses || verses.length === 0) {
        console.error("No verses available for playback");
        resolve();
        return;
      }

      const currentVerse = verses[currentVerseIndex];
      if (!currentVerse) {
        console.error("No verse found at index:", currentVerseIndex);
        resolve();
        return;
      }

      try {
        console.log("Setting up TTS for verse:", currentVerse.number);
        
        if (onVerseChange) {
          console.log("Triggering verse change to:", currentVerse.number);
          onVerseChange(currentVerse.number);
        }

        // Only resolve after speech has completed
        speak(
          currentVerse.translation, 
          () => {
            console.log("Speech ended for verse:", currentVerse.number);
            resolve();
          }, 
          language
        );
      } catch (error) {
        console.error("Text-to-speech error:", error);
        resolve();
      }
    });
  };

  const stopTranslations = () => {
    console.log("Stopping translations");
    stopSpeaking();
  };

  const isCurrentlyPlaying = () => {
    return isSpeaking();
  };

  return {
    playTranslations,
    stopTranslations,
    isCurrentlyPlaying
  };
};