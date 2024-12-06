import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AudioLanguageSelectProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

const AudioLanguageSelect: React.FC<AudioLanguageSelectProps> = ({
  value,
  onChange,
  disabled,
}) => {
  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select audio language" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="arabic">Arabic Recitation</SelectItem>
        <SelectItem value="english">English Recitation</SelectItem>
      </SelectContent>
    </Select>
  );
};

export default AudioLanguageSelect;