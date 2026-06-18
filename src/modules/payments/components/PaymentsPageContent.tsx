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
  type CheckoutContext,
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
import { CheckoutPaymentModal } from "./CheckoutPaymentModal";
import { useContractsList } from "@/modules/contracts/application/hooks/useContracts";
import { contractsHttpAdapter } from "@/modules/contracts/infra/contracts.http-adapter";
import {
  buildPaymentPropertyOptions,
  buildPaymentStatusOptions,
  filterPaymentRows,
  paginatePaymentRows,
  type PaymentFilterFormState,
  type PaymentPropertyOption,
} from "./payments-page.filters";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type PaymentColumnId =
  | "property"
  | "billingPeriod"
  | "dueDate"
  | "amount"
  | "currency"
  | "paymentMethod"
  | "actions";

type PaymentGridRow = DataGridRowBase & PaymentListItem & {
  isSimulated?: boolean;
  propertyTitle?: string;
};
type LoadingPaymentGridRow = DataGridRowBase & {
  isLoading: true;
};
type PaymentsTableRow = PaymentGridRow | LoadingPaymentGridRow;

const DEFAULT_PAGE_SIZE = 20;
const RAW_FETCH_LIMIT = 100;
const LOADING_ROW_COUNT = 8;
const chipClassName =
  "inline-flex rounded-full border border-border/70 bg-muted/30 px-2.5 py-1 text-xs font-medium text-muted-foreground";

function isLoadingRow(row: PaymentsTableRow): row is LoadingPaymentGridRow {
  return "isLoading" in row;
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

function extractCalendarDate(value: string | null) {
  if (!value) {
    return null;
  }

  const match = value.trim().match(/^(\d{4})-(\d{2})-(\d{2})/);

  if (!match) {
    return null;
  }

  return {
    year: Number(match[1]),
    month: Number(match[2]),
    day: Number(match[3]),
  };
}

function formatCalendarDate(
  value: string | null,
  locale: string,
  fallback: string,
  options?: Intl.DateTimeFormatOptions,
) {
  const calendarDate = extractCalendarDate(value);

  if (!calendarDate) {
    return formatDate(value, locale, fallback, options);
  }

  const date = new Date(
    Date.UTC(calendarDate.year, calendarDate.month - 1, calendarDate.day),
  );

  return new Intl.DateTimeFormat(locale, {
    ...options,
    timeZone: "UTC",
  }).format(date);
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
      value: formatCalendarDate(
        detail.billingPeriod,
        locale,
        fallback,
        { year: "numeric", month: "long" },
      ),
    },
    {
      label: t("detail.fields.dueDate"),
      value: formatCalendarDate(
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

function formatDateUTC(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function addPeriodToDate(dateStr: string, periodName: string | undefined): string {
  const date = new Date(dateStr);
  const normalized = (periodName || "").toLowerCase().trim();
  if (normalized.includes("daily") || normalized.includes("diario")) {
    date.setUTCDate(date.getUTCDate() + 1);
  } else if (normalized.includes("weekly") || normalized.includes("semanal")) {
    date.setUTCDate(date.getUTCDate() + 7);
  } else if (normalized.includes("yearly") || normalized.includes("anual")) {
    date.setUTCFullYear(date.getUTCFullYear() + 1);
  } else {
    // default: monthly
    date.setUTCMonth(date.getUTCMonth() + 1);
  }
  return formatDateUTC(date);
}

export function PaymentsPageContent() {
  const { t, intlLocale } = usePaymentsTranslation();
  const { role } = useAuth();
  const canAccess = role === 1 || role === 2 || role === 3;
  const isSpanish = intlLocale.toLowerCase().startsWith("es");

  const [page, setPage] = React.useState(1);
  const [isRetrying, setIsRetrying] = React.useState(false);
  const [selectedPaymentUuid, setSelectedPaymentUuid] = React.useState("");
  const [isDetailOpen, setIsDetailOpen] = React.useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = React.useState(false);
  const [checkoutContext, setCheckoutContext] =
    React.useState<CheckoutContext | null>(null);
  const [payingContractUuid, setPayingContractUuid] = React.useState<string | null>(
    null,
  );
  const [filterForm, setFilterForm] = React.useState<PaymentFilterFormState>({
    propertyValue: "",
    statusValue: "",
    dateFrom: "",
    dateTo: "",
  });
  const [appliedFilters, setAppliedFilters] =
    React.useState<PaymentFilterFormState>({
      propertyValue: "",
      statusValue: "",
      dateFrom: "",
      dateTo: "",
    });

  const queryFilters = React.useMemo<PaymentListFilters>(
    () => ({
      limit: RAW_FETCH_LIMIT,
      offset: 0,
    }),
    [],
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
  const contractsQuery = useContractsList(
    { page: 1, limit: 100 },
    canAccess && role === 3,
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

  const simulatedRows = React.useMemo<PaymentGridRow[]>(() => {
    if (!canAccess || !contractsQuery.data) return [];

    const list: PaymentGridRow[] = [];
    const actualPayments = paymentsQuery.data?.data ?? [];

    for (const contract of contractsQuery.data) {
      const statusLower = contract.status.toLowerCase();
      const isDraft = statusLower === "draft" || statusLower === "borrador";
      const isActiveRent =
        (statusLower === "active" || statusLower === "activo") &&
        contract.transactionType === "rent";

      if (isDraft) {
        const hasActualPayment = actualPayments.some((p) => {
          const pTitle = propertyTitleById[p.propertyId];
          return pTitle === contract.propertyTitle && p.currency === contract.currency;
        });
        if (!hasActualPayment) {
          list.push({
            id: contract.contractUuid,
            paymentUuid: `simulated-${contract.contractUuid}-initial`,
            contractId: 0,
            propertyId: 0,
            propertyTitle: contract.propertyTitle,
            billingPeriod: contract.startDate,
            dueDate: contract.startDate,
            amount: contract.agreedAmount,
            currency: contract.currency,
            paymentMethod: "-",
            gateway: "-",
            status: "Pending",
            paymentDate: null,
            isSimulated: true,
          });
        }
      } else if (isActiveRent) {
        const completed = actualPayments.filter((p) => {
          const pTitle = propertyTitleById[p.propertyId];
          const isMatch = pTitle === contract.propertyTitle && p.currency === contract.currency;
          return (
            isMatch &&
            p.status &&
            ["completed", "completado", "approved", "aprobado", "success", "exitoso"].includes(
              p.status.toLowerCase(),
            )
          );
        });

        let lastBillingPeriod = contract.startDate;
        if (completed.length > 0) {
          completed.sort(
            (a, b) =>
              new Date(b.billingPeriod).getTime() -
              new Date(a.billingPeriod).getTime(),
          );
          lastBillingPeriod = completed[0].billingPeriod;
        }

        const nextBillingPeriod = addPeriodToDate(lastBillingPeriod, undefined);

        const alreadyHasPayment = actualPayments.some((p) => {
          const pTitle = propertyTitleById[p.propertyId];
          return pTitle === contract.propertyTitle && p.billingPeriod === nextBillingPeriod;
        });

        if (!alreadyHasPayment) {
          list.push({
            id: contract.contractUuid,
            paymentUuid: `simulated-${contract.contractUuid}-${nextBillingPeriod}`,
            contractId: 0,
            propertyId: 0,
            propertyTitle: contract.propertyTitle,
            billingPeriod: nextBillingPeriod,
            dueDate: nextBillingPeriod,
            amount: contract.agreedAmount,
            currency: contract.currency,
            paymentMethod: "-",
            gateway: "-",
            status: "Pending",
            paymentDate: null,
            isSimulated: true,
          });
        }
      }
    }

    return list;
  }, [canAccess, contractsQuery.data, paymentsQuery.data?.data, propertyTitleById]);

  const allRows = React.useMemo<PaymentGridRow[]>(
    () => [
      ...simulatedRows,
      ...(paymentsQuery.data?.data ?? []).map((item) => ({
        id: item.paymentUuid,
        ...item,
        propertyTitle: propertyTitleById[item.propertyId],
      })),
    ],
    [paymentsQuery.data?.data, propertyTitleById, simulatedRows],
  );

  const propertyOptions = React.useMemo(
    () =>
      buildPaymentPropertyOptions({
        properties: propertiesQuery.data?.data ?? [],
        rows: allRows,
        contracts: contractsQuery.data ?? [],
      }),
    [allRows, contractsQuery.data, propertiesQuery.data?.data],
  );

  const statusOptions = React.useMemo(
    () =>
      buildPaymentStatusOptions(allRows).map((option) => ({
        ...option,
        label:
          option.value === "pending"
            ? isSpanish
              ? "Pendiente"
              : "Pending"
            : option.value === "completed"
              ? isSpanish
                ? "Completado"
                : "Completed"
              : option.value === "approved"
                ? isSpanish
                  ? "Aprobado"
                  : "Approved"
                : option.value === "failed"
                  ? isSpanish
                    ? "Fallido"
                    : "Failed"
                  : option.value === "cancelled"
                    ? isSpanish
                      ? "Cancelado"
                      : "Cancelled"
                    : option.label,
      })),
    [allRows, isSpanish],
  );

  const selectedAppliedProperty = React.useMemo<PaymentPropertyOption | undefined>(
    () =>
      propertyOptions.find(
        (option) => option.value === appliedFilters.propertyValue,
      ),
    [appliedFilters.propertyValue, propertyOptions],
  );

  const filteredRows = React.useMemo(
    () =>
      filterPaymentRows({
        rows: allRows,
        filters: appliedFilters,
        selectedProperty: selectedAppliedProperty,
      }),
    [allRows, appliedFilters, selectedAppliedProperty],
  );

  const currentPage = Math.min(page, Math.max(1, Math.ceil(filteredRows.length / DEFAULT_PAGE_SIZE)));

  const rows = React.useMemo(
    () => paginatePaymentRows(filteredRows, currentPage, DEFAULT_PAGE_SIZE),
    [currentPage, filteredRows],
  );

  const totalCount = filteredRows.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / DEFAULT_PAGE_SIZE));

  const isLoadingAll =
    paymentsQuery.isLoading || (role === 3 && contractsQuery.isLoading);

  const rowsToRender = React.useMemo<PaymentsTableRow[]>(
    () =>
      isLoadingAll
        ? Array.from({ length: LOADING_ROW_COUNT }, (_, index) => ({
            id: `loading-${index}`,
            isLoading: true as const,
          }))
        : rows,
    [isLoadingAll, rows],
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
        width: 240,
        minWidth: 240,
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
      propertyValue: "",
      statusValue: "",
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
              {row.isSimulated
                ? row.propertyTitle || t("labels.property")
                : propertyTitleById[row.propertyId] || t("labels.property")}
            </span>
          );
        case "billingPeriod":
          return formatCalendarDate(
            row.billingPeriod,
            intlLocale,
            t("labels.notAvailable"),
            { year: "numeric", month: "long" },
          );
        case "dueDate":
          return formatCalendarDate(
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
        case "actions": {
          const isPending = !row.paymentDate ||
            ["pending", "pendiente", "unpaid"].includes(row.status?.toLowerCase());
          const isPayingThis = payingContractUuid === row.id;

          return (
            <div className="flex w-full justify-end gap-2">
              {isPending && role === 3 && (
                <Button
                  className="rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90"
                  size="sm"
                  type="button"
                  disabled={payingContractUuid !== null}
                  onClick={async () => {
                    if (row.isSimulated) {
                      setPayingContractUuid(row.id);
                      try {
                        const detail = await contractsHttpAdapter.getById(row.id);
                        setCheckoutContext({
                          contractId: detail.contractId,
                          contractUuid: detail.contractUuid,
                          currency: detail.currency,
                          amount: Number(detail.agreedAmount),
                        });
                        setIsCheckoutOpen(true);
                      } catch (err) {
                        console.error(err);
                      } finally {
                        setPayingContractUuid(null);
                      }
                    } else {
                      setCheckoutContext({
                        contractId: row.contractId,
                        contractUuid: "",
                        currency: row.currency,
                        amount: Number(row.amount),
                      });
                      setIsCheckoutOpen(true);
                    }
                  }}
                >
                  <HugeiconsIcon
                    icon={isPayingThis ? NoteIcon : CreditCardIcon}
                    size={16}
                    strokeWidth={1.8}
                    className={isPayingThis ? "animate-spin" : ""}
                  />
                  <span>{isPayingThis ? "Cargando..." : "Pagar"}</span>
                </Button>
              )}
              {!row.isSimulated && (
                <Button
                  className="rounded-2xl"
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
              )}
            </div>
          );
        }
        default:
          return null;
      }
    },
    [intlLocale, payingContractUuid, propertyTitleById, role, t],
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
            <Select
              value={filterForm.propertyValue || undefined}
              onValueChange={(value) =>
                setFilterForm((current) => ({
                  ...current,
                  propertyValue: value,
                }))
              }
            >
              <SelectTrigger
                id="payments-property-id"
                className="h-10 rounded-2xl"
              >
                <SelectValue placeholder={t("filters.propertyIdPlaceholder")} />
              </SelectTrigger>
              <SelectContent>
                {propertyOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label
              className="text-xs font-medium uppercase tracking-wide text-muted-foreground"
              htmlFor="payments-status-id"
            >
              {t("filters.statusId")}
            </label>
            <Select
              value={filterForm.statusValue || undefined}
              onValueChange={(value) =>
                setFilterForm((current) => ({
                  ...current,
                  statusValue: value,
                }))
              }
            >
              <SelectTrigger
                id="payments-status-id"
                className="h-10 rounded-2xl"
              >
                <SelectValue placeholder={t("filters.statusIdPlaceholder")} />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
                    : row.isSimulated
                    ? row.propertyTitle || t("labels.property")
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
                  currentPage={currentPage}
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

          <AlertDialogFooter className="flex items-center gap-2">
            {paymentDetailQuery.data && role === 3 &&
              (!paymentDetailQuery.data.paymentDate || 
               ["pending", "pendiente", "unpaid"].includes(paymentDetailQuery.data.status?.toLowerCase())) && (
              <Button
                className="rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90"
                type="button"
                onClick={() => {
                  setIsDetailOpen(false);
                  setCheckoutContext({
                    contractId: paymentDetailQuery.data.contractId,
                    contractUuid: "",
                    currency: paymentDetailQuery.data.currency,
                    amount: Number(paymentDetailQuery.data.amount),
                  });
                  setIsCheckoutOpen(true);
                }}
              >
                <HugeiconsIcon
                  icon={CreditCardIcon}
                  size={16}
                  strokeWidth={1.8}
                />
                <span>Pagar Ahora</span>
              </Button>
            )}
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

      <CheckoutPaymentModal
        isOpen={isCheckoutOpen}
        onOpenChange={setIsCheckoutOpen}
        checkout={checkoutContext}
        onSuccess={() => {
          void paymentsQuery.refetch();
          if (selectedPaymentUuid) {
            void paymentDetailQuery.refetch();
          }
        }}
      />
    </>
  );
}
