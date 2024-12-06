let speechSynthesis: SpeechSynthesis;
let currentUtterance: SpeechSynthesisUtterance | null = null;

if (typeof window !== 'undefined') {
  speechSynthesis = window.speechSynthesis;
}

const languageMap: { [key: string]: string } = {
  'ar.alafasy': 'ar-SA',
  'en.asad': 'en-US',
  'fr.hamidullah': 'fr-FR',
  'es.asad': 'es-ES',
  'tr.ates': 'tr-TR',
  'id.indonesian': 'id-ID',
  'ur.jalandhry': 'ur-PK',
  'de.aburida': 'de-DE',
  'ru.kuliev': 'ru-RU',
  'zh.jian': 'zh-CN',
  'fa.ansarian': 'fa-IR',
  'bn.bengali': 'bn-BD',
  'hi.hindi': 'hi-IN',
  'ml.abdulhameed': 'ml-IN',
  'ta.tamil': 'ta-IN'
};

export const speak = (text: string, onEnd?: () => void) => {
  stopSpeaking();
  
  if (!speechSynthesis) {
    console.error('Speech synthesis not supported');
    return;
  }

  const selectedLanguage = localStorage.getItem('selectedLanguage') || 'en.asad';
  const browserLanguage = languageMap[selectedLanguage] || 'en-US';
  
  console.log('Using language for speech:', browserLanguage);

  currentUtterance = new SpeechSynthesisUtterance(text);
  currentUtterance.lang = browserLanguage;
  currentUtterance.rate = 0.9; // Slightly slower for better clarity
  currentUtterance.onend = () => {
    if (onEnd) onEnd();
  };

  currentUtterance.onerror = (event) => {
    console.error('Speech synthesis error:', event);
  };

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