let speechSynthesis: SpeechSynthesis;
let currentUtterance: SpeechSynthesisUtterance | null = null;

if (typeof window !== 'undefined') {
  speechSynthesis = window.speechSynthesis;
}

// Using Tarteel.ai API for Islamic recitation
const TARTEEL_API = "https://api.tarteel.ai/v1/speech";
const FALLBACK_API = "https://api.alquran.cloud/v1/ayah";

export const speak = async (text: string, onEnd?: () => void) => {
  try {
    // Stop any ongoing speech
    stopSpeaking();

    // Check if this is a Quranic verse translation
    const isQuranVerse = text.match(/^(Chapter|Surah|Verse)/i) || 
                        text.includes("Allah") ||
                        text.includes("Muhammad");

    if (isQuranVerse) {
      console.log('Using Tarteel API for verse:', text);
      const audio = new Audio();
      
      // Try Tarteel.ai first
      try {
        const response = await fetch(`${TARTEEL_API}/synthesize`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text: text,
            voice: 'male_english', // Specifically request male voice
            speed: 1.0
          })
        });

        if (response.ok) {
          const audioBlob = await response.blob();
          audio.src = URL.createObjectURL(audioBlob);
        } else {
          throw new Error('Tarteel API failed');
        }
      } catch (error) {
        console.log('Fallback to Alquran.Cloud API');
        // Fallback to Alquran.Cloud
        audio.src = `${FALLBACK_API}/1/ar.alafasy`; // Using Mishary Rashid Alafasy's recitation
      }
      
      audio.onended = () => {
        if (onEnd) onEnd();
      };

      await audio.play();
    } else {
      // For non-Quranic text, try to use a male voice
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

      // Try to find a deep male voice
      const maleVoice = voices.find(v => 
        v.name.toLowerCase().includes('male') && 
        v.lang === 'en-GB'
      ) || voices.find(v =>
        v.name.toLowerCase().includes('male')
      );

      if (maleVoice) {
        currentUtterance.voice = maleVoice;
      }

      // Force very low pitch and slow rate
      currentUtterance.pitch = 0.1;
      currentUtterance.rate = 0.8;
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