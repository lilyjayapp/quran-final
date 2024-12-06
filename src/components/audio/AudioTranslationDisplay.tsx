import React from "react";

interface AudioTranslationDisplayProps {
  translation: string;
}

const AudioTranslationDisplay: React.FC<AudioTranslationDisplayProps> = ({ translation }) => {
  return (
    <div className="text-sm text-gray-600">
      {translation}
    </div>
  );
};

export default AudioTranslationDisplay;