import React from "react";
import { useNavigate } from "react-router-dom";

interface SurahCardProps {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
}

const SurahCard: React.FC<SurahCardProps> = ({
  number,
  name,
  englishName,
  englishNameTranslation,
  numberOfAyahs,
}) => {
  const navigate = useNavigate();

  return (
    <div className="surah-card" onClick={() => navigate(`/surah/${number}`)}>
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center">
            {number}
          </div>
          <div>
            <h3 className="text-xl font-semibold">{englishName}</h3>
            <p className="text-gray-600">{englishNameTranslation}</p>
          </div>
        </div>
        <div className="arabic-text text-primary">{name}</div>
      </div>
      <p className="mt-2 text-sm text-gray-500">{numberOfAyahs} verses</p>
    </div>
  );
};

export default SurahCard;