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
      audio.src = `${ALQURAN_CLOUD_API}/1/en.walk`;
      
      audio.onended = () => {
        if (onEnd) onEnd();
      };

      await audio.play();
    } else {
      // For non-Quranic text, use regular TTS with forced male voice settings
      currentUtterance = new SpeechSynthesisUtterance(text);
      
      // Get available voices
      const voices = speechSynthesis.getVoices();
      console.log('Available voices:', voices.map(v => ({
        name: v.name,
        lang: v.lang,
        gender: v.name.toLowerCase().includes('male') ? 'male' : 'female'
      })));

      // Try to find a male voice in this order:
      // 1. British English Male
      // 2. Any English Male
      // 3. Any Male voice
      const maleVoice = voices.find(v => 
        v.lang === 'en-GB' && v.name.toLowerCase().includes('male')
      ) || voices.find(v => 
        v.lang.startsWith('en') && v.name.toLowerCase().includes('male')
      ) || voices.find(v => 
        v.name.toLowerCase().includes('male')
      );

      if (maleVoice) {
        console.log('Selected male voice:', maleVoice.name);
        currentUtterance.voice = maleVoice;
        currentUtterance.lang = maleVoice.lang;
      } else {
        console.log('No male voice found, using default voice');
      }

      // Force very low pitch to simulate male voice if no male voice is found
      currentUtterance.pitch = 0.1;
      currentUtterance.rate = 0.9;
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