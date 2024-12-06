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

    try {
      if (recitationLanguage === "ar.alafasy" && audioRef.current) {
        if (isMobileDevice()) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        await audioRef.current.play();
        console.log("Started playing next verse audio");
      } else if (recitationLanguage !== "ar.alafasy") {
        console.log("Starting translation playback");
        await playTranslations();
        // Don't set isPlaying to false here, let the next verse trigger naturally
      }
    } catch (error) {
      console.error("Error playing next verse/translation:", error);
      if (!isMobileDevice()) {
        toast.error("Error playing audio/translation");
      }
      setIsPlaying(false);
    }
  };

  useEffect(() => {
    console.log("AudioTransitionHandler effect triggered:", {
      isPlaying,
      currentVerseIndex
    });
    
    if (isPlaying) {
      handleNextVerse();
    }
  }, [currentVerseIndex, isPlaying]);

  return null;
};

export default AudioTransitionHandler;