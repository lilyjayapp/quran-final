import React from "react";
import { useNavigate } from "react-router-dom";
import { useAudioQueue } from "@/hooks/useAudioQueue";
import { useAudioState } from "@/hooks/useAudioState";
import { speak, stopSpeaking } from "@/utils/ttsUtils";
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
  
  const {
    recitationLanguage,
    selectedReciter,
    setSelectedReciter,
    handleLanguageChange,
  } = useAudioState();

  const scrollToVerse = (verseNumber: number) => {
    if (!isPlaying) return;
    
    const verseElement = document.querySelector(`[data-verse="${verseNumber}"]`);
    if (!verseElement) return;

    try {
      // Get the header height
      const headerElement = document.querySelector('.fixed');
      const headerHeight = headerElement ? headerElement.getBoundingClientRect().height : 200;
      
      // Get the verse element's position
      const verseRect = verseElement.getBoundingClientRect();
      
      // Calculate the target scroll position
      // We want the verse to be positioned just below the header
      const targetPosition = window.pageYOffset + verseRect.top - headerHeight - 20;

      console.log('Scrolling in Wix:', {
        verseNumber,
        targetPosition,
        headerHeight,
        currentScroll: window.pageYOffset,
        verseTop: verseRect.top
      });

      // Try different scrolling methods for maximum compatibility
      try {
        // Method 1: scrollIntoView with smooth behavior
        verseElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
        
        // Additional offset to account for header
        setTimeout(() => {
          window.scrollBy({
            top: -headerHeight - 20,
            behavior: 'smooth'
          });
        }, 100);
      } catch (e) {
        console.log('Fallback to manual scroll');
        // Method 2: Direct window scroll
        window.scrollTo({
          top: Math.max(0, targetPosition),
          behavior: 'smooth'
        });
      }
    } catch (error) {
      console.error('Scroll error:', error);
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