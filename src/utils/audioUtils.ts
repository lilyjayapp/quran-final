export const getAudioUrl = (verseNumber: number | undefined, language: string, reciter: string) => {
  if (!verseNumber) return "";
  
  const baseUrl = "https://cdn.islamic.network/quran/audio/128/";
  const url = `${baseUrl}${reciter}/${verseNumber}.mp3`;
  
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