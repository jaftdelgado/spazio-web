"use client";

import { Note01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

type PropertyShowErrorStateProps = {
  backLabel: string;
  message: string;
  onBack: () => void;
  onRetry: () => void;
  retryLabel: string;
  title: string;
};

export function PropertyShowErrorState({
  backLabel,
  message,
  onBack,
  onRetry,
  retryLabel,
  title,
}: PropertyShowErrorStateProps) {
  return (
    <div className="admin-page-view flex min-h-full flex-col py-6">
      <Empty className="min-h-[420px] rounded-[28px] border border-dashed border-border/70 bg-muted/15">
        <EmptyHeader>
          <EmptyMedia className="bg-destructive/10 text-destructive" variant="icon">
            <HugeiconsIcon icon={Note01Icon} size={24} strokeWidth={1.8} />
          </EmptyMedia>
          <EmptyTitle>{title}</EmptyTitle>
          <EmptyDescription>{message}</EmptyDescription>
        </EmptyHeader>
        <EmptyContent className="flex-row justify-center">
          <Button className="rounded-2xl" variant="outline" onClick={onBack}>
            {backLabel}
          </Button>
          <Button className="rounded-2xl" onClick={onRetry}>
            {retryLabel}
          </Button>
        </EmptyContent>
      </Empty>
    </div>
  );
}
