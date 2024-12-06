export const getAudioUrl = (verseNumber: number | undefined, language: string, reciter: string) => {
  if (!verseNumber) {
    console.error("No verse number provided for audio URL");
    return "";
  }
  
  // Use HTTPS for the CDN URL
  const baseUrl = "https://cdn.islamic.network/quran/audio/128/";
  const url = `${baseUrl}${reciter}/${verseNumber}.mp3`;
  
  // Log audio settings and URL for debugging
  console.log("Audio URL generated:", {
    language,
    reciter,
    verseNumber,
    url
  });
  
  return url;
};

export const handleAudioError = (audioElement: HTMLAudioElement | null) => {
  if (!audioElement) return;
  
  console.error("Audio Error Details:", {
    currentUrl: audioElement.src,
    readyState: audioElement.readyState,
    networkState: audioElement.networkState,
    error: audioElement.error
  });
};