import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAudioPlayback } from "@/hooks/useAudioPlayback";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { useVerseProgression } from "@/hooks/useVerseProgression";
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
  const [recitationLanguage, setRecitationLanguage] = useState(() => 
    localStorage.getItem("recitationLanguage") || "ar.alafasy"
  );
  const [selectedReciter, setSelectedReciter] = useState(() =>
    localStorage.getItem("selectedReciter") || "ar.alafasy"
  );
  const [isTransitioning, setIsTransitioning] = useState(false);
  const navigate = useNavigate();

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
      // Only show error if we're not transitioning between verses
      // and we're not on a mobile device (to reduce noise)
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

  const handleLanguageChange = (value: string) => {
    setRecitationLanguage(value);
    localStorage.setItem("recitationLanguage", value);
    
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    stopSpeaking();
    setIsPlaying(false);
    resetVerse();
    
    if (value !== "ar.alafasy") {
      toast.info(`Switched to ${value} recitation`);
      setSelectedReciter("ar.alafasy");
    } else {
      const savedReciter = localStorage.getItem("selectedReciter") || "ar.alafasy";
      setSelectedReciter(savedReciter);
      resetAudio();
    }
  };

  const navigateToSurah = (direction: "next" | "previous") => {
    const nextSurahNumber =
      direction === "next" ? currentSurahNumber + 1 : currentSurahNumber - 1;

    if (nextSurahNumber >= 1 && nextSurahNumber <= 114) {
      resetAudio();
      stopSpeaking();
      navigate(`/surah/${nextSurahNumber}`);
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

  const handleAudioEnded = async () => {
    setIsTransitioning(true);
    const hasMoreVerses = playNextVerse();
    
    if (hasMoreVerses && recitationLanguage === "ar.alafasy") {
      setIsPlaying(true);
      if (audioRef.current) {
        try {
          // Add a small delay before playing next verse on mobile
          if (isMobileDevice()) {
            await new Promise(resolve => setTimeout(resolve, 100));
          }
          await audioRef.current.play();
        } catch (error) {
          console.error("Error playing next verse:", error);
          // Only show error if it's not a user interaction error
          // and we're not on a mobile device
          if (error instanceof Error && 
              error.name !== "NotAllowedError" && 
              !isMobileDevice()) {
            toast.error("Error playing audio");
          }
        }
      }
    } else {
      setIsPlaying(false);
    }
    // Longer delay for mobile devices before removing transition state
    setTimeout(() => setIsTransitioning(false), isMobileDevice() ? 1000 : 500);
  };

  return (
    <div 
      className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 p-2 sm:p-4 z-[9999] shadow-md" 
      style={{ 
        position: 'fixed', 
        top: 0,
        width: '100%',
        maxWidth: '100%',
        margin: 0,
        transform: 'translateZ(0)',
        WebkitTransform: 'translateZ(0)',
        willChange: 'transform'
      }}
    >
      <div className="container mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
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
            onPrevious={() => navigateToSurah("previous")}
            onNext={() => navigateToSurah("next")}
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
            onLanguageChange={handleLanguageChange}
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
      </div>
      {recitationLanguage === "ar.alafasy" && (
        <AudioHandler
          audioRef={audioRef}
          src={getAudioUrl(verses[currentVerseIndex]?.number, recitationLanguage, selectedReciter)}
          onEnded={handleAudioEnded}
          isPlaying={isPlaying}
        />
      )}
    </div>
  );
};

export default AudioPlayer;