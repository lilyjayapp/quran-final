import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import AudioControls from "./AudioControls";
import AudioLanguageSelect from "./audio/AudioLanguageSelect";
import ReciterSelect from "./audio/ReciterSelect";
import { getAudioUrl, handleAudioError } from "@/utils/audioUtils";
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
  } = useAudioPlayer({ 
    verses,
    onVerseChange,
    onError: () => {
      handleAudioError(audioRef.current);
      
      if (recitationLanguage === "english") {
        toast.error("English audio not available", {
          description: "English translation audio is not currently available. Playing English text-to-speech.",
          action: {
            label: "Switch to Arabic",
            onClick: () => {
              setRecitationLanguage("arabic");
              localStorage.setItem("recitationLanguage", "arabic");
              setSelectedReciter("ar.alafasy");
              localStorage.setItem("selectedReciter", "ar.alafasy");
              setTimeout(retryPlayback, 500);
            },
          },
        });
      } else {
        toast.error("Audio not available", {
          description: "Please try selecting a different reciter.",
          action: {
            label: "Try Default Reciter",
            onClick: () => {
              setSelectedReciter("ar.alafasy");
              localStorage.setItem("selectedReciter", "ar.alafasy");
              setTimeout(retryPlayback, 500);
            },
          },
        });
      }
    }
  });

  // Stop TTS and audio when component unmounts or language changes
  useEffect(() => {
    return () => {
      stopSpeaking();
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, [recitationLanguage]);

  const navigateToSurah = (direction: "next" | "previous") => {
    const nextSurahNumber =
      direction === "next" ? currentSurahNumber + 1 : currentSurahNumber - 1;

    if (nextSurahNumber >= 1 && nextSurahNumber <= 114) {
      resetAudio();
      stopSpeaking();
      navigate(`/surah/${nextSurahNumber}`);
    }
  };

  const handleReciterChange = (value: string) => {
    if (recitationLanguage === "english") {
      toast.error("Reciter selection is only available for Arabic recitation");
      return;
    }
    setSelectedReciter(value);
    localStorage.setItem("selectedReciter", value);
    resetAudio();
    stopSpeaking();
    toast.info("Reciter changed", {
      description: "The audio will restart with the new reciter.",
    });
  };

  const handleLanguageChange = (value: string) => {
    setRecitationLanguage(value);
    localStorage.setItem("recitationLanguage", value);
    
    // Stop any ongoing audio and reset state
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    stopSpeaking();
    
    if (value === "english") {
      toast.info("English audio using text-to-speech", {
        description: "Playing English translation using text-to-speech technology.",
      });
      setSelectedReciter("ar.alafasy"); // Reset reciter when switching to English
      // Start TTS for current verse if playing
      if (isPlaying && verses[currentVerseIndex]?.translation) {
        speak(verses[currentVerseIndex].translation, playNextVerse);
      }
    } else {
      const savedReciter = localStorage.getItem("selectedReciter") || "ar.alafasy";
      setSelectedReciter(savedReciter);
      resetAudio();
    }
  };

  // Handle TTS for English mode
  useEffect(() => {
    if (recitationLanguage === "english" && isPlaying) {
      // Ensure Arabic audio is stopped
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      if (verses[currentVerseIndex]?.translation) {
        speak(verses[currentVerseIndex].translation, playNextVerse);
      }
    }
  }, [currentVerseIndex, recitationLanguage, isPlaying]);

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
                  speak(verses[currentVerseIndex].translation, playNextVerse);
                }
              }
              togglePlay();
            }}
            onReset={() => {
              resetAudio();
              stopSpeaking();
            }}
            onPrevious={() => {
              stopSpeaking();
              navigateToSurah("previous");
            }}
            onNext={() => {
              stopSpeaking();
              navigateToSurah("next");
            }}
            onRetry={() => {
              if (recitationLanguage === "english") {
                speak(verses[currentVerseIndex].translation, playNextVerse);
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
            onChange={handleReciterChange}
            disabled={isLoading || recitationLanguage === "english"}
          />
        </div>
        <div className="text-sm text-gray-600">
          {verses[currentVerseIndex]?.translation}
        </div>
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