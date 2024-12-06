import React from "react";
import { Play, Pause, RotateCcw, RefreshCw } from "lucide-react";
import { Button } from "./ui/button";

interface AudioControlsProps {
  isPlaying: boolean;
  isLoading: boolean;
  onPlayPause: () => void;
  onReset: () => void;
  onRetry: () => void;
}

const AudioControls: React.FC<AudioControlsProps> = ({
  isPlaying,
  isLoading,
  onPlayPause,
  onReset,
  onRetry,
}) => {
  return (
    <div className="flex items-center gap-4">
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
        onClick={onRetry}
        disabled={isLoading}
      >
        <RefreshCw size={20} />
      </Button>
    </div>
  );
};

export default AudioControls;