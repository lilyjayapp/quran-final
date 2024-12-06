import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { reciters } from "@/utils/reciters";

interface ReciterSelectProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

const ReciterSelect: React.FC<ReciterSelectProps> = ({
  value,
  onChange,
  disabled,
}) => {
  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger className="w-[140px] sm:w-[160px]">
        <SelectValue placeholder="Select reciter" />
      </SelectTrigger>
      <SelectContent>
        {reciters.map((reciter) => (
          <SelectItem key={reciter.identifier} value={reciter.identifier}>
            {reciter.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default ReciterSelect;