"use client";

import { Pagination } from "@heroui/react";
import { usePropertiesTranslation } from "@properties/i18n/usePropertiesTranslation";

type PropertiesDataGridFooterProps = {
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

export function PropertiesDataGridFooter({
  currentPage,
  totalCount,
  totalPages,
  visibleRowCount,
  onPageChange,
}: PropertiesDataGridFooterProps) {
  const { t } = usePropertiesTranslation();
  const pages = getPageNumbers(currentPage, totalPages);

  return (
    <div className="grid w-full grid-cols-[auto_1fr] items-center gap-4 rounded-xl">
      <Pagination className="min-w-0" size="sm">
        <Pagination.Content>
          <Pagination.Item>
            <Pagination.Previous
              isDisabled={currentPage === 1}
              onPress={() => onPageChange(currentPage - 1)}
            >
              <Pagination.PreviousIcon />
            </Pagination.Previous>
          </Pagination.Item>

          {pages.map((page, index) =>
            page === "ellipsis" ? (
              <Pagination.Item key={`ellipsis-${index}`}>
                <Pagination.Ellipsis />
              </Pagination.Item>
            ) : (
              <Pagination.Item key={page}>
                <Pagination.Link
                  isActive={page === currentPage}
                  onPress={() => onPageChange(page)}
                >
                  {page}
                </Pagination.Link>
              </Pagination.Item>
            ),
          )}

          <Pagination.Item>
            <Pagination.Next
              isDisabled={currentPage === totalPages}
              onPress={() => onPageChange(currentPage + 1)}
            >
              <Pagination.NextIcon />
            </Pagination.Next>
          </Pagination.Item>
        </Pagination.Content>
      </Pagination>

      <span className="justify-self-end whitespace-nowrap text-sm leading-none text-slate-600">
        {t("footer.showing", {
          visibleRowCount,
          totalCount,
        })}
      </span>
    </div>
  );
}
