let speechSynthesis: SpeechSynthesis;
let currentUtterance: SpeechSynthesisUtterance | null = null;

if (typeof window !== 'undefined') {
  speechSynthesis = window.speechSynthesis;
}

export const speak = (text: string, onEnd?: () => void) => {
  if (!speechSynthesis) {
    console.error('Speech synthesis not supported');
    return;
  }

  // Cancel any ongoing speech
  stopSpeaking();

  // Create new utterance
  currentUtterance = new SpeechSynthesisUtterance(text);
  
  // Configure for optimal clarity
  currentUtterance.rate = 0.9; // Slightly slower for better clarity
  currentUtterance.pitch = 1;
  currentUtterance.volume = 1;
  currentUtterance.lang = 'en-US';
  
  // Set voice to a reliable English voice if available
  const voices = speechSynthesis.getVoices();
  const englishVoice = voices.find(voice => 
    voice.lang.includes('en') && voice.localService
  );
  
  if (englishVoice) {
    currentUtterance.voice = englishVoice;
  }

  if (onEnd) {
    currentUtterance.onend = onEnd;
  }

  // Log for debugging
  console.log('Speaking text:', {
    text,
    voice: currentUtterance.voice?.name,
    lang: currentUtterance.lang
  });

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