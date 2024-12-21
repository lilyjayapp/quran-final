import React from "react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Button } from "./ui/button";
import { Search } from "lucide-react";
import { useToast } from "./ui/use-toast";

interface VerseSearchProps {
  verses: {
    number: number;
    text: string;
    translation: string;
  }[];
}

const VerseSearch: React.FC<VerseSearchProps> = ({ verses }) => {
  const [open, setOpen] = React.useState(false);
  const { toast } = useToast();

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const handleSelect = (verseNumber: number) => {
    const verseElement = document.querySelector(`[data-verse="${verseNumber}"]`);
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
        description: `Scrolled to verse ${verseNumber}`,
      });
    }
    setOpen(false);
  };

  // Function to check if a verse contains the exact word
  const matchesSearch = (verse: string, searchTerm: string) => {
    if (!searchTerm) return false;
    const words = verse.toLowerCase().split(/\s+/);
    const searchWords = searchTerm.toLowerCase().split(/\s+/);
    return searchWords.every(searchWord => 
      words.some(word => word.includes(searchWord))
    );
  };

  return (
    <>
      <Button
        variant="outline"
        className="relative w-full justify-start text-sm text-muted-foreground sm:pr-12 md:w-96"
        onClick={() => setOpen(true)}
      >
        <span className="hidden lg:inline-flex">Search in this Surah...</span>
        <span className="inline-flex lg:hidden">Search...</span>
        <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-7 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type to search verses..." />
        <CommandList>
          <CommandEmpty>No verses found.</CommandEmpty>
          <CommandGroup heading="Verses">
            {verses.map((verse) => (
              <CommandItem
                key={verse.number}
                value={`${verse.text} ${verse.translation} ${verse.number}`}
                onSelect={() => handleSelect(verse.number)}
                className="flex flex-col gap-2"
              >
                <div className="flex items-start gap-2">
                  <Search className="h-4 w-4 mt-1" />
                  <div className="flex flex-col gap-1 flex-1">
                    <span className="text-sm">{verse.translation}</span>
                    <span className="text-xs text-muted-foreground arabic-text">
                      {verse.text}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    Verse {verse.number}
                  </span>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
};

export default VerseSearch;