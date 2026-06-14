"use client";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
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
          <Button
            className="h-10 rounded-2xl px-4"
            onClick={() => router.push(ROUTES.admin.propertiesCreate)}
          >
            {t("page.addProperty")}
          </Button>
        }
      />
      <PropertiesPageContent />
    </div>
  );
}
