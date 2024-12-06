import React, { useEffect } from "react";
import { toast } from "sonner";
import { useAudioPlayback } from "@/hooks/useAudioPlayback";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { useVerseProgression } from "@/hooks/useVerseProgression";
import { useAudioState } from "@/hooks/useAudioState";
import AudioContainer from "./audio/AudioContainer";
import AudioControls from "./AudioControls";
import AudioSelectors from "./audio/AudioSelectors";
import AudioTranslationDisplay from "./audio/AudioTranslationDisplay";
import AudioHandler from "./audio/AudioHandler";
import { getAudioUrl } from "@/utils/audioUtils";
import { stopSpeaking } from "@/utils/ttsUtils";
import { isMobileDevice } from "@/utils/deviceUtils";

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
  const {
    recitationLanguage,
    selectedReciter,
    setSelectedReciter,
    handleLanguageChange,
  } = useAudioState();

  const { currentVerseIndex, playNextVerse, resetVerse } = useVerseProgression({
    totalVerses: verses.length,
    onVerseChange,
  });

  const {
    isPlaying,
    isLoading,
    audioRef,
    togglePlay,
    resetAudio,
    retryPlayback,
    setIsPlaying
  } = useAudioPlayback({ 
    verses,
    onVerseChange,
    onError: () => {
      toast.error("Audio not available", {
        description: "Please try selecting a different reciter.",
      });
    }
  });

  const { playTranslations, stopTranslations } = useTextToSpeech({
    verses,
    isPlaying,
    currentVerseIndex,
    onVerseChange,
    setIsPlaying,
    language: recitationLanguage
  });

  const handlePlayPause = async () => {
    if (recitationLanguage !== "ar.alafasy") {
      if (isPlaying) {
        stopTranslations();
        setIsPlaying(false);
      } else {
        setIsPlaying(true);
        await playTranslations();
      }
    } else {
      await togglePlay();
    }
  };

  const handleAudioEnded = async () => {
    const hasMoreVerses = playNextVerse();
    if (hasMoreVerses) {
      if (recitationLanguage === "ar.alafasy") {
        if (audioRef.current) {
          try {
            await audioRef.current.play();
          } catch (error) {
            setIsPlaying(false);
          }
        }
      } else {
        await playTranslations();
      }
    } else {
      setIsPlaying(false);
    }
  };

  useEffect(() => {
    if (recitationLanguage !== "ar.alafasy" && isPlaying) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      playTranslations();
    }
  }, [currentVerseIndex, recitationLanguage, isPlaying]);

  useEffect(() => {
    return () => {
      stopSpeaking();
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      setIsPlaying(false);
    };
  }, []);

  const disablePrevious = currentSurahNumber <= 1;
  const disableNext = currentSurahNumber >= 114;

  const handlePrevious = () => {
    if (!disablePrevious) {
      navigate(`/surah/${currentSurahNumber - 1}`);
    }
  };

  const handleNext = () => {
    if (!disableNext) {
      navigate(`/surah/${currentSurahNumber + 1}`);
    }
  };

  return (
    <AudioContainer>
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full">
        <AudioControls
          isPlaying={isPlaying}
          isLoading={isLoading}
          onPlayPause={handlePlayPause}
          onReset={() => {
            resetAudio();
            stopSpeaking();
            resetVerse();
            setIsPlaying(false);
          }}
          onPrevious={handlePrevious}
          onNext={handleNext}
          onRetry={async () => {
            if (recitationLanguage !== "ar.alafasy") {
              setIsPlaying(true);
              await playTranslations();
            } else {
              await retryPlayback();
            }
          }}
          disablePrevious={disablePrevious}
          disableNext={disableNext}
        />
        <AudioSelectors
          recitationLanguage={recitationLanguage}
          selectedReciter={selectedReciter}
          onLanguageChange={(value) => handleLanguageChange(value, {
            audioRef,
            resetVerse,
            setIsPlaying,
            resetAudio
          })}
          onReciterChange={(value) => {
            if (recitationLanguage !== "ar.alafasy") {
              toast.error("Reciter selection is only available for Arabic recitation");
              return;
            }
            setSelectedReciter(value);
            localStorage.setItem("selectedReciter", value);
            resetAudio();
            stopSpeaking();
          }}
          isLoading={isLoading}
        />
      </div>
      <AudioTranslationDisplay translation={verses[currentVerseIndex]?.translation} />
      {recitationLanguage === "ar.alafasy" && (
        <AudioHandler
          audioRef={audioRef}
          src={getAudioUrl(verses[currentVerseIndex]?.number, recitationLanguage, selectedReciter)}
          onEnded={handleAudioEnded}
          isPlaying={isPlaying}
        />
      )}
    </AudioContainer>
  );
};

export default AudioPlayer;