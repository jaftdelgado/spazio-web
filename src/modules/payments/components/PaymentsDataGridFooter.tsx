"use client";

import { ArrowLeft01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { usePaymentsTranslation } from "../i18n/usePaymentsTranslation";

type PaymentsDataGridFooterProps = {
  currentPage: number;
  totalCount: number;
  totalPages: number;
  visibleRowCount: number;
  onPageChange: (page: number) => void;
};

function getPageNumbers(
  currentPage: number,
  totalPages: number,
): Array<number | "ellipsis"> {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages: Array<number | "ellipsis"> = [1];

  if (currentPage > 3) {
    pages.push("ellipsis");
  }

  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);

  for (let page = start; page <= end; page += 1) {
    pages.push(page);
  }

  if (currentPage < totalPages - 2) {
    pages.push("ellipsis");
  }

  pages.push(totalPages);

  return pages;
}

export function PaymentsDataGridFooter({
  currentPage,
  totalCount,
  totalPages,
  visibleRowCount,
  onPageChange,
}: PaymentsDataGridFooterProps) {
  const { t } = usePaymentsTranslation();
  const pages = getPageNumbers(currentPage, totalPages);

  return (
    <div className="grid w-full gap-4 md:grid-cols-[auto_1fr] md:items-center">
      <div className="flex flex-wrap items-center gap-2">
        <Button
          disabled={currentPage === 1}
          size="icon-sm"
          type="button"
          variant="outline"
          onClick={() => onPageChange(currentPage - 1)}
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} size={16} strokeWidth={1.8} />
        </Button>

        {pages.map((page, index) =>
          page === "ellipsis" ? (
            <span
              key={`ellipsis-${index}`}
              className="px-2 text-sm text-muted-foreground"
            >
              ...
            </span>
          ) : (
            <Button
              key={page}
              className={cn(
                  "min-w-9 px-0",
                page === currentPage &&
                  "bg-primary text-primary-foreground hover:bg-primary/90",
              )}
              size="sm"
              type="button"
              variant={page === currentPage ? "default" : "outline"}
              onClick={() => onPageChange(page)}
            >
              {page}
            </Button>
          ),
        )}

        <Button
          disabled={currentPage === totalPages}
          size="icon-sm"
          type="button"
          variant="outline"
          onClick={() => onPageChange(currentPage + 1)}
        >
          <HugeiconsIcon icon={ArrowRight01Icon} size={16} strokeWidth={1.8} />
        </Button>
      </div>

      <span className="justify-self-start whitespace-nowrap text-sm leading-none text-muted-foreground md:justify-self-end">
        {t("footer.showing", {
          visibleRowCount,
          totalCount,
        })}
      </span>
    </div>
  );
}
