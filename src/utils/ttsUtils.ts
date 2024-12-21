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
  currentUtterance.pitch = 0.9; // Slightly lower pitch for male voice
  currentUtterance.volume = 1;
  currentUtterance.lang = 'en-US';

  // Wait for voices to be loaded
  const loadVoices = () => {
    const voices = speechSynthesis.getVoices();
    console.log('Available voices:', voices.map(v => ({ name: v.name, lang: v.lang, gender: v.voiceURI.toLowerCase().includes('male') ? 'male' : 'female' })));
    
    // Try to find a good male English voice in this order:
    // 1. Microsoft David
    // 2. Google US English Male
    // 3. Any male English voice
    // 4. Any English voice as fallback
    const preferredVoice = voices.find(voice => 
      voice.name.includes('David') && voice.lang.includes('en')
    ) || voices.find(voice =>
      voice.name.includes('Google') && voice.name.toLowerCase().includes('male') && voice.lang.includes('en')
    ) || voices.find(voice =>
      voice.voiceURI.toLowerCase().includes('male') && voice.lang.includes('en')
    ) || voices.find(voice =>
      voice.lang.includes('en')
    );

    if (preferredVoice) {
      console.log('Selected voice:', preferredVoice.name);
      currentUtterance.voice = preferredVoice;
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