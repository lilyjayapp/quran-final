import React from "react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Search } from "lucide-react";

interface Surah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
}

interface SearchBarProps {
  surahs: Surah[];
}

const SearchBar = ({ surahs }: SearchBarProps) => {
  const [open, setOpen] = React.useState(false);
  const navigate = useNavigate();

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

  return (
    <>
      <Button
        variant="outline"
        className="relative w-full justify-start text-sm text-muted-foreground sm:pr-12 md:w-96"
        onClick={() => setOpen(true)}
      >
        <span className="hidden lg:inline-flex">Search surah...</span>
        <span className="inline-flex lg:hidden">Search...</span>
        <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-7 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type surah name or number..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Surahs">
            {surahs.map((surah) => (
              <CommandItem
                key={surah.number}
                value={`${surah.englishName} ${surah.name} ${surah.number}`}
                onSelect={() => {
                  navigate(`/surah/${surah.number}`);
                  setOpen(false);
                }}
              >
                <Search className="mr-2 h-4 w-4" />
                <span>{surah.englishName}</span>
                <span className="ml-2 text-muted-foreground">
                  ({surah.englishNameTranslation})
                </span>
                <span className="ml-auto text-muted-foreground">
                  Chapter {surah.number}
                </span>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
};

export default SearchBar;