import React, { useState, useRef, useEffect } from "react";
import { Play, Pause, RotateCcw, SkipBack, SkipForward } from "lucide-react";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";
import { useToast } from "./ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { reciters } from "@/utils/reciters";

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
  const [selectedReciter, setSelectedReciter] = useState(() => 
    localStorage.getItem('selectedReciter') || reciters[0].identifier
  );
  const audioRef = useRef<HTMLAudioElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

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
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch((error) => {
            console.error("Audio playback error:", error);
            setIsPlaying(false);
            toast({
              title: "Playback Error",
              description: "There was an error playing the audio. Please try again.",
              variant: "destructive",
            });
          });
        }
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentVerseIndex, toast]);

  const togglePlay = async () => {
    try {
      if (audioRef.current) {
        if (!isPlaying) {
          // Ensure audio is loaded before attempting to play
          await audioRef.current.load();
        }
        setIsPlaying(!isPlaying);
        if (onVerseChange) {
          onVerseChange(verses[currentVerseIndex].number);
        }
      }
    } catch (error) {
      console.error("Toggle play error:", error);
      toast({
        title: "Playback Error",
        description: "There was an error controlling the audio. Please try again.",
        variant: "destructive",
      });
    }
  };

  const resetAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
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
      ? `${baseUrl}${selectedReciter}/${verseNumber}.mp3`
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
        preload="auto"
        className="hidden"
      />
    </div>
  );
};

export default AudioPlayer;