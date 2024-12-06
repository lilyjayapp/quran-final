import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAudioPlayback } from "@/hooks/useAudioPlayback";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { useVerseProgression } from "@/hooks/useVerseProgression";
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
    localStorage.getItem("recitationLanguage") || "ar.alafasy"
  );
  const [selectedReciter, setSelectedReciter] = useState(() =>
    localStorage.getItem("selectedReciter") || "ar.alafasy"
  );
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
    console.log("Play/Pause clicked");
    console.log("Current language:", recitationLanguage);
    console.log("Current playing state:", isPlaying);

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
    console.log("Language changed to:", value);
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
      console.log("Cleanup: stopping all audio");
      stopSpeaking();
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      setIsPlaying(false);
    };
  }, []);

  const handleAudioEnded = () => {
    const hasMoreVerses = playNextVerse();
    if (hasMoreVerses && recitationLanguage === "ar.alafasy") {
      // Continue playing if there are more verses
      setIsPlaying(true);
      if (audioRef.current) {
        audioRef.current.play().catch(error => {
          console.error("Error playing next verse:", error);
          toast.error("Error playing audio");
        });
      }
    } else {
      setIsPlaying(false);
    }
  };

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
          <AudioLanguageSelect
            value={recitationLanguage}
            onChange={handleLanguageChange}
            disabled={isLoading}
          />
          <ReciterSelect
            value={selectedReciter}
            onChange={(value) => {
              if (recitationLanguage !== "ar.alafasy") {
                toast.error("Reciter selection is only available for Arabic recitation");
                return;
              }
              setSelectedReciter(value);
              localStorage.setItem("selectedReciter", value);
              resetAudio();
              stopSpeaking();
            }}
            disabled={isLoading || recitationLanguage !== "ar.alafasy"}
          />
        </div>
        <AudioTranslationDisplay translation={verses[currentVerseIndex]?.translation} />
      </div>
      {recitationLanguage === "ar.alafasy" && (
        <audio
          ref={audioRef}
          src={getAudioUrl(verses[currentVerseIndex]?.number, recitationLanguage, selectedReciter)}
          onEnded={handleAudioEnded}
          preload="auto"
          crossOrigin="anonymous"
        />
      )}
    </div>
  );
};

export default AudioPlayer;