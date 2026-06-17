"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePropertiesTranslation } from "@properties/i18n/usePropertiesTranslation";

type PropertyPricingCardProps = {
  items: { label: string; value: string; note?: string }[];
};

export function PropertyPricingCard({ items }: PropertyPricingCardProps) {
  const { t } = usePropertiesTranslation();

  return (
    <Card className="rounded-[28px] border-0 bg-background shadow-none ring-1 ring-border/60">
      <CardHeader className="pb-0">
        <CardTitle className="text-xl font-semibold">
          {t("show.sections.pricingTitle")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.length > 0 ? (
          items.map((item) => (
            <div
              key={`${item.label}-${item.value}`}
              className="rounded-[22px] bg-muted/30 px-4 py-4"
            >
              <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                {item.label}
              </p>
              <p className="mt-2 text-2xl font-semibold text-foreground">
                {item.value}
              </p>
              {item.note ? (
                <p className="mt-1 text-sm text-muted-foreground">{item.note}</p>
              ) : null}
            </div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">{t("show.pricingEmpty")}</p>
        )}
      </CardContent>
    </Card>
  );
}
