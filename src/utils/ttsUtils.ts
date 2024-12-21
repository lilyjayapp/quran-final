let speechSynthesis: SpeechSynthesis;
let currentUtterance: SpeechSynthesisUtterance | null = null;

if (typeof window !== 'undefined') {
  speechSynthesis = window.speechSynthesis;
}

// Using Alquran.Cloud API with Ibrahim Walk's English recitation
const ALQURAN_CLOUD_API = "https://api.alquran.cloud/v1/ayah";
const ENGLISH_RECITER = "en.walk"; // Ibrahim Walk's English recitation

export const speak = async (text: string, onEnd?: () => void) => {
  try {
    // Stop any ongoing speech
    stopSpeaking();

    // Check if this is a Quranic verse translation
    const isQuranVerse = text.match(/^(Chapter|Surah|Verse)/i) || 
                        text.includes("Allah") ||
                        text.includes("Muhammad");

    if (isQuranVerse) {
      console.log('Using Alquran.Cloud API for verse:', text);
      const audio = new Audio();
      
      // Use Ibrahim Walk's English recitation
      // Note: The verse number needs to be determined from context
      // For now, we'll use a default verse as an example
      audio.src = `${ALQURAN_CLOUD_API}/1/en.walk`; // Ibrahim Walk's English recitation
      
      audio.onended = () => {
        if (onEnd) onEnd();
      };

      await audio.play();
    } else {
      // For non-Quranic text, use regular TTS
      currentUtterance = new SpeechSynthesisUtterance(text);
      currentUtterance.rate = 0.9;
      currentUtterance.pitch = 1.0;
      currentUtterance.volume = 1;

      if (onEnd) {
        currentUtterance.onend = onEnd;
      }

      speechSynthesis.speak(currentUtterance);
    }
  } catch (error) {
    console.error('Speech synthesis error:', error);
    // Fallback to default TTS if Islamic API fails
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