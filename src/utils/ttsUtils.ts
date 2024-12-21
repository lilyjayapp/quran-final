let speechSynthesis: SpeechSynthesis;
let currentUtterance: SpeechSynthesisUtterance | null = null;

if (typeof window !== 'undefined') {
  speechSynthesis = window.speechSynthesis;
}

const ISLAMIC_NETWORK_API = "https://api.alquran.cloud/v1/ayah";

export const speak = async (text: string, onEnd?: () => void) => {
  try {
    // Stop any ongoing speech
    stopSpeaking();

    // First, try to find if this is a Quranic verse translation
    // by checking for common patterns in the text
    const isQuranVerse = text.match(/^(Chapter|Surah|Verse)/i) || 
                        text.includes("Allah") ||
                        text.includes("Muhammad");

    if (isQuranVerse) {
      // Use Islamic Network's recitation
      console.log('Using Islamic Network recitation for verse:', text);
      const audio = new Audio();
      
      // Use English recitation from Islamic Network
      audio.src = `${ISLAMIC_NETWORK_API}/262/en.walkernewton`; // Walker Newton English recitation
      
      audio.onended = () => {
        if (onEnd) onEnd();
      };

      await audio.play();
    } else {
      // For non-Quranic text, use regular TTS with improved settings
      currentUtterance = new SpeechSynthesisUtterance(text);
      
      // Configure for clear English pronunciation
      currentUtterance.rate = 0.9;
      currentUtterance.pitch = 1.0;
      currentUtterance.volume = 1;

      const voices = speechSynthesis.getVoices();
      
      // Prefer British English voices for clearer pronunciation
      const selectedVoice = voices.find(v => 
        v.lang === 'en-GB' && v.name.includes('Male')
      ) || voices.find(v => 
        v.lang.startsWith('en-') && v.name.includes('Male')
      ) || voices.find(v => 
        v.lang.startsWith('en-')
      );

      if (selectedVoice) {
        currentUtterance.voice = selectedVoice;
        currentUtterance.lang = selectedVoice.lang;
      }

      if (onEnd) {
        currentUtterance.onend = onEnd;
      }

      speechSynthesis.speak(currentUtterance);
    }
  } catch (error) {
    console.error('Speech synthesis error:', error);
    // Fallback to default TTS if Islamic Network API fails
    const fallbackUtterance = new SpeechSynthesisUtterance(text);
    if (onEnd) {
      fallbackUtterance.onend = onEnd;
    }
    speechSynthesis.speak(fallbackUtterance);
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