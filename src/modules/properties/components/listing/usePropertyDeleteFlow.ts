"use client";

import * as React from "react";

import { toast } from "sonner";

import { useDeleteProperty } from "@properties/application/delete/hooks/useDeleteProperty";
import type { PropertyCard } from "@properties/domain/property.entity";
import { usePropertiesTranslation } from "@properties/i18n/usePropertiesTranslation";

type PropertyListingDeleteCandidate = Pick<PropertyCard, "propertyUuid" | "title"> & {
  id: string | number;
};

const resolveDeleteErrorMessage = (error: unknown) => {
  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }

  return null;
};

export function usePropertyDeleteFlow() {
  const { t } = usePropertiesTranslation();
  const [propertyPendingDelete, setPropertyPendingDelete] =
    React.useState<PropertyListingDeleteCandidate | null>(null);
  const deletePropertyMutation = useDeleteProperty();

  const handleDeleteConfirm = React.useCallback(async () => {
    if (!propertyPendingDelete) {
      return;
    }

    try {
      await deletePropertyMutation.mutateAsync({
        uuid: propertyPendingDelete.propertyUuid,
        input: { confirm: true },
      });

      toast.success(t("deleteDialog.successTitle"), {
        description: propertyPendingDelete.title
          ? t("deleteDialog.successDescription", {
              propertyTitle: propertyPendingDelete.title,
            })
          : t("deleteDialog.successDescriptionFallback"),
      });

      setPropertyPendingDelete(null);
    } catch (error) {
      toast.error(t("deleteDialog.errorTitle"), {
        description:
          resolveDeleteErrorMessage(error) ?? t("deleteDialog.errorDescription"),
      });
    }
  }, [deletePropertyMutation, propertyPendingDelete, t]);

  return {
    propertyPendingDelete,
    setPropertyPendingDelete,
    handleDeleteConfirm,
    isDeletePending: deletePropertyMutation.isPending,
  };
}
