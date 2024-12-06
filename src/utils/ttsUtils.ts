export const speak = (text: string, onEnd?: () => void) => {
  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-US';
  utterance.rate = 0.9; // Slightly slower for better clarity
  
  if (onEnd) {
    utterance.onend = onEnd;
  }

  window.speechSynthesis.speak(utterance);
  
  console.log("TTS started with text:", text);
};

export const stopSpeaking = () => {
  window.speechSynthesis.cancel();
  console.log("TTS stopped");
};