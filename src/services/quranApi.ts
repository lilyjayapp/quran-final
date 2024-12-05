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
  translation: string;
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
  
  console.log("Selected Language Code:", selectedLanguage);
  
  return useQuery({
    queryKey: ["surah", surahNumber, selectedLanguage],
    queryFn: async () => {
      console.log(`Fetching surah ${surahNumber} with translation ${selectedLanguage}`);
      
      try {
        // Fetch both Arabic and translation data in parallel
        const [arabicResponse, translationResponse] = await Promise.all([
          fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}/ar.alafasy`),
          fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}/${selectedLanguage}`),
        ]);

        // Check if both responses are successful
        if (!arabicResponse.ok) {
          throw new Error(`Arabic API error: ${arabicResponse.status}`);
        }
        if (!translationResponse.ok) {
          throw new Error(`Translation API error: ${translationResponse.status}`);
        }

        const arabicData = await arabicResponse.json();
        const translationData = await translationResponse.json();

        // Log response data for debugging
        console.log("Arabic Data:", arabicData);
        console.log("Translation Data:", translationData);
        console.log("Translation Language:", selectedLanguage);
        console.log("Number of Arabic verses:", arabicData.data.ayahs.length);
        console.log("Number of Translation verses:", translationData.data.ayahs.length);

        // Check for data validity and length mismatch
        if (!arabicData.data?.ayahs || !translationData.data?.ayahs) {
          throw new Error("Invalid API response structure");
        }

        if (arabicData.data.ayahs.length !== translationData.data.ayahs.length) {
          console.error("Mismatch between Arabic and translation Ayahs");
          return {
            ...arabicData.data,
            verses: arabicData.data.ayahs.map((verse: any) => ({
              number: verse.number,
              text: verse.text,
              numberInSurah: verse.numberInSurah,
              translation: "Translation unavailable due to verse count mismatch",
              audio: `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${verse.number}.mp3`,
            })),
          };
        }

        // Map verses with translations
        const verses = arabicData.data.ayahs.map((verse: any, index: number) => {
          const translation = translationData.data.ayahs[index]?.text;
          return {
            number: verse.number,
            text: verse.text,
            numberInSurah: verse.numberInSurah,
            translation: translation || "Translation unavailable",
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