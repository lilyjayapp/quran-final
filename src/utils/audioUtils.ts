export const getAudioUrl = (verseNumber: number | undefined, reciter: string) => {
  if (!verseNumber) return "";
  
  const isArabic = reciter.startsWith("ar.");
  const baseUrl = `https://cdn.islamic.network/quran/audio/128/${reciter}/`;
    
  // For now, only support Arabic audio as English audio translations are not consistently available
  console.log('Audio URL Generation:', {
    reciter,
    isArabic,
    url: `${baseUrl}${verseNumber}.mp3`
  });
  
  return `${baseUrl}${verseNumber}.mp3`;
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