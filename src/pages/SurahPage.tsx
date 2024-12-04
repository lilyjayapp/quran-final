import React from "react";
import { useParams } from "react-router-dom";
import { useSurahDetail } from "../services/quranApi";
import AudioPlayer from "../components/AudioPlayer";

const SurahPage = () => {
  const { id } = useParams<{ id: string }>();
  const { data: surah, isLoading, error } = useSurahDetail(Number(id));

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading Surah...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-red-500">Error loading Surah</div>
      </div>
    );
  }

  return (
    <div className="container py-8 pb-32">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">{surah?.englishName}</h1>
        <p className="text-gray-600">{surah?.englishNameTranslation}</p>
        <p className="arabic-text text-4xl mt-4">{surah?.name}</p>
      </div>
      
      <div className="max-w-3xl mx-auto">
        {surah?.verses.map((verse) => (
          <div key={verse.number} className="verse-container">
            <div className="flex justify-between items-start mb-4">
              <span className="bg-primary text-white px-3 py-1 rounded">
                {verse.numberInSurah}
              </span>
            </div>
            <p className="arabic-text text-right mb-4">{verse.text}</p>
            <p className="text-gray-700">{verse.translation}</p>
          </div>
        ))}
      </div>

      {surah && (
        <AudioPlayer 
          verses={surah.verses}
          currentSurahNumber={surah.number}
        />
      )}
    </div>
  );
};

export default SurahPage;