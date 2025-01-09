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
      // Add a small delay to ensure the audio is ready before scrolling
      setTimeout(() => {
        if (onVerseChange) {
          onVerseChange(verseNumber);
        }
      }, 100);
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