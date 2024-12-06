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
import AudioTransitionHandler from "./audio/AudioTransitionHandler";
import AudioNavigation from "./audio/AudioNavigation";
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
    isTransitioning,
    recitationLanguage,
    selectedReciter,
    setSelectedReciter,
    handleLanguageChange,
    startTransition
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
      if (!isTransitioning && !isMobileDevice()) {
        toast.error("Audio not available", {
          description: "Please try selecting a different reciter.",
        });
      }
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

  const navigation = AudioNavigation({
    currentSurahNumber,
    resetAudio,
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
    startTransition(() => {
      const hasMoreVerses = playNextVerse();
      
      if (hasMoreVerses) {
        AudioTransitionHandler({
          audioRef,
          recitationLanguage,
          isPlaying,
          setIsPlaying,
          playTranslations,
          currentVerseIndex,
          verses
        });
      } else {
        setIsPlaying(false);
      }
    });
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
          onPrevious={() => navigation.navigateToSurah("previous")}
          onNext={() => navigation.navigateToSurah("next")}
          onRetry={async () => {
            if (recitationLanguage !== "ar.alafasy") {
              setIsPlaying(true);
              await playTranslations();
            } else {
              await retryPlayback();
            }
          }}
          disablePrevious={currentSurahNumber <= 1}
          disableNext={currentSurahNumber >= 114}
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