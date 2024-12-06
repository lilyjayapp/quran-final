import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAudioPlayback } from "@/hooks/useAudioPlayback";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import AudioControls from "./AudioControls";
import AudioLanguageSelect from "./audio/AudioLanguageSelect";
import ReciterSelect from "./audio/ReciterSelect";
import AudioTranslationDisplay from "./audio/AudioTranslationDisplay";
import { getAudioUrl } from "@/utils/audioUtils";
import { stopSpeaking } from "@/utils/ttsUtils";

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
    localStorage.getItem("recitationLanguage") || "arabic"
  );
  const [selectedReciter, setSelectedReciter] = useState(() =>
    localStorage.getItem("selectedReciter") || "ar.alafasy"
  );
  const navigate = useNavigate();

  const {
    isPlaying,
    isLoading,
    currentVerseIndex,
    audioRef,
    togglePlay,
    resetAudio,
    playNextVerse,
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
    setIsPlaying
  });

  const handlePlayPause = async () => {
    console.log("Play/Pause clicked");
    console.log("Current language:", recitationLanguage);
    console.log("Current playing state:", isPlaying);

    if (recitationLanguage === "english") {
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
    
    if (value === "english") {
      toast.info("English audio using text-to-speech");
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
    if (recitationLanguage === "english" && isPlaying) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      playTranslations();
    }
  }, [currentVerseIndex, recitationLanguage, isPlaying]);

  useEffect(() => {
    return () => {
      console.log("Cleanup: stopping all audio");
      stopSpeaking();
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      setIsPlaying(false);
    };
  }, [recitationLanguage]);

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-4">
          <AudioControls
            isPlaying={isPlaying}
            isLoading={isLoading}
            onPlayPause={handlePlayPause}
            onReset={() => {
              resetAudio();
              stopSpeaking();
              setIsPlaying(false);
            }}
            onPrevious={() => navigateToSurah("previous")}
            onNext={() => navigateToSurah("next")}
            onRetry={async () => {
              if (recitationLanguage === "english") {
                setIsPlaying(true);
                await playTranslations();
              } else {
                await retryPlayback();
              }
            }}
            disablePrevious={currentSurahNumber <= 1}
            disableNext={currentSurahNumber >= 114}
          />
          <AudioLanguageSelect
            value={recitationLanguage}
            onChange={handleLanguageChange}
            disabled={isLoading}
          />
          <ReciterSelect
            value={selectedReciter}
            onChange={(value) => {
              if (recitationLanguage === "english") {
                toast.error("Reciter selection is only available for Arabic recitation");
                return;
              }
              setSelectedReciter(value);
              localStorage.setItem("selectedReciter", value);
              resetAudio();
              stopSpeaking();
            }}
            disabled={isLoading || recitationLanguage === "english"}
          />
        </div>
        <AudioTranslationDisplay translation={verses[currentVerseIndex]?.translation} />
      </div>
      {recitationLanguage === "arabic" && (
        <audio
          ref={audioRef}
          src={getAudioUrl(verses[currentVerseIndex]?.number, recitationLanguage, selectedReciter)}
          onEnded={playNextVerse}
          preload="auto"
          crossOrigin="anonymous"
        />
      )}
    </div>
  );
};

export default AudioPlayer;