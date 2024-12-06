import { useEffect } from 'react';
import { toast } from 'sonner';
import { isAndroidDevice, isIOSDevice } from '@/utils/deviceUtils';

export const useAudioError = (
  audioRef: React.RefObject<HTMLAudioElement>,
  onError?: () => void
) => {
  useEffect(() => {
    if (!audioRef.current) return;

    const handleError = (error: any) => {
      console.error('Audio Error Details:', {
        errorType: error.type,
        errorMessage: error.message,
        deviceInfo: {
          isAndroid: isAndroidDevice(),
          isIOS: isIOSDevice(),
          userAgent: navigator.userAgent
        },
        audioState: {
          readyState: audioRef.current?.readyState,
          networkState: audioRef.current?.networkState,
          error: audioRef.current?.error
        }
      });

      // Only show error for non-Android devices to reduce noise
      if (!isAndroidDevice()) {
        toast.error("Audio playback error", {
          description: "Please try again or select a different reciter.",
        });
      }
      
      if (onError) onError();
    };

    audioRef.current.addEventListener('error', handleError);
    
    return () => {
      audioRef.current?.removeEventListener('error', handleError);
    };
  }, [audioRef, onError]);
};