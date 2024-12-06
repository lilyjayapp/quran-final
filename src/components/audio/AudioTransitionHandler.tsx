import React, { useEffect } from 'react';
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

    setIsPlaying(true);
    
    if (recitationLanguage === "ar.alafasy" && audioRef.current) {
      try {
        if (isMobileDevice()) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        await audioRef.current.play();
        console.log("Started playing next verse audio");
      } catch (error) {
        console.error("Error playing next verse:", error);
        if (error instanceof Error && 
            error.name !== "NotAllowedError" && 
            !isMobileDevice()) {
          toast.error("Error playing audio");
        }
        setIsPlaying(false);
      }
    } else if (recitationLanguage !== "ar.alafasy") {
      try {
        await playTranslations();
        console.log("Started playing next translation");
      } catch (error) {
        console.error("Error playing next translation:", error);
        setIsPlaying(false);
      }
    }
  };

  useEffect(() => {
    if (isPlaying) {
      handleNextVerse();
    }
  }, [currentVerseIndex, isPlaying]);

  return null;
};

export default AudioTransitionHandler;