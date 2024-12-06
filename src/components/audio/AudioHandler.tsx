import React, { useEffect } from 'react';
import { isMobileDevice, isIOSDevice } from '@/utils/deviceUtils';

interface AudioHandlerProps {
  audioRef: React.RefObject<HTMLAudioElement>;
  src: string;
  onEnded: () => void;
  isPlaying: boolean;
}

const AudioHandler: React.FC<AudioHandlerProps> = ({
  audioRef,
  src,
  onEnded,
  isPlaying,
}) => {
  useEffect(() => {
    if (audioRef.current) {
      // For iOS devices, we need to load the audio when the user interacts
      if (isIOSDevice()) {
        audioRef.current.load();
        // iOS specific settings
        audioRef.current.playsinline = true;
        audioRef.current.controls = false;
        audioRef.current.preload = "auto";
      }
      
      // For mobile devices, we preload metadata only to reduce memory usage
      if (isMobileDevice() && !isIOSDevice()) {
        audioRef.current.preload = "metadata";
      }

      // Add event listeners for better error tracking
      const handleError = (e: ErrorEvent) => {
        console.error('Audio error:', e.message);
      };

      audioRef.current.addEventListener('error', handleError);
      return () => {
        if (audioRef.current) {
          audioRef.current.removeEventListener('error', handleError);
        }
      };
    }
  }, [src]);

  return (
    <audio
      ref={audioRef}
      src={src}
      onEnded={onEnded}
      preload={isIOSDevice() ? "auto" : isMobileDevice() ? "metadata" : "auto"}
      crossOrigin="anonymous"
      playsInline
      // iOS specific attributes
      x-webkit-airplay="allow"
      controlsList="nodownload"
    />
  );
};

export default AudioHandler;