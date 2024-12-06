import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { languages } from "@/utils/languages";

interface AudioLanguageSelectProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

const AudioLanguageSelect = ({
  value,
  onChange,
  disabled,
}: AudioLanguageSelectProps) => {
  return (
    <Select
      value={value}
      onValueChange={onChange}
      disabled={disabled}
    >
      <SelectTrigger className="w-[140px] sm:w-[160px]">
        <SelectValue placeholder="Select language" />
      </SelectTrigger>
      <SelectContent>
        {languages.map((language) => (
          <SelectItem key={language.id} value={language.code}>
            {language.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default AudioLanguageSelect;