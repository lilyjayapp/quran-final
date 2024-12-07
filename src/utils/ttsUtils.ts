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
  currentUtterance.lang = 'en-US';
  currentUtterance.rate = 0.9;
  
  if (onEnd) {
    currentUtterance.onend = onEnd;
  }

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