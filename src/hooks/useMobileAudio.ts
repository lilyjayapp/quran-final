import { useEffect } from 'react';
import { isIOSDevice, isAndroidDevice } from '@/utils/deviceUtils';

export const useMobileAudio = (audioRef: React.RefObject<HTMLAudioElement>) => {
  useEffect(() => {
    if (!audioRef.current) return;

    const audio = audioRef.current;
    
    console.log('Mobile Audio Setup:', {
      isIOS: isIOSDevice(),
      isAndroid: isAndroidDevice(),
      audioElement: {
        readyState: audio.readyState,
        paused: audio.paused,
        currentSrc: audio.src,
        preload: audio.preload
      }
    });

    if (isIOSDevice()) {
      console.log('Configuring for iOS device');
      audio.load();
      audio.preload = "auto";
    }

    const handleCanPlay = () => {
      console.log('Audio can play event fired', {
        readyState: audio.readyState,
        currentTime: audio.currentTime,
        duration: audio.duration
      });
    };

    const handleLoadStart = () => {
      console.log('Audio load start event', {
        src: audio.src,
        readyState: audio.readyState
      });
    };

    const handleError = (e: ErrorEvent) => {
      console.error('Audio error event:', {
        error: audio.error,
        errorCode: audio.error?.code,
        errorMessage: audio.error?.message,
        src: audio.src,
        readyState: audio.readyState
      });
    };

    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('error', handleError);
    };
  }, [audioRef]);
};