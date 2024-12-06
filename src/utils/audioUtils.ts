export const getAudioUrl = (verseNumber: number | undefined, language: string, reciter: string) => {
  if (!verseNumber) return "";
  
  // Always use Arabic audio since English translations are unavailable
  const url = `https://cdn.islamic.network/quran/audio/128/${reciter}/${verseNumber}.mp3`;
  
  // Log audio settings and URL for debugging
  console.log("Audio settings:", {
    language,
    reciter,
    verseNumber,
    url
  });
  
  return url;
};

export const handleAudioError = (audioElement: HTMLAudioElement | null) => {
  if (!audioElement) return;
  
  console.log("Audio Error Details:");
  console.log("Current audio URL:", audioElement.src);
  console.log("Audio ready state:", audioElement.readyState);
  console.log("Network state:", audioElement.networkState);
  
  // Log browser information for debugging
  console.log("Browser:", navigator.userAgent);
  
  // Log error details if available
  if (audioElement.error) {
    console.log("Error code:", audioElement.error.code);
    console.log("Error message:", audioElement.error.message);
  }

  // Log error object for debugging
  console.error("Audio Error:", {
    _type: audioElement.error?.constructor?.name || "undefined",
    value: audioElement.error || "undefined"
  });
};