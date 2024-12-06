import React from 'react';
import { useNavigate } from "react-router-dom";
import { stopSpeaking } from "@/utils/ttsUtils";

interface AudioNavigationProps {
  currentSurahNumber: number;
  resetAudio: () => void;
}

const AudioNavigation: React.FC<AudioNavigationProps> = ({
  currentSurahNumber,
  resetAudio,
}) => {
  const navigate = useNavigate();

  const navigateToSurah = (direction: "next" | "previous") => {
    const nextSurahNumber =
      direction === "next" ? currentSurahNumber + 1 : currentSurahNumber - 1;

    if (nextSurahNumber >= 1 && nextSurahNumber <= 114) {
      resetAudio();
      stopSpeaking();
      navigate(`/surah/${nextSurahNumber}`);
    }
  };

  return {
    navigateToSurah,
  };
};

export default AudioNavigation;