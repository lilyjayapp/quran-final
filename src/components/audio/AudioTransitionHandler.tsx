import React from 'react';
import { isMobileDevice } from "@/utils/deviceUtils";
import { toast } from "sonner";

interface AudioTransitionHandlerProps {
  audioRef: React.RefObject<HTMLAudioElement>;
  recitationLanguage: string;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  playTranslations: () => Promise<void>;
  currentVerseIndex: number;
  verses: { number: number; translation: string; }[];
}

const AudioTransitionHandler = ({
  audioRef,
  recitationLanguage,
  isPlaying,
  setIsPlaying,
  playTranslations,
  currentVerseIndex,
  verses
}: AudioTransitionHandlerProps) => {
  const handleNextVerse = async () => {
    console.log("Playing next verse:", {
      currentVerseIndex,
      recitationLanguage,
      isPlaying,
      totalVerses: verses.length
    });
    
    if (!isPlaying) {
      console.log("Playback stopped, not continuing to next verse");
      return;
    }

    if (currentVerseIndex >= verses.length) {
      console.log("Reached end of verses");
      setIsPlaying(false);
      return;
    }

    try {
      if (recitationLanguage === "ar.alafasy" && audioRef.current) {
        if (isMobileDevice()) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        await audioRef.current.play();
      } else if (recitationLanguage !== "ar.alafasy") {
        console.log("Starting translation playback");
        // Set isPlaying to true before starting playback
        setIsPlaying(true);
        await playTranslations().catch(error => {
          console.error("Translation playback failed:", error);
          throw error;
        });
      }
    } catch (error) {
      console.error("Error playing next verse/translation:", error);
      if (!isMobileDevice()) {
        toast.error("Error playing audio/translation");
      }
      setIsPlaying(false);
    }
  };

  React.useEffect(() => {
    let isMounted = true;

    const playNextVerseIfMounted = async () => {
      if (isMounted && isPlaying) {
        console.log("AudioTransitionHandler effect triggered:", {
          isPlaying,
          currentVerseIndex
        });
        await handleNextVerse();
      }
    };

    playNextVerseIfMounted();

    return () => {
      isMounted = false;
    };
  }, [currentVerseIndex, isPlaying]);

  return null;
};

export default AudioTransitionHandler;