"use client";

import { Button } from "@heroui/react";
import { useRouter } from "next/navigation";

import { PageHeader } from "@components/layout/PageHeader";
import { ROUTES } from "@/config/routes";
import { PropertiesPageContent } from "@properties/components/listing/PropertiesPageContent";
import { usePropertiesTranslation } from "@properties/i18n/usePropertiesTranslation";

export default function AdminPropertiesPage() {
  const { t } = usePropertiesTranslation();
  const router = useRouter();

  return (
    <div className="admin-page-view flex min-h-full flex-col gap-6">
      <PageHeader
        title={t("page.title")}
        description={t("page.description")}
        actions={
          <Button onPress={() => router.push(ROUTES.admin.propertiesCreate)}>
            {t("page.addProperty")}
          </Button>
        }
      />
      <PropertiesPageContent />
    </div>
  );
}
