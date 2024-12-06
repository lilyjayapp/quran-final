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

export const speak = (text: string, onEnd?: () => void, language: string = 'en.asad') => {
  console.log('Starting speech synthesis:', { text, language });
  
  stopSpeaking();
  
  if (!speechSynthesis) {
    console.error('Speech synthesis not supported');
    return;
  }

  const browserLanguage = languageMap[language] || 'en-US';
  console.log('Using browser language:', browserLanguage);

  currentUtterance = new SpeechSynthesisUtterance(text);
  currentUtterance.lang = browserLanguage;
  currentUtterance.rate = 0.9;
  
  currentUtterance.onstart = () => {
    console.log('Speech synthesis started');
  };

  if (onEnd) {
    currentUtterance.onend = () => {
      console.log('Speech synthesis ended, calling onEnd callback');
      onEnd();
    };

    currentUtterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      onEnd(); // Call onEnd even on error to maintain playback chain
    };
  }

  console.log('Speaking utterance...');
  speechSynthesis.speak(currentUtterance);
};

export const stopSpeaking = () => {
  console.log('Stopping speech synthesis');
  if (speechSynthesis) {
    speechSynthesis.cancel();
  }
  currentUtterance = null;
};

export const isSpeaking = () => {
  return speechSynthesis?.speaking || false;
};