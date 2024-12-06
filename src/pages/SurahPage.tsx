import React, { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSurahDetail } from "../services/quranApi";
import AudioPlayer from "../components/AudioPlayer";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home } from "lucide-react";

const SurahPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: surah, isLoading, error } = useSurahDetail(Number(id));
  const [currentVerseNumber, setCurrentVerseNumber] = useState<number | null>(null);
  const verseRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});

  useEffect(() => {
    if (currentVerseNumber && verseRefs.current[currentVerseNumber]) {
      console.log("Scrolling to verse:", currentVerseNumber);
      verseRefs.current[currentVerseNumber]?.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }, [currentVerseNumber]);

  const handleVerseChange = (verseNumber: number) => {
    console.log("Verse changed to:", verseNumber);
    // Find the corresponding verse in the current surah
    const verse = surah?.verses.find(v => v.numberInSurah === verseNumber);
    if (verse) {
      setCurrentVerseNumber(verse.number);
    }
  };

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
      <div className="flex justify-between mb-4">
        <Button
          variant="outline"
          onClick={() => navigate('/')}
          className="flex items-center gap-2"
        >
          <Home className="h-4 w-4" />
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
            ref={el => verseRefs.current[verse.number] = el}
            className={`verse-container ${currentVerseNumber === verse.number ? 'bg-primary/10' : ''}`}
          >
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
          onVerseChange={handleVerseChange}
        />
      )}
    </div>
  );
};

export default SurahPage;