"use client";

import { PageHeader } from "@/components/layout/PageHeader";
import { PaymentsPageContent } from "@/modules/payments/components/PaymentsPageContent";
import { usePaymentsTranslation } from "@/modules/payments/i18n/usePaymentsTranslation";

export default function AdminPaymentsPage() {
  const { t } = usePaymentsTranslation();

  return (
    <div className="admin-page-view flex min-h-full flex-col gap-6">
      <PageHeader
        title={t("page.title")}
        description={t("page.description")}
      />
      <PaymentsPageContent />
    </div>
  );
}
