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
      }
      
      // For mobile devices, we preload metadata only to reduce memory usage
      if (isMobileDevice()) {
        audioRef.current.preload = "metadata";
      }
    }
  }, [src]);

  return (
    <audio
      ref={audioRef}
      src={src}
      onEnded={onEnded}
      preload={isMobileDevice() ? "metadata" : "auto"}
      crossOrigin="anonymous"
      playsInline
      // iOS specific attributes
      x-webkit-airplay="allow"
      controlsList="nodownload"
    />
  );
};

export default AudioHandler;