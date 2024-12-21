import { useState, useCallback } from 'react';
import { speak, stopSpeaking } from '../utils/ttsUtils';

export const useTextToSpeech = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);

  const startSpeaking = useCallback((text: string) => {
    setIsSpeaking(true);
    speak(text, () => setIsSpeaking(false));
  }, []);

  const stopTextToSpeech = useCallback(() => {
    stopSpeaking();
    setIsSpeaking(false);
  }, []);

  return {
    isSpeaking,
    startSpeaking,
    stopTextToSpeech
  };
};