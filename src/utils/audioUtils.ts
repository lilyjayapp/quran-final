export const getAudioUrl = (verseNumber: number | undefined, reciter: string) => {
  if (!verseNumber) return "";
  
  // Ensure we're using the correct reciter identifier
  const baseUrl = `https://cdn.islamic.network/quran/audio/128/${reciter}/`;
  const url = `${baseUrl}${verseNumber}.mp3`;
  
  console.log('Audio URL Generation:', {
    reciter,
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
  
  if (audioElement.error) {
    console.log("Error code:", audioElement.error.code);
    console.log("Error message:", audioElement.error.message);
  }
};