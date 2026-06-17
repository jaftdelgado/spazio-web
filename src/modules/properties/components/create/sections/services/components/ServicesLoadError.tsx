"use client";

import { Alert02Icon } from "@hugeicons/core-free-icons";
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
import { HttpError } from "@lib/http/http-errors";
import { usePropertiesTranslation } from "@properties/i18n/usePropertiesTranslation";

function getServicesErrorMessage(error: unknown) {
  if (error instanceof HttpError) {
    if (error.status === 401 || error.status === 403) {
      return "Tu sesion ya no permite cargar los servicios. Vuelve a iniciar sesion e intentalo de nuevo.";
    }

    if (error.status >= 500) {
      return "No pudimos cargar los servicios disponibles por un problema del servidor. Intentalo nuevamente en unos minutos.";
    }
  }

  return "No pudimos cargar los servicios disponibles para esta propiedad.";
}

type ServicesLoadErrorProps = {
  error: unknown;
  isRetrying: boolean;
  onRetry: () => void;
};

export function ServicesLoadError({
  error,
  isRetrying,
  onRetry,
}: ServicesLoadErrorProps) {
  const { t } = usePropertiesTranslation();

  return (
    <Empty className="min-h-40 rounded-3xl border border-dashed border-border bg-card px-6 py-8">
      <EmptyHeader>
        <EmptyMedia
          className="bg-destructive/10 text-destructive"
          variant="icon"
        >
          <HugeiconsIcon icon={Alert02Icon} size={20} strokeWidth={1.8} />
        </EmptyMedia>
        <EmptyTitle>{t("states.loadErrorTitle")}</EmptyTitle>
        <EmptyDescription className="max-w-lg">
          {getServicesErrorMessage(error)}
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button
          className="rounded-2xl"
          disabled={isRetrying}
          size="sm"
          type="button"
          onClick={onRetry}
        >
          {t("states.retry")}
        </Button>
      </EmptyContent>
    </Empty>
  );
}
