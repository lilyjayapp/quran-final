import React, { useState, useRef, useEffect } from "react";
import { Play, Pause, RotateCcw, SkipBack, SkipForward } from "lucide-react";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  onVerseChange 
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentVerseIndex, setCurrentVerseIndex] = useState(0);
  const [recitationLanguage, setRecitationLanguage] = useState("arabic");
  const audioRef = useRef<HTMLAudioElement>(null);
  const navigate = useNavigate();

  const playNextVerse = () => {
    if (currentVerseIndex < verses.length - 1) {
      const nextIndex = currentVerseIndex + 1;
      setCurrentVerseIndex(nextIndex);
      if (onVerseChange) {
        onVerseChange(verses[nextIndex].number);
      }
    } else {
      setIsPlaying(false);
      setCurrentVerseIndex(0);
      if (onVerseChange) {
        onVerseChange(verses[0].number);
      }
    }
  };

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play();
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentVerseIndex]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
    if (onVerseChange) {
      onVerseChange(verses[currentVerseIndex].number);
    }
  };

  const resetAudio = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.pause();
      setIsPlaying(false);
      setCurrentVerseIndex(0);
      if (onVerseChange) {
        onVerseChange(verses[0].number);
      }
    }
  };

  const navigateToSurah = (direction: 'next' | 'previous') => {
    const nextSurahNumber = direction === 'next' 
      ? currentSurahNumber + 1 
      : currentSurahNumber - 1;
    
    if (nextSurahNumber >= 1 && nextSurahNumber <= 114) {
      resetAudio();
      navigate(`/surah/${nextSurahNumber}`);
    }
  };

  const getAudioUrl = (verseNumber: number) => {
    const baseUrl = "https://cdn.islamic.network/quran/audio/128/";
    return recitationLanguage === "arabic" 
      ? `${baseUrl}ar.alafasy/${verseNumber}.mp3`
      : `${baseUrl}en.walk/${verseNumber}.mp3`;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigateToSurah('previous')}
            disabled={currentSurahNumber <= 1}
          >
            <SkipBack size={20} />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={togglePlay}
          >
            {isPlaying ? <Pause size={20} /> : <Play size={20} />}
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={resetAudio}
          >
            <RotateCcw size={20} />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigateToSurah('next')}
            disabled={currentSurahNumber >= 114}
          >
            <SkipForward size={20} />
          </Button>
          <Select
            value={recitationLanguage}
            onValueChange={setRecitationLanguage}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="arabic">Arabic</SelectItem>
              <SelectItem value="english">English</SelectItem>
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
        className="hidden"
      />
    </div>
  );
};

export default AudioPlayer;