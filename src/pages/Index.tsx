import React from "react";
import { useSurahs } from "../services/quranApi";
import SurahCard from "../components/SurahCard";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { reciters, DEFAULT_RECITER } from "../utils/reciters";
import { languages } from "../utils/languages";
import { useToast } from "../components/ui/use-toast";
import SearchBar from "@/components/SearchBar";

const Index = () => {
  const { data: surahs, isLoading, error } = useSurahs();
  const { toast } = useToast();
  const [selectedReciter, setSelectedReciter] = React.useState(() => 
    localStorage.getItem('selectedReciter') || DEFAULT_RECITER
  );
  const [selectedLanguage, setSelectedLanguage] = React.useState(() => 
    localStorage.getItem('selectedLanguage') || languages[1].code
  );

  const handleReciterChange = (value: string) => {
    setSelectedReciter(value);
    localStorage.setItem('selectedReciter', value);
    toast({
      title: "Reciter Changed",
      description: `Selected ${reciters.find(r => r.identifier === value)?.name}`,
    });
  };

  const handleLanguageChange = (value: string) => {
    setSelectedLanguage(value);
    localStorage.setItem('selectedLanguage', value);
    toast({
      title: "Translation Language Changed",
      description: `Selected ${languages.find(l => l.code === value)?.name}`,
    });
  };

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
    <div className="min-h-screen">
      <div className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-gray-200">
        <div className="container mx-auto py-4">
          <div className="flex flex-col gap-4">
            <h1 className="text-4xl font-bold text-center">The Noble Quran</h1>
            <div className="max-w-md mx-auto space-y-4">
              <SearchBar surahs={surahs || []} />
              <Select value={selectedReciter} onValueChange={handleReciterChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a reciter" />
                </SelectTrigger>
                <SelectContent>
                  {reciters.map((reciter) => (
                    <SelectItem key={reciter.id} value={reciter.identifier}>
                      {reciter.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedLanguage} onValueChange={handleLanguageChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select translation language" />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((language) => (
                    <SelectItem key={language.id} value={language.code}>
                      {language.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>
      
      <div className="container pt-64 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {surahs?.map((surah) => (
            <SurahCard key={surah.number} {...surah} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Index;