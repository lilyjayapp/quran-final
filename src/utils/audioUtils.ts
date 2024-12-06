export const getAudioUrl = (verseNumber: number | undefined, language: string, reciter: string) => {
  if (!verseNumber) return "";
  
  let url;
  if (language === "english") {
    url = `https://cdn.islamic.network/quran/audio-translations/128/en.walk/${verseNumber}.mp3`;
  } else {
    url = `https://cdn.islamic.network/quran/audio/128/${reciter}/${verseNumber}.mp3`;
  }
  
  console.log("Generated audio URL:", url);
  console.log("Audio settings:", {
    language,
    reciter,
    verseNumber
  });
  
  return url;
};

export const handleAudioError = (audioElement: HTMLAudioElement | null) => {
  if (!audioElement) return;
  
  console.log("Audio Error Details:");
  console.log("Current audio URL:", audioElement.src);
  console.log("Audio ready state:", audioElement.readyState);
  console.log("Network state:", audioElement.networkState);
};