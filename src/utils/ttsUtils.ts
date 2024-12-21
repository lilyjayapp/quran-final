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
  currentUtterance.pitch = 0.8; // Even lower pitch for male voice
  currentUtterance.volume = 1;

  // Wait for voices to be loaded
  const loadVoices = () => {
    const voices = speechSynthesis.getVoices();
    
    // Filter for English male voices first
    const maleVoices = voices.filter(voice => 
      voice.lang.startsWith('en') && (
        // Common identifiers for male voices
        voice.name.toLowerCase().includes('male') ||
        voice.name.includes('David') ||
        voice.name.includes('James') ||
        voice.name.includes('John') ||
        voice.name.includes('Paul')
      )
    );

    // Log available voices for debugging
    console.log('Available male voices:', maleVoices.map(v => ({
      name: v.name,
      lang: v.lang
    })));

    // Select the best available voice
    const selectedVoice = 
      // Try Microsoft David first
      voices.find(v => v.name.includes('David')) ||
      // Then any Microsoft male voice
      voices.find(v => v.name.includes('Microsoft') && v.name.toLowerCase().includes('male')) ||
      // Then any Google male voice
      voices.find(v => v.name.includes('Google') && v.name.toLowerCase().includes('male')) ||
      // Then any male voice
      maleVoices[0] ||
      // Fallback to any English voice
      voices.find(v => v.lang.startsWith('en'));

    if (selectedVoice) {
      console.log('Selected voice:', selectedVoice.name);
      currentUtterance.voice = selectedVoice;
      // Adjust language to match selected voice
      currentUtterance.lang = selectedVoice.lang;
    }

    if (onEnd) {
      currentUtterance.onend = onEnd;
    }

    // Log for debugging
    console.log('Speaking text:', {
      text,
      voice: currentUtterance.voice?.name,
      lang: currentUtterance.lang,
      rate: currentUtterance.rate,
      pitch: currentUtterance.pitch
    });

    speechSynthesis.speak(currentUtterance);
  };

  // Handle voice loading
  if (speechSynthesis.getVoices().length > 0) {
    loadVoices();
  } else {
    speechSynthesis.addEventListener('voiceschanged', loadVoices, { once: true });
  }
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