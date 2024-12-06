import React from "react";
import AudioLanguageSelect from "./AudioLanguageSelect";
import ReciterSelect from "./ReciterSelect";

interface AudioSelectorsProps {
  recitationLanguage: string;
  selectedReciter: string;
  onLanguageChange: (value: string) => void;
  onReciterChange: (value: string) => void;
  isLoading: boolean;
}

const AudioSelectors = ({
  recitationLanguage,
  selectedReciter,
  onLanguageChange,
  onReciterChange,
  isLoading
}: AudioSelectorsProps) => {
  return (
    <div className="flex items-center justify-center gap-4 w-full px-4 sm:px-0 sm:w-auto">
      <AudioLanguageSelect
        value={recitationLanguage}
        onChange={onLanguageChange}
        disabled={isLoading}
      />
      <ReciterSelect
        value={selectedReciter}
        onChange={onReciterChange}
        disabled={isLoading || recitationLanguage !== "ar.alafasy"}
      />
    </div>
  );
};

export default AudioSelectors;