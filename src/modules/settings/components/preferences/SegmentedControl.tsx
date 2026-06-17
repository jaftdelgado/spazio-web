"use client";

import { Button } from "@/components/ui/button";

type SegmentedControlProps = {
  options: Array<{
    active: boolean;
    label: string;
    onClick: () => void;
  }>;
};

export function SegmentedControl({ options }: SegmentedControlProps) {
  return (
    <div className="inline-flex items-center rounded-full border bg-muted/60 p-0.5">
      {options.map((option) => (
        <Button
          key={option.label}
          type="button"
          variant="ghost"
          size="xs"
          onClick={option.onClick}
          className={
            option.active
              ? "bg-background text-foreground shadow-sm hover:bg-background"
              : "text-muted-foreground hover:text-foreground"
          }
        >
          {option.label}
        </Button>
      ))}
    </div>
  );
}
