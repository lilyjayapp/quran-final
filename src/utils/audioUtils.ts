export const getAudioUrl = (verseNumber: number | undefined, language: string) => {
  if (!verseNumber) return "";
  
  const isArabic = language === "ar.alafasy";
  const baseUrl = isArabic 
    ? "https://cdn.islamic.network/quran/audio/128/"
    : "https://cdn.islamic.network/quran/audio-translations/128/";
    
  // Map language codes to supported audio translation codes
  const audioLanguageMap: Record<string, string> = {
    "en.sahih": "en.sahih",
    "en.asad": "en.sahih", // Fallback to sahih for asad translations
    "ar.alafasy": "ar.alafasy"
  };

  const audioLanguage = audioLanguageMap[language] || language;
  console.log('Audio URL Generation:', {
    language,
    mappedLanguage: audioLanguage,
    isArabic,
    url: `${baseUrl}${audioLanguage}/${verseNumber}.mp3`
  });
  
  return `${baseUrl}${audioLanguage}/${verseNumber}.mp3`;
};

export const handleAudioError = (audioElement: HTMLAudioElement | null) => {
  if (!audioElement) return;
  
  console.log("Audio Error Details:");
  console.log("Current audio URL:", audioElement.src);
  console.log("Audio ready state:", audioElement.readyState);
  console.log("Network state:", audioElement.networkState);
  
  if (audioElement.error) {
    console.log("Error code:", audioElement.error.code);
    console.log("Error message:", audioElement.error.message);
  }
};