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
  
  // Force very low pitch and slow rate for male-like voice
  currentUtterance.rate = 0.8;
  currentUtterance.pitch = 0.1; // Extremely low pitch to force male-like voice
  currentUtterance.volume = 1;

  // Wait for voices to be loaded
  const loadVoices = () => {
    const voices = speechSynthesis.getVoices();
    
    // Log all available voices for debugging
    console.log('Available voices:', voices.map(v => ({
      name: v.name,
      lang: v.lang,
      default: v.default,
      localService: v.localService,
      voiceURI: v.voiceURI
    })));

    // Strict prioritization of male voices
    let selectedVoice = null;
    
    // First priority: Microsoft David
    selectedVoice = voices.find(v => v.name === 'Microsoft David Desktop');
    
    // Second priority: Any Microsoft male voice
    if (!selectedVoice) {
      selectedVoice = voices.find(v => 
        v.name.includes('Microsoft') && 
        (v.name.includes('David') || v.name.includes('Mark') || v.name.includes('James'))
      );
    }
    
    // Third priority: Any Google male voice
    if (!selectedVoice) {
      selectedVoice = voices.find(v => 
        v.name.includes('Google') && v.name.toLowerCase().includes('male')
      );
    }
    
    // Fourth priority: Any voice with 'male' in the name
    if (!selectedVoice) {
      selectedVoice = voices.find(v => 
        v.name.toLowerCase().includes('male')
      );
    }
    
    // Last resort: First English voice, but force very low pitch
    if (!selectedVoice) {
      selectedVoice = voices.find(v => v.lang.startsWith('en'));
      if (selectedVoice) {
        console.warn('No male voice found, using first English voice with very low pitch');
      }
    }

    if (selectedVoice) {
      console.log('Selected voice:', {
        name: selectedVoice.name,
        lang: selectedVoice.lang,
        default: selectedVoice.default,
        localService: selectedVoice.localService,
        voiceURI: selectedVoice.voiceURI
      });
      
      currentUtterance.voice = selectedVoice;
      currentUtterance.lang = selectedVoice.lang;
    }

    // Log final configuration
    console.log('Final TTS configuration:', {
      voice: currentUtterance.voice?.name,
      lang: currentUtterance.lang,
      pitch: currentUtterance.pitch,
      rate: currentUtterance.rate
    });

    if (onEnd) {
      currentUtterance.onend = onEnd;
    }

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