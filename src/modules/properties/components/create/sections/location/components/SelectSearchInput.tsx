"use client";

import { Search01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { Input } from "@/components/ui/input";

type SelectSearchInputProps = {
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
};

export function SelectSearchInput({
  placeholder,
  value,
  onChange,
}: SelectSearchInputProps) {
  return (
    <div className="sticky top-0 z-10 bg-popover p-1">
      <div className="relative">
        <HugeiconsIcon
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          color="currentColor"
          icon={Search01Icon}
          size={16}
          strokeWidth={1.8}
        />
        <Input
          className="h-10 border-input bg-background pl-9 text-sm shadow-none"
          placeholder={placeholder}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={(event) => event.stopPropagation()}
        />
      </div>
    </div>
  );
}
