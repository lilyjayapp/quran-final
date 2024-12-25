import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSurahDetail } from "../services/quranApi";
import AudioPlayer from "../components/AudioPlayer";
import VerseSearch from "../components/VerseSearch";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const SurahPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: surah, isLoading, error } = useSurahDetail(Number(id));
  const [currentVerseNumber, setCurrentVerseNumber] = useState<number | null>(null);

  const handleVerseChange = (verseNumber: number) => {
    setCurrentVerseNumber(verseNumber);
    const verse = document.querySelector(`[data-verse="${verseNumber}"]`);
    if (verse) {
      // Calculate the scroll position to keep the verse at the top with some padding
      const headerHeight = 180; // Adjust this value based on your header height
      const scrollPosition = verse.getBoundingClientRect().top + window.scrollY - headerHeight;
      
      // Smooth scroll to position
      window.scrollTo({
        top: scrollPosition,
        behavior: 'smooth'
      });

      // Log for debugging
      console.log('Scrolling to verse:', {
        verseNumber,
        scrollPosition,
        headerHeight,
        verseTop: verse.getBoundingClientRect().top
      });
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
    <div className="min-h-screen">
      <div className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-gray-200">
        <div className="container mx-auto py-2">
          <div className="flex flex-col gap-1">
            <div className="flex items-center space-x-2 w-full md:justify-center md:max-w-3xl md:mx-auto">
              <Button
                variant="outline"
                onClick={() => navigate('/')}
                className="shrink-0 flex items-center gap-1 text-sm"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Back to Surah List</span>
                <span className="sm:hidden">Back</span>
              </Button>
              <div className="flex-1 md:max-w-md">
                {surah && <VerseSearch verses={surah.verses} />}
              </div>
            </div>
            
            {surah && (
              <div className="flex flex-col gap-1 md:max-w-3xl md:mx-auto">
                <div className="text-center">
                  <h1 className="text-lg font-bold sm:text-xl">{surah.englishName}</h1>
                  <p className="text-gray-600 text-xs sm:text-sm">{surah.englishNameTranslation}</p>
                  <p className="arabic-text text-2xl sm:text-3xl">{surah.name}</p>
                </div>
                <AudioPlayer 
                  verses={surah.verses}
                  currentSurahNumber={surah.number}
                  onVerseChange={handleVerseChange}
                />
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="container pt-48 pb-16">
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
      </div>
    </div>
  );
};

export default SurahPage;
