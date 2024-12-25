import React, { useEffect } from "react";
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
      }
      
      // Enhanced scrolling logic for Wix embedded context
      const verseElement = document.querySelector(`[data-verse="${verseNumber}"]`);
      if (verseElement) {
        // Find all possible scrollable containers
        const scrollableContainers = findScrollableContainers(verseElement);
        
        // Try to scroll each container that might be relevant
        scrollableContainers.forEach(container => {
          try {
            const elementRect = verseElement.getBoundingClientRect();
            const containerRect = container.getBoundingClientRect();
            
            // Calculate the scroll position to center the verse
            const scrollTop = elementRect.top + container.scrollTop - 
              (containerRect.height / 2) + (elementRect.height / 2);

            // Force scroll the container
            container.style.scrollBehavior = 'smooth';
            container.scrollTop = scrollTop;
            
            // Also try scrollIntoView as a fallback
            verseElement.scrollIntoView({
              behavior: 'smooth',
              block: 'center'
            });
          } catch (error) {
            console.error('Scroll error:', error);
          }
        });
      }
    },
  });

  // Helper function to find all possible scrollable containers
  const findScrollableContainers = (element: Element): Element[] => {
    const containers: Element[] = [];
    let parent = element.parentElement;
    
    while (parent) {
      const hasVerticalScroll = parent.scrollHeight > parent.clientHeight;
      const style = window.getComputedStyle(parent);
      const isScrollable = ['auto', 'scroll'].includes(style.overflowY);
      
      if (hasVerticalScroll || isScrollable) {
        containers.push(parent);
      }
      parent = parent.parentElement;
    }
    
    // Always include document.documentElement as a fallback
    containers.push(document.documentElement);
    return containers;
  };

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
