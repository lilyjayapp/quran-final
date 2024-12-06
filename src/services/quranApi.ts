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

const API_BASE_URL = "https://api.alquran.cloud/v1";

export const useSurahs = () => {
  return useQuery({
    queryKey: ["surahs"],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/surah`);
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
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
          fetch(`${API_BASE_URL}/surah/${surahNumber}/ar.alafasy`),
          fetch(`${API_BASE_URL}/surah/${surahNumber}/${selectedLanguage}`),
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

        // Enhanced debugging logs
        console.log("Arabic Data Structure:", {
          surahNumber: arabicData.data.number,
          numberOfVerses: arabicData.data.numberOfAyahs,
          firstVerse: arabicData.data.ayahs?.[0],
          lastVerse: arabicData.data.ayahs?.[arabicData.data.ayahs.length - 1]
        });

        console.log("Translation Data Structure:", {
          surahNumber: translationData.data.number,
          numberOfVerses: translationData.data.numberOfAyahs,
          firstVerse: translationData.data.ayahs?.[0],
          lastVerse: translationData.data.ayahs?.[translationData.data.ayahs.length - 1]
        });

        // Validate data structure
        if (!arabicData.data?.ayahs || !translationData.data?.ayahs) {
          console.error("Invalid API response structure:", {
            hasArabicAyahs: !!arabicData.data?.ayahs,
            hasTranslationAyahs: !!translationData.data?.ayahs
          });
          throw new Error("Invalid API response structure");
        }

        // Check for length mismatch
        if (arabicData.data.ayahs.length !== translationData.data.ayahs.length) {
          console.error("Verse count mismatch:", {
            arabicVerses: arabicData.data.ayahs.length,
            translationVerses: translationData.data.ayahs.length
          });
          return {
            ...arabicData.data,
            verses: arabicData.data.ayahs.map((verse: any) => ({
              number: verse.number,
              text: verse.text,
              numberInSurah: verse.numberInSurah,
              translation: "Translation unavailable due to verse count mismatch",
              audio: `${API_BASE_URL}/audio/128/ar.alafasy/${verse.number}.mp3`,
            })),
          };
        }

        // Map verses with translations
        const verses = arabicData.data.ayahs.map((verse: any, index: number) => {
          const translation = translationData.data.ayahs[index]?.text;
          if (!translation) {
            console.warn(`Missing translation for verse ${verse.number}`);
          }
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