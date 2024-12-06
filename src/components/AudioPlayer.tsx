import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import AudioControls from "./AudioControls";
import AudioLanguageSelect from "./audio/AudioLanguageSelect";
import ReciterSelect from "./audio/ReciterSelect";
import AudioTranslationDisplay from "./audio/AudioTranslationDisplay";
import { getAudioUrl } from "@/utils/audioUtils";
import { speak, stopSpeaking } from "@/utils/ttsUtils";

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
  } = useAudioPlayer({ 
    verses,
    onVerseChange,
    onError: () => {
      if (recitationLanguage === "english") {
        toast.error("English audio not available", {
          description: "English translation audio is not currently available. Playing English text-to-speech.",
        });
      } else {
        toast.error("Audio not available", {
          description: "Please try selecting a different reciter.",
        });
      }
    }
  });

  const playEnglishTranslation = (startFromIndex: number = currentVerseIndex) => {
    if (startFromIndex >= verses.length) {
      setIsPlaying(false);
      return;
    }

    speak(verses[startFromIndex].translation, () => {
      if (isPlaying && startFromIndex < verses.length - 1) {
        playEnglishTranslation(startFromIndex + 1);
      } else if (startFromIndex >= verses.length - 1) {
        setIsPlaying(false);
      }
    });
  };

  const handleLanguageChange = (value: string) => {
    setRecitationLanguage(value);
    localStorage.setItem("recitationLanguage", value);
    
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    stopSpeaking();
    
    if (value === "english") {
      toast.info("English audio using text-to-speech");
      setSelectedReciter("ar.alafasy");
      if (isPlaying) {
        playEnglishTranslation();
      }
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
      playEnglishTranslation();
    }
  }, [currentVerseIndex, recitationLanguage, isPlaying]);

  useEffect(() => {
    return () => {
      stopSpeaking();
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, [recitationLanguage]);

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-4">
          <AudioControls
            isPlaying={isPlaying}
            isLoading={isLoading}
            onPlayPause={() => {
              if (recitationLanguage === "english") {
                if (isPlaying) {
                  stopSpeaking();
                } else {
                  playEnglishTranslation();
                }
              }
              togglePlay();
            }}
            onReset={() => {
              resetAudio();
              stopSpeaking();
            }}
            onPrevious={() => navigateToSurah("previous")}
            onNext={() => navigateToSurah("next")}
            onRetry={() => {
              if (recitationLanguage === "english") {
                playEnglishTranslation();
              } else {
                retryPlayback();
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