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
    if (!isPlaying) {
      return;
    }

    if (currentVerseIndex >= verses.length) {
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
        await playTranslations();
      }
    } catch (error) {
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