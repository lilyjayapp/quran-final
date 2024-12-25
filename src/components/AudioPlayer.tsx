import React from "react";
import { useNavigate } from "react-router-dom";
import { useAudioQueue } from "@/hooks/useAudioQueue";
import { useAudioState } from "@/hooks/useAudioState";
import { speak, stopSpeaking } from "@/utils/ttsUtils";
import { useIsMobile } from "@/hooks/use-mobile";
import AudioContainer from "./audio/AudioContainer";
import AudioControls from "./AudioControls";
import AudioSelectors from "./audio/AudioSelectors";
import AudioTranslationDisplay from "./audio/AudioTranslationDisplay";

interface AudioPlayerProps {
  verses: {
    number: number;
    audio: string;
    translation: string;
  }[];
  currentSurahNumber: number;
  onVerseChange?: (verseNumber: number) => void;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({
  verses,
  currentSurahNumber,
  onVerseChange,
}) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  const {
    recitationLanguage,
    selectedReciter,
    setSelectedReciter,
    handleLanguageChange,
  } = useAudioState();

  const scrollToVerse = (verseNumber: number) => {
    // Only scroll if we're playing
    if (!isPlaying) return;
    
    const verseElement = document.querySelector(`[data-verse="${verseNumber}"]`);
    if (verseElement) {
      // Get the header height
      const headerElement = document.querySelector('.fixed');
      const headerHeight = headerElement ? headerElement.getBoundingClientRect().height : 200;
      
      // Calculate the scroll position
      const elementRect = verseElement.getBoundingClientRect();
      const absoluteElementTop = elementRect.top + window.pageYOffset;
      const middle = window.innerHeight / 2;
      
      // Add padding below header for mobile devices
      const mobilePadding = isMobile ? headerHeight + 100 : 0;
      const scrollTo = absoluteElementTop - headerHeight + (isMobile ? mobilePadding : -middle + (elementRect.height / 2));
      
      requestAnimationFrame(() => {
        window.scrollTo({
          top: Math.max(0, scrollTo),
          behavior: 'smooth'
        });
      });
    }
  };

  const {
    isPlaying,
    isLoading,
    currentIndex,
    togglePlay,
    reset,
    setIsPlaying,
    repeatCurrentVerse
  } = useAudioQueue({
    verses,
    recitationLanguage,
    selectedReciter,
    onVerseChange: (verseNumber) => {
      if (onVerseChange) {
        onVerseChange(verseNumber);
        scrollToVerse(verseNumber);
      }
    },
  });

  const handleLanguageSelect = (value: string) => {
    stopSpeaking();
    setIsPlaying(false);
    
    handleLanguageChange(value, {
      audioRef: { current: null },
      resetVerse: reset,
      setIsPlaying,
      resetAudio: reset
    });

    if (value !== "ar.alafasy") {
      const playTranslation = () => {
        if (verses[currentIndex]) {
          speak(verses[currentIndex].translation, () => {
            if (currentIndex < verses.length - 1 && isPlaying) {
              setIsPlaying(true);
            } else {
              setIsPlaying(false);
            }
          });
        }
      };

      if (isPlaying) {
        playTranslation();
      }
    }
  };

  const disablePrevious = currentSurahNumber <= 1;
  const disableNext = currentSurahNumber >= 114;

  const handlePrevious = () => {
    if (!disablePrevious) {
      stopSpeaking();
      navigate(`/surah/${currentSurahNumber - 1}`);
    }
  };

  const handleNext = () => {
    if (!disableNext) {
      stopSpeaking();
      navigate(`/surah/${currentSurahNumber + 1}`);
    }
  };

  return (
    <AudioContainer>
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full">
        <AudioControls
          isPlaying={isPlaying}
          isLoading={isLoading}
          onPlayPause={togglePlay}
          onReset={reset}
          onPrevious={handlePrevious}
          onNext={handleNext}
          onRepeatVerse={repeatCurrentVerse}
          disablePrevious={disablePrevious}
          disableNext={disableNext}
        />
        <AudioSelectors
          recitationLanguage={recitationLanguage}
          selectedReciter={selectedReciter}
          onLanguageChange={handleLanguageSelect}
          onReciterChange={(value) => {
            setSelectedReciter(value);
            localStorage.setItem("selectedReciter", value);
            reset();
          }}
          isLoading={isLoading}
        />
      </div>
      <AudioTranslationDisplay 
        translation={verses[currentIndex]?.translation} 
      />
    </AudioContainer>
  );
};

export default AudioPlayer;
