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
  
  // Configure for deeper male voice
  currentUtterance.rate = 0.85;
  currentUtterance.pitch = 0.6; // Much lower pitch for male voice
  currentUtterance.volume = 1;

  // Wait for voices to be loaded
  const loadVoices = () => {
    const voices = speechSynthesis.getVoices();
    
    // Log all available voices for debugging
    console.log('All available voices:', voices.map(v => ({
      name: v.name,
      lang: v.lang,
      default: v.default,
      localService: v.localService
    })));

    // Explicitly look for known male voices
    const knownMaleVoices = [
      'Microsoft David',
      'Google UK English Male',
      'Microsoft Mark',
      'Microsoft James',
      'en-US-Standard-B', // Google Cloud male voice
      'en-GB-Standard-B'  // Google Cloud male voice
    ];

    // Try to find a male voice
    const selectedVoice = 
      // First try known male voices
      voices.find(v => knownMaleVoices.some(male => v.name.includes(male))) ||
      // Then try any voice with "male" in the name
      voices.find(v => v.name.toLowerCase().includes('male')) ||
      // Then try deeper voices (often male)
      voices.find(v => v.name.includes('David') || v.name.includes('James') || v.name.includes('Mark')) ||
      // Fallback to first English voice
      voices.find(v => v.lang.startsWith('en'));

    if (selectedVoice) {
      console.log('Selected voice:', {
        name: selectedVoice.name,
        lang: selectedVoice.lang,
        default: selectedVoice.default,
        localService: selectedVoice.localService
      });
      
      currentUtterance.voice = selectedVoice;
      currentUtterance.lang = selectedVoice.lang;
    } else {
      console.warn('No suitable male voice found, using default voice');
    }

    // Log final utterance configuration
    console.log('Final TTS configuration:', {
      voice: currentUtterance.voice?.name,
      lang: currentUtterance.lang,
      pitch: currentUtterance.pitch,
      rate: currentUtterance.rate
    });

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