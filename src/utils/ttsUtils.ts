let speechSynthesis: SpeechSynthesis;
let currentUtterance: SpeechSynthesisUtterance | null = null;

if (typeof window !== 'undefined') {
  speechSynthesis = window.speechSynthesis;
}

export const speak = (text: string, onEnd?: () => void) => {
  stopSpeaking();
  
  if (!speechSynthesis) {
    console.error('Speech synthesis not supported');
    return;
  }

  currentUtterance = new SpeechSynthesisUtterance(text);
  currentUtterance.rate = 0.9; // Slightly slower for better clarity
  currentUtterance.onend = () => {
    if (onEnd) onEnd();
  };

  speechSynthesis.speak(currentUtterance);
};

export const stopSpeaking = () => {
  if (speechSynthesis) {
    speechSynthesis.cancel();
  }
  currentUtterance = null;
};

export const isSpeaking = () => {
  return speechSynthesis?.speaking || false;
};