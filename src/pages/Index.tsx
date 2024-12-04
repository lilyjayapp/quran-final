import React from "react";
import { useSurahs } from "../services/quranApi";
import SurahCard from "../components/SurahCard";

const Index = () => {
  const { data: surahs, isLoading, error } = useSurahs();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading Surahs...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-red-500">Error loading Surahs</div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <h1 className="text-4xl font-bold text-center mb-8">The Noble Quran</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {surahs?.map((surah) => (
          <SurahCard key={surah.number} {...surah} />
        ))}
      </div>
    </div>
  );
};

export default Index;