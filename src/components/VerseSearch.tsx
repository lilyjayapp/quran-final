import React, { useState } from "react";
import { Search } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useToast } from "./ui/use-toast";

interface VerseSearchProps {
  verses: {
    number: number;
    text: string;
    translation: string;
  }[];
}

const VerseSearch: React.FC<VerseSearchProps> = ({ verses }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchTerm.trim()) {
      return;
    }

    const searchTermLower = searchTerm.toLowerCase();
    const foundVerse = verses.find(verse => 
      verse.text.toLowerCase().includes(searchTermLower) || 
      verse.translation.toLowerCase().includes(searchTermLower)
    );

    if (foundVerse) {
      const verseElement = document.querySelector(`[data-verse="${foundVerse.number}"]`);
      if (verseElement) {
        verseElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
        
        // Highlight effect
        verseElement.classList.add('bg-primary/20');
        setTimeout(() => {
          verseElement.classList.remove('bg-primary/20');
        }, 2000);

        toast({
          title: "Verse found",
          description: `Scrolled to verse ${foundVerse.number}`,
        });
      }
    } else {
      toast({
        title: "No matches found",
        description: "Try a different search term",
        variant: "destructive",
      });
    }
  };

  return (
    <form onSubmit={handleSearch} className="flex gap-2">
      <Input
        type="text"
        placeholder="Search in this Surah..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full md:w-64"
      />
      <Button type="submit" variant="outline" size="icon">
        <Search className="h-4 w-4" />
      </Button>
    </form>
  );
};

export default VerseSearch;