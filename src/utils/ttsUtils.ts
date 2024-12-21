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
      audio.src = `${ALQURAN_CLOUD_API}/1/en.walk`;
      
      audio.onended = () => {
        if (onEnd) onEnd();
      };

      await audio.play();
    } else {
      // For non-Quranic text, use Microsoft Edge TTS voices if available
      currentUtterance = new SpeechSynthesisUtterance(text);
      
      // Get available voices and wait if needed
      let voices = speechSynthesis.getVoices();
      if (voices.length === 0) {
        await new Promise<void>(resolve => {
          speechSynthesis.addEventListener('voiceschanged', () => {
            voices = speechSynthesis.getVoices();
            resolve();
          }, { once: true });
        });
      }

      // Log available voices for debugging
      console.log('Available voices:', voices.map(v => ({
        name: v.name,
        lang: v.lang,
        isEdge: v.name.includes('Microsoft'),
        isMale: v.name.toLowerCase().includes('male')
      })));

      // Priority order for voice selection:
      // 1. Microsoft Edge Male English
      // 2. Any Microsoft Edge English
      // 3. Any Male English
      // 4. Default to first English voice
      const selectedVoice = voices.find(v => 
        v.name.includes('Microsoft') && 
        v.name.toLowerCase().includes('male') && 
        v.lang.startsWith('en')
      ) || voices.find(v => 
        v.name.includes('Microsoft') && 
        v.lang.startsWith('en')
      ) || voices.find(v => 
        v.name.toLowerCase().includes('male') && 
        v.lang.startsWith('en')
      ) || voices.find(v => 
        v.lang.startsWith('en')
      );

      if (selectedVoice) {
        console.log('Selected voice:', selectedVoice.name);
        currentUtterance.voice = selectedVoice;
        currentUtterance.lang = selectedVoice.lang;
      }

      // Force very low pitch and slow rate for more masculine sound
      currentUtterance.pitch = 0.1;
      currentUtterance.rate = 0.85;
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