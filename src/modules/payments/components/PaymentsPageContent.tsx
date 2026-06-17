"use client";

import * as React from "react";

import {
  Alert02Icon,
  ArrowRight01Icon,
  Building03Icon,
  Calendar03Icon,
  CreditCardIcon,
  DollarCircleIcon,
  NoteIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DataGrid,
  type DataGridColumn,
  type DataGridRowBase,
} from "@/components/core/DataGrid";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { HttpError } from "@/lib/http/http-errors";
import { useAuth } from "@/lib/auth/useAuth";
import { usePropertyList } from "@/modules/properties/application/get/hooks/useProperty";
import {
  type PaymentDetail,
  type PaymentListFilters,
  type PaymentListItem,
} from "../domain/payments.entity";
import {
  usePaymentDetail,
  usePaymentsList,
} from "../application/hooks/usePayments";
import { usePaymentsTranslation } from "../i18n/usePaymentsTranslation";
import { PaymentsDataGridFooter } from "./PaymentsDataGridFooter";

type PaymentColumnId =
  | "property"
  | "billingPeriod"
  | "dueDate"
  | "amount"
  | "currency"
  | "paymentMethod"
  | "actions";

type PaymentGridRow = DataGridRowBase & PaymentListItem;
type LoadingPaymentGridRow = DataGridRowBase & {
  isLoading: true;
};
type PaymentsTableRow = PaymentGridRow | LoadingPaymentGridRow;
type PaymentFilterFormState = {
  propertyId: string;
  statusId: string;
  dateFrom: string;
  dateTo: string;
};

const DEFAULT_PAGE_SIZE = 20;
const LOADING_ROW_COUNT = 8;
const chipClassName =
  "inline-flex rounded-full border border-border/70 bg-muted/30 px-2.5 py-1 text-xs font-medium text-muted-foreground";

function isLoadingRow(row: PaymentsTableRow): row is LoadingPaymentGridRow {
  return "isLoading" in row;
}

function parseOptionalNumber(value: string) {
  const trimmed = value.trim();

  if (trimmed.length === 0) {
    return undefined;
  }

  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function getPaymentErrorKey(error: unknown) {
  if (error instanceof HttpError) {
    if (error.status === 401) return "errors.unauthorized";
    if (error.status === 403) return "errors.forbidden";
    if (error.status === 404) return "errors.notFound";
    if (error.status >= 500) return "errors.server";
    const body = error.body as { error?: string } | null;
    if (body?.error && body.error.trim() !== "") {
      return body.error;
    }
  }

  if (error instanceof TypeError) {
    return "errors.network";
  }

  return "errors.unknown";
}

function resolvePaymentErrorMessage(
  error: unknown,
  t: ReturnType<typeof usePaymentsTranslation>["t"],
) {
  const errorKey = getPaymentErrorKey(error);
  return errorKey.includes(".") ? t(errorKey as never) : errorKey;
}

function formatDate(
  value: string | null,
  locale: string,
  fallback: string,
  options?: Intl.DateTimeFormatOptions,
) {
  if (!value) {
    return fallback;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return fallback;
  }

  return new Intl.DateTimeFormat(locale, options).format(date);
}

function formatCurrency(value: number, currency: string, locale: string) {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function columnLabel(
  icon: React.ComponentProps<typeof HugeiconsIcon>["icon"],
  label: string,
) {
  return (
    <span className="flex items-center gap-2 text-muted-foreground">
      <HugeiconsIcon className="h-4 w-4 shrink-0" icon={icon} />
      <span>{label}</span>
    </span>
  );
}

function renderLoadingCell(columnId: PaymentColumnId) {
  switch (columnId) {
    case "property":
    case "paymentMethod":
      return <Skeleton className="h-4 w-28 rounded-full" />;
    case "billingPeriod":
    case "dueDate":
      return <Skeleton className="h-4 w-24 rounded-full" />;
    case "amount":
      return <Skeleton className="ml-auto h-4 w-24 rounded-full" />;
    case "currency":
      return <Skeleton className="h-6 w-20 rounded-full" />;
    case "actions":
      return <Skeleton className="ml-auto h-9 w-24 rounded-2xl" />;
    default:
      return null;
  }
}

function PaymentDetailSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {Array.from({ length: 12 }).map((_, index) => (
        <div key={index} className="space-y-2">
          <Skeleton className="h-3 w-24 rounded-full" />
          <Skeleton className="h-5 w-full rounded-full" />
        </div>
      ))}
    </div>
  );
}

function PaymentDetailFields({
  detail,
  locale,
}: {
  detail: PaymentDetail;
  locale: string;
}) {
  const { t } = usePaymentsTranslation();
  const fallback = t("labels.notAvailable");

  const fields: Array<{ label: string; value: string }> = [
    {
      label: t("detail.fields.transactionType"),
      value: detail.transactionType || fallback,
    },
    {
      label: t("detail.fields.billingPeriod"),
      value: formatDate(
        detail.billingPeriod,
        locale,
        fallback,
        { year: "numeric", month: "long" },
      ),
    },
    {
      label: t("detail.fields.dueDate"),
      value: formatDate(
        detail.dueDate,
        locale,
        fallback,
        { dateStyle: "medium" },
      ),
    },
    {
      label: t("detail.fields.agreedAmount"),
      value: formatCurrency(detail.agreedAmount, detail.currency, locale),
    },
    {
      label: t("detail.fields.amount"),
      value: formatCurrency(detail.amount, detail.currency, locale),
    },
    {
      label: t("detail.fields.currency"),
      value: detail.currency || fallback,
    },
    {
      label: t("detail.fields.paymentMethod"),
      value: detail.paymentMethod || fallback,
    },
    {
      label: t("detail.fields.gateway"),
      value: detail.gateway || fallback,
    },
    {
      label: t("detail.fields.status"),
      value: detail.status || fallback,
    },
    {
      label: t("detail.fields.paymentDate"),
      value: formatDate(
        detail.paymentDate,
        locale,
        t("labels.unpaid"),
        { dateStyle: "medium", timeStyle: "short" },
      ),
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {fields.map((field) => (
        <div
          key={field.label}
                className="border border-border/70 bg-muted/15 px-4 py-3"
        >
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {field.label}
          </p>
          <p className="mt-1 break-all text-sm font-medium text-foreground">
            {field.value}
          </p>
        </div>
      ))}
    </div>
  );
}

export function PaymentsPageContent() {
  const { t, intlLocale } = usePaymentsTranslation();
  const { role } = useAuth();
  const canAccess = role === 1 || role === 2;

  const [page, setPage] = React.useState(1);
  const [isRetrying, setIsRetrying] = React.useState(false);
  const [selectedPaymentUuid, setSelectedPaymentUuid] = React.useState("");
  const [isDetailOpen, setIsDetailOpen] = React.useState(false);
  const [filterForm, setFilterForm] = React.useState<PaymentFilterFormState>({
    propertyId: "",
    statusId: "",
    dateFrom: "",
    dateTo: "",
  });
  const [appliedFilters, setAppliedFilters] =
    React.useState<PaymentFilterFormState>({
    propertyId: "",
    statusId: "",
    dateFrom: "",
    dateTo: "",
  });

  const queryFilters = React.useMemo<PaymentListFilters>(
    () => ({
      propertyId: parseOptionalNumber(appliedFilters.propertyId),
      statusId: parseOptionalNumber(appliedFilters.statusId),
      dateFrom: appliedFilters.dateFrom || undefined,
      dateTo: appliedFilters.dateTo || undefined,
      limit: DEFAULT_PAGE_SIZE,
      offset: (page - 1) * DEFAULT_PAGE_SIZE,
    }),
    [appliedFilters, page],
  );

  const paymentsQuery = usePaymentsList(queryFilters);
  const propertiesQuery = usePropertyList(
    {
      page: 1,
      pageSize: 100,
      sort: "created_at",
      order: "desc",
    },
    canAccess,
  );
  const paymentDetailQuery = usePaymentDetail(
    selectedPaymentUuid,
    isDetailOpen && selectedPaymentUuid.length > 0,
  );

  const totalCount = paymentsQuery.data?.meta.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / DEFAULT_PAGE_SIZE));

  const rows = React.useMemo<PaymentGridRow[]>(
    () =>
      (paymentsQuery.data?.data ?? []).map((item) => ({
        id: item.paymentUuid,
        ...item,
      })),
    [paymentsQuery.data?.data],
  );
  const propertyTitleById = React.useMemo(
    () =>
      Object.fromEntries(
        (propertiesQuery.data?.data ?? []).map((property) => [
          property.propertyId,
          property.title,
        ]),
      ) as Record<number, string>,
    [propertiesQuery.data?.data],
  );

  const rowsToRender = React.useMemo<PaymentsTableRow[]>(
    () =>
      paymentsQuery.isLoading
        ? Array.from({ length: LOADING_ROW_COUNT }, (_, index) => ({
            id: `loading-${index}`,
            isLoading: true as const,
          }))
        : rows,
    [paymentsQuery.isLoading, rows],
  );

  const columns = React.useMemo<DataGridColumn<PaymentColumnId>[]>(
    () => [
      {
        id: "property",
        label: columnLabel(Building03Icon, t("columns.property")),
        width: 170,
        minWidth: 150,
      },
      {
        id: "billingPeriod",
        label: columnLabel(Calendar03Icon, t("columns.billingPeriod")),
        width: 180,
        minWidth: 170,
      },
      {
        id: "dueDate",
        label: columnLabel(Calendar03Icon, t("columns.dueDate")),
        width: 170,
        minWidth: 150,
      },
      {
        id: "amount",
        label: columnLabel(DollarCircleIcon, t("columns.amount")),
        width: 160,
        minWidth: 150,
        align: "right",
      },
      {
        id: "currency",
        label: columnLabel(CreditCardIcon, t("columns.currency")),
        width: 110,
        minWidth: 100,
      },
      {
        id: "paymentMethod",
        label: columnLabel(NoteIcon, t("columns.paymentMethod")),
        width: 200,
        minWidth: 170,
      },
      {
        id: "actions",
        label: "",
        width: 148,
        minWidth: 148,
        align: "right",
        sticky: "right",
      },
    ],
    [t],
  );

  const handleRetry = React.useCallback(async () => {
    setIsRetrying(true);

    try {
      await paymentsQuery.refetch();
    } finally {
      setIsRetrying(false);
    }
  }, [paymentsQuery]);

  const handleApplyFilters = React.useCallback(() => {
    setPage(1);
    setAppliedFilters(filterForm);
  }, [filterForm]);

  const handleClearFilters = React.useCallback(() => {
    const cleared = {
      propertyId: "",
      statusId: "",
      dateFrom: "",
      dateTo: "",
    };

    setFilterForm(cleared);
    setAppliedFilters(cleared);
    setPage(1);
  }, []);

  const renderCell = React.useCallback(
    (row: PaymentsTableRow, columnId: PaymentColumnId) => {
      if (isLoadingRow(row)) {
        return renderLoadingCell(columnId);
      }

      switch (columnId) {
        case "property":
          return (
            <span className="font-medium text-foreground">
              {propertyTitleById[row.propertyId] || t("labels.property")}
            </span>
          );
        case "billingPeriod":
          return formatDate(
            row.billingPeriod,
            intlLocale,
            t("labels.notAvailable"),
            { year: "numeric", month: "long" },
          );
        case "dueDate":
          return formatDate(
            row.dueDate,
            intlLocale,
            t("labels.notAvailable"),
            { dateStyle: "medium" },
          );
        case "amount":
          return (
            <span className="tabular-nums text-foreground">
              {formatCurrency(row.amount, row.currency, intlLocale)}
            </span>
          );
        case "currency":
          return <span className={chipClassName}>{row.currency}</span>;
        case "paymentMethod":
          return (
            <span className="block truncate text-muted-foreground">
              {row.paymentMethod || t("labels.notAvailable")}
            </span>
          );
        case "actions":
          return (
            <div className="flex w-full justify-end">
              <Button
                className=""
                size="sm"
                type="button"
                variant="outline"
                onClick={() => {
                  setSelectedPaymentUuid(row.paymentUuid);
                  setIsDetailOpen(true);
                }}
              >
                <HugeiconsIcon
                  icon={ArrowRight01Icon}
                  size={16}
                  strokeWidth={1.8}
                />
                <span>{t("actions.viewDetails")}</span>
              </Button>
            </div>
          );
        default:
          return null;
      }
    },
    [intlLocale, propertyTitleById, t],
  );

  if (!canAccess) {
    return null;
  }

  return (
    <>
      <div className="flex min-h-0 flex-1 flex-col gap-4">
        <div className="grid gap-3 rounded-3xl border border-border/70 bg-background/80 p-4 md:grid-cols-2 xl:grid-cols-[repeat(4,minmax(0,1fr))_auto_auto]">
          <div className="space-y-2">
            <label
              className="text-xs font-medium uppercase tracking-wide text-muted-foreground"
              htmlFor="payments-property-id"
            >
              {t("filters.propertyId")}
            </label>
            <Input
              id="payments-property-id"
              inputMode="numeric"
              placeholder={t("filters.propertyIdPlaceholder")}
              value={filterForm.propertyId}
              onChange={(event) =>
                setFilterForm((current) => ({
                  ...current,
                  propertyId: event.target.value,
                }))
              }
            />
          </div>

          <div className="space-y-2">
            <label
              className="text-xs font-medium uppercase tracking-wide text-muted-foreground"
              htmlFor="payments-status-id"
            >
              {t("filters.statusId")}
            </label>
            <Input
              id="payments-status-id"
              inputMode="numeric"
              placeholder={t("filters.statusIdPlaceholder")}
              value={filterForm.statusId}
              onChange={(event) =>
                setFilterForm((current) => ({
                  ...current,
                  statusId: event.target.value,
                }))
              }
            />
          </div>

          <div className="space-y-2">
            <label
              className="text-xs font-medium uppercase tracking-wide text-muted-foreground"
              htmlFor="payments-date-from"
            >
              {t("filters.dateFrom")}
            </label>
            <Input
              id="payments-date-from"
              type="date"
              value={filterForm.dateFrom}
              onChange={(event) =>
                setFilterForm((current) => ({
                  ...current,
                  dateFrom: event.target.value,
                }))
              }
            />
          </div>

          <div className="space-y-2">
            <label
              className="text-xs font-medium uppercase tracking-wide text-muted-foreground"
              htmlFor="payments-date-to"
            >
              {t("filters.dateTo")}
            </label>
            <Input
              id="payments-date-to"
              type="date"
              value={filterForm.dateTo}
              onChange={(event) =>
                setFilterForm((current) => ({
                  ...current,
                  dateTo: event.target.value,
                }))
              }
            />
          </div>

          <div className="flex items-end">
            <Button
              className="w-full xl:w-auto"
              type="button"
              onClick={handleApplyFilters}
            >
              {t("filters.apply")}
            </Button>
          </div>

          <div className="flex items-end">
            <Button
              className="w-full xl:w-auto"
              type="button"
              variant="outline"
              onClick={handleClearFilters}
            >
              {t("filters.clear")}
            </Button>
          </div>
        </div>

        {paymentsQuery.isError ? (
          <Empty className="min-h-0 flex-1 rounded-3xl border border-dashed border-border/70 bg-muted/15 p-6">
            <EmptyHeader>
              <EmptyMedia className="bg-destructive/10 text-destructive" variant="icon">
                <HugeiconsIcon icon={Alert02Icon} size={24} strokeWidth={1.8} />
              </EmptyMedia>
              <EmptyTitle>{t("states.loadErrorTitle")}</EmptyTitle>
              <EmptyDescription>
                {resolvePaymentErrorMessage(paymentsQuery.error, t)}
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button
                className=""
                disabled={isRetrying}
                size="sm"
                type="button"
                onClick={() => {
                  void handleRetry();
                }}
              >
                {t("states.retry")}
              </Button>
            </EmptyContent>
          </Empty>
        ) : !paymentsQuery.isLoading && rows.length === 0 ? (
          <Empty className="min-h-60 rounded-3xl border border-dashed border-border/70 bg-muted/15 p-6">
            <EmptyHeader>
              <EmptyTitle>{t("states.emptyTitle")}</EmptyTitle>
              <EmptyDescription>{t("states.emptyDescription")}</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="flex min-h-0 flex-1 flex-col gap-4">
            <div className="min-h-0 flex-1">
              <DataGrid<PaymentsTableRow, PaymentColumnId>
                columns={columns}
                fillAvailableHeight
                getRowLabel={(row) =>
                  isLoadingRow(row)
                    ? t("states.loadingRowLabel")
                    : propertyTitleById[row.propertyId] || t("labels.property")
                }
                renderCell={renderCell}
                rows={rowsToRender}
                tableContainerClassName="rounded-3xl [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              />
            </div>
            <div className="shrink-0">
              {paymentsQuery.data ? (
                <PaymentsDataGridFooter
                  currentPage={page}
                  onPageChange={setPage}
                  totalCount={totalCount}
                  totalPages={totalPages}
                  visibleRowCount={rows.length}
                />
              ) : (
                <div className="grid w-full grid-cols-[auto_1fr] items-center gap-4">
                  <div className="flex items-center gap-2">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Skeleton key={index} className="h-9 w-9 rounded-2xl" />
                    ))}
                  </div>
                  <Skeleton className="h-4 w-48 justify-self-end rounded-full" />
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <AlertDialog
        open={isDetailOpen}
        onOpenChange={(open) => {
          setIsDetailOpen(open);
          if (!open) {
            setSelectedPaymentUuid("");
          }
        }}
      >
        <AlertDialogContent className="max-w-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle>{t("detail.title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("detail.description")}
            </AlertDialogDescription>
          </AlertDialogHeader>

          {paymentDetailQuery.isLoading ? (
            <PaymentDetailSkeleton />
          ) : paymentDetailQuery.isError ? (
            <Empty className="min-h-60 rounded-3xl border border-dashed border-border/70 bg-muted/15 p-6">
              <EmptyHeader>
                <EmptyMedia className="bg-destructive/10 text-destructive" variant="icon">
                  <HugeiconsIcon icon={Alert02Icon} size={20} strokeWidth={1.8} />
                </EmptyMedia>
                <EmptyTitle>{t("detail.loadErrorTitle")}</EmptyTitle>
                <EmptyDescription>
                  {resolvePaymentErrorMessage(paymentDetailQuery.error, t)}
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : paymentDetailQuery.data ? (
            <PaymentDetailFields
              detail={paymentDetailQuery.data}
              locale={intlLocale}
            />
          ) : null}

          <AlertDialogFooter>
            <Button
              className=""
              type="button"
              variant="outline"
              onClick={() => setIsDetailOpen(false)}
            >
              {t("actions.close")}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
