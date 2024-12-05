import React from "react";
import { Play, Pause, RotateCcw, SkipBack, SkipForward } from "lucide-react";
import { Button } from "./ui/button";

interface AudioControlsProps {
  isPlaying: boolean;
  isLoading: boolean;
  onPlayPause: () => void;
  onReset: () => void;
  onPrevious: () => void;
  onNext: () => void;
  disablePrevious: boolean;
  disableNext: boolean;
}

const AudioControls: React.FC<AudioControlsProps> = ({
  isPlaying,
  isLoading,
  onPlayPause,
  onReset,
  onPrevious,
  onNext,
  disablePrevious,
  disableNext,
}) => {
  return (
    <div className="flex items-center gap-4">
      <Button
        variant="outline"
        size="icon"
        onClick={onPrevious}
        disabled={disablePrevious || isLoading}
      >
        <SkipBack size={20} />
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={onPlayPause}
        disabled={isLoading}
      >
        {isLoading ? (
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900" />
        ) : isPlaying ? (
          <Pause size={20} />
        ) : (
          <Play size={20} />
        )}
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={onReset}
        disabled={isLoading}
      >
        <RotateCcw size={20} />
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={onNext}
        disabled={disableNext || isLoading}
      >
        <SkipForward size={20} />
      </Button>
    </div>
  );
};

export default AudioControls;