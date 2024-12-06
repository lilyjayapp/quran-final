import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { reciters } from "@/utils/reciters";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import { toast } from "sonner";
import AudioControls from "./AudioControls";

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
      console.log("Audio Error Details:");
      console.log("- Current reciter:", selectedReciter);
      console.log("- Current language:", recitationLanguage);
      console.log("- Current verse number:", verses[currentVerseIndex]?.number);
      
      if (recitationLanguage === "english") {
        toast.error("English audio not available", {
          description: "English translation audio is currently unavailable. Playing Arabic recitation.",
          action: {
            label: "Switch to Arabic",
            onClick: () => {
              setRecitationLanguage("arabic");
              localStorage.setItem("recitationLanguage", "arabic");
              setSelectedReciter("ar.alafasy");
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
              setTimeout(retryPlayback, 500);
            },
          },
        });
      }
    }
  });

  const navigateToSurah = (direction: "next" | "previous") => {
    const nextSurahNumber =
      direction === "next" ? currentSurahNumber + 1 : currentSurahNumber - 1;

    if (nextSurahNumber >= 1 && nextSurahNumber <= 114) {
      resetAudio();
      navigate(`/surah/${nextSurahNumber}`);
    }
  };

  const getAudioUrl = (verseNumber: number) => {
    if (!verseNumber) return "";
    
    let url;
    if (recitationLanguage === "english") {
      url = `https://cdn.islamic.network/quran/audio-translations/128/en.walk/${verseNumber}.mp3`;
    } else {
      url = `https://cdn.islamic.network/quran/audio/128/${selectedReciter}/${verseNumber}.mp3`;
    }
    
    console.log("Generated audio URL:", url);
    console.log("Audio settings:", {
      language: recitationLanguage,
      reciter: selectedReciter,
      verseNumber: verseNumber
    });
    
    return url;
  };

  const handleReciterChange = (value: string) => {
    if (recitationLanguage === "english") {
      toast.error("Reciter selection is only available for Arabic recitation");
      return;
    }
    console.log("Changing reciter to:", value);
    setSelectedReciter(value);
    localStorage.setItem("selectedReciter", value);
    resetAudio();
    toast.info("Reciter changed", {
      description: "The audio will restart with the new reciter.",
    });
  };

  const handleLanguageChange = (value: string) => {
    console.log("Changing language to:", value);
    setRecitationLanguage(value);
    localStorage.setItem("recitationLanguage", value);
    
    if (value === "english") {
      setSelectedReciter("en.walk");
      toast.info("Switching to English", {
        description: "Note: If English audio is unavailable, it will automatically fallback to Arabic recitation.",
      });
    } else {
      const savedReciter = localStorage.getItem("selectedReciter") || "ar.alafasy";
      setSelectedReciter(savedReciter);
    }
    
    resetAudio();
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-4">
          <AudioControls
            isPlaying={isPlaying}
            isLoading={isLoading}
            onPlayPause={togglePlay}
            onReset={resetAudio}
            onPrevious={() => navigateToSurah("previous")}
            onNext={() => navigateToSurah("next")}
            onRetry={retryPlayback}
            disablePrevious={currentSurahNumber <= 1}
            disableNext={currentSurahNumber >= 114}
          />
          <Select
            value={recitationLanguage}
            onValueChange={handleLanguageChange}
            disabled={isLoading}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select audio language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="arabic">Arabic Recitation</SelectItem>
              <SelectItem value="english">English Recitation</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={selectedReciter}
            onValueChange={handleReciterChange}
            disabled={isLoading || recitationLanguage === "english"}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select reciter" />
            </SelectTrigger>
            <SelectContent>
              {reciters.map((reciter) => (
                <SelectItem key={reciter.identifier} value={reciter.identifier}>
                  {reciter.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="text-sm text-gray-600">
          {verses[currentVerseIndex]?.translation}
        </div>
      </div>
      <audio
        ref={audioRef}
        src={getAudioUrl(verses[currentVerseIndex]?.number)}
        onEnded={playNextVerse}
        preload="auto"
        crossOrigin="anonymous"
      />
    </div>
  );
};

export default AudioPlayer;