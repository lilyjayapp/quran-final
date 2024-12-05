import { useQuery } from "@tanstack/react-query";

interface Surah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
}

interface Verse {
  number: number;
  text: string;
  numberInSurah: number;
  audio: string;
}

interface SurahDetail {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  verses: Verse[];
}

export const useSurahs = () => {
  return useQuery({
    queryKey: ["surahs"],
    queryFn: async () => {
      const response = await fetch("https://api.alquran.cloud/v1/surah");
      const data = await response.json();
      return data.data as Surah[];
    },
  });
};

export const useSurahDetail = (surahNumber: number) => {
  const selectedLanguage = localStorage.getItem('selectedLanguage') || 'en.asad';
  
  return useQuery({
    queryKey: ["surah", surahNumber, selectedLanguage],
    queryFn: async () => {
      console.log(`Fetching surah ${surahNumber} with translation ${selectedLanguage}`);
      
      try {
        const [arabicResponse, translationResponse] = await Promise.all([
          fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}/ar.alafasy`),
          fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}/${selectedLanguage}`),
        ]);

        if (!arabicResponse.ok) {
          throw new Error(`Arabic API error: ${arabicResponse.status}`);
        }
        if (!translationResponse.ok) {
          throw new Error(`Translation API error: ${translationResponse.status}`);
        }

        const arabicData = await arabicResponse.json();
        const translationData = await translationResponse.json();

        console.log("Arabic Response Status:", arabicResponse.status);
        console.log("Translation Response Status:", translationResponse.status);
        console.log("Arabic Data:", arabicData);
        console.log("Translation Data:", translationData);

        if (!arabicData.data || !arabicData.data.ayahs) {
          throw new Error('Invalid Arabic data structure');
        }
        if (!translationData.data || !translationData.data.ayahs) {
          throw new Error('Invalid translation data structure');
        }

        const verses = arabicData.data.ayahs.map((verse: any, index: number) => {
          const translation = translationData.data.ayahs[index]?.text || "Translation unavailable";
          return {
            number: verse.number,
            text: verse.text,
            numberInSurah: verse.numberInSurah,
            translation: translation,
            audio: `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${verse.number}.mp3`,
          };
        });

        return {
          ...arabicData.data,
          verses,
        } as SurahDetail;
      } catch (error) {
        console.error('Error fetching surah:', error);
        throw error;
      }
    },
    retry: 1,
  });
};