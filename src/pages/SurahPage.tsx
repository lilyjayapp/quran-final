import React, { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSurahDetail } from "../services/quranApi";
import AudioPlayer from "../components/AudioPlayer";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const SurahPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: surah, isLoading, error } = useSurahDetail(Number(id));
  const [currentVerseNumber, setCurrentVerseNumber] = useState<number | null>(null);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-32">
        <div className="text-xl">Loading Surah...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-32">
        <div className="text-xl text-red-500">Error loading Surah</div>
      </div>
    );
  }

  return (
    <div className="container pt-32 pb-16">
      <div className="flex justify-between items-center mb-8">
        <Button
          variant="outline"
          onClick={() => navigate('/')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Surah List
        </Button>
      </div>
      
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">{surah?.englishName}</h1>
        <p className="text-gray-600">{surah?.englishNameTranslation}</p>
        <p className="arabic-text text-4xl mt-4">{surah?.name}</p>
      </div>
      
      <div className="max-w-3xl mx-auto">
        {surah?.verses.map((verse) => (
          <div 
            key={verse.number}
            data-verse={verse.number}
            className={`verse-container mb-8 p-4 rounded-lg transition-colors duration-300 ${
              currentVerseNumber === verse.number ? 'bg-primary/10' : ''
            }`}
          >
            <div className="flex justify-between items-start mb-4">
              <span className="bg-primary text-white px-3 py-1 rounded">
                {verse.numberInSurah}
              </span>
            </div>
            <p className="arabic-text text-right mb-4 text-2xl leading-loose">
              {verse.text}
            </p>
            <p className="text-gray-700">{verse.translation}</p>
          </div>
        ))}
      </div>

      {surah && (
        <AudioPlayer 
          verses={surah.verses}
          currentSurahNumber={surah.number}
          onVerseChange={setCurrentVerseNumber}
        />
      )}
    </div>
  );
};

export default SurahPage;