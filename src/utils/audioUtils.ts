export const getAudioUrl = (verseNumber: number | undefined, language: string, reciter: string) => {
  if (!verseNumber) return "";
  
  let url;
  if (language === "english") {
    url = `https://cdn.islamic.network/quran/audio-translations/128/en.walk/${verseNumber}.mp3`;
  } else {
    url = `https://cdn.islamic.network/quran/audio/128/${reciter}/${verseNumber}.mp3`;
  }
  
  // Log audio settings and URL for debugging
  console.log("Audio settings:", {
    language,
    reciter,
    verseNumber
  });
  console.log("Generated audio URL:", url);
  
  return url;
};

export const handleAudioError = (audioElement: HTMLAudioElement | null) => {
  if (!audioElement) return;
  
  console.log("Audio Error Details:");
  console.log("Current audio URL:", audioElement.src);
  console.log("Audio ready state:", audioElement.readyState);
  console.log("Network state:", audioElement.networkState);
  console.log("Error code:", audioElement.error?.code);
  console.log("Error message:", audioElement.error?.message);
  console.log("Browser:", navigator.userAgent);

  // Log the error object for debugging
  console.error("Audio Error:", {
    _type: audioElement.error?.constructor?.name || "undefined",
    value: audioElement.error || "undefined"
  });
};