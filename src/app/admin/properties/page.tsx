"use client";

import { Button } from "@heroui/react";

import { PageHeader } from "@components/layout/PageHeader";
import { PropertiesPageContent } from "@properties/components/PropertiesPageContent";
import { usePropertiesTranslation } from "@properties/i18n/usePropertiesTranslation";

export default function AdminPropertiesPage() {
  const { t } = usePropertiesTranslation();

  return (
    <div className="admin-page-view flex min-h-full flex-col gap-6">
      <PageHeader
        title={t("page.title")}
        description={t("page.description")}
        actions={<Button>{t("page.addProperty")}</Button>}
      />
      <PropertiesPageContent />
    </div>
  );
}
