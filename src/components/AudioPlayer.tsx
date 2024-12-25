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
      
      // Enhanced scrolling logic with debug logging
      const verseElement = document.querySelector(`[data-verse="${verseNumber}"]`);
      console.log('Verse element found:', verseElement ? 'yes' : 'no', { verseNumber });
      
      if (verseElement) {
        // Find all possible scrollable containers
        const scrollableContainers = findScrollableContainers(verseElement);
        console.log('Found scrollable containers:', scrollableContainers.length, {
          containers: scrollableContainers.map(container => ({
            tagName: container.tagName,
            className: container.className,
            scrollHeight: container.scrollHeight,
            clientHeight: container.clientHeight,
            overflowY: window.getComputedStyle(container).overflowY
          }))
        });
        
        // Try to scroll each container that might be relevant
        scrollableContainers.forEach((container, index) => {
          try {
            const elementRect = verseElement.getBoundingClientRect();
            const containerRect = container.getBoundingClientRect();
            
            console.log(`Attempting to scroll container ${index}:`, {
              containerType: container.tagName,
              elementTop: elementRect.top,
              containerTop: containerRect.top,
              containerHeight: containerRect.height,
              elementHeight: elementRect.height,
              currentScroll: container.scrollTop
            });

            // Calculate the scroll position to center the verse
            const scrollTop = elementRect.top + container.scrollTop - 
              (containerRect.height / 2) + (elementRect.height / 2);

            // Force scroll using both methods
            if (container instanceof HTMLElement) {
              container.style.scrollBehavior = 'smooth';
              container.scrollTop = scrollTop;
              console.log(`Applied scroll to container ${index}:`, {
                newScrollTop: scrollTop,
                actualScrollTop: container.scrollTop
              });
            }
            
            // Also try scrollIntoView as a fallback
            verseElement.scrollIntoView({
              behavior: 'smooth',
              block: 'center'
            });
          } catch (error) {
            console.error(`Scroll error for container ${index}:`, error);
          }
        });
      }
    },
  });

  // Helper function to find all possible scrollable containers
  const findScrollableContainers = (element: Element): HTMLElement[] => {
    const containers: HTMLElement[] = [];
    let parent = element.parentElement;
    
    while (parent) {
      const hasVerticalScroll = parent.scrollHeight > parent.clientHeight;
      const style = window.getComputedStyle(parent);
      const isScrollable = ['auto', 'scroll'].includes(style.overflowY);
      
      if (hasVerticalScroll || isScrollable) {
        containers.push(parent as HTMLElement);
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