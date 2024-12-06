import { useNavigate } from 'react-router-dom';

interface AudioNavigationProps {
  currentSurahNumber: number;
  resetAudio: () => void;
}

const AudioNavigation = ({ currentSurahNumber, resetAudio }: AudioNavigationProps) => {
  const navigate = useNavigate();

  const navigateToSurah = (direction: "next" | "previous") => {
    const nextSurahNumber = direction === "next" 
      ? currentSurahNumber + 1 
      : currentSurahNumber - 1;

    if (nextSurahNumber < 1 || nextSurahNumber > 114) return;

    resetAudio();
    navigate(`/surah/${nextSurahNumber}`);
  };

  return { navigateToSurah };
};

export default AudioNavigation;