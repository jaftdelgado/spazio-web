"use client";

import * as React from "react";
import {
  Alert02Icon,
  ArrowRight01Icon,
  Building03Icon,
  Calendar03Icon,
  CreditCardIcon,
  Download01Icon,
  NoteIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

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
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/lib/auth/useAuth";
import { HttpError } from "@/lib/http/http-errors";
import { useContractsList } from "../application/hooks/useContracts";
import { useContractsTranslation } from "../i18n/useContractsTranslation";
import { contractsHttpAdapter } from "../infra/contracts.http-adapter";
import type { ContractListItemEntity } from "../domain/contracts.entity";

type ContractsPageContentProps = {
  viewMode?: "client" | "admin";
};

type ContractColumnId =
  | "propertyTitle"
  | "transactionType"
  | "agreedAmount"
  | "startDate"
  | "status"
  | "actions";

type ContractGridRow = DataGridRowBase & ContractListItemEntity;

type LoadingContractGridRow = DataGridRowBase & {
  isLoading: true;
};

type ContractsTableRow = ContractGridRow | LoadingContractGridRow;

const DEFAULT_PAGE_SIZE = 10;
const LOADING_ROW_COUNT = 5;
const chipClassName =
  "inline-flex rounded-full border border-border/70 bg-muted/30 px-2.5 py-1 text-xs font-medium text-muted-foreground";

function isLoadingRow(row: ContractsTableRow): row is LoadingContractGridRow {
  return "isLoading" in row;
}

function formatDate(value: string | null, locale: string, fallback: string) {
  if (!value) return fallback;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return fallback;

  return new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(date);
}

function formatCurrency(value: number, currency: string, locale: string) {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
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

function normalizeContractStatus(status: string) {
  return status
    .replace(/^status[._-]/i, "")
    .trim()
    .toLowerCase();
}

function getContractStatusFallback(status: string, locale: string) {
  const isSpanish = locale.toLowerCase().startsWith("es");

  const labels: Record<string, { es: string; en: string }> = {
    draft: {
      es: "Borrador",
      en: "Draft",
    },
    active: {
      es: "Activo",
      en: "Active",
    },
    inactive: {
      es: "Inactivo",
      en: "Inactive",
    },
    pending: {
      es: "Pendiente",
      en: "Pending",
    },
    completed: {
      es: "Completado",
      en: "Completed",
    },
    closed: {
      es: "Cerrado",
      en: "Closed",
    },
  };

  const label = labels[status];

  if (!label) {
    return status;
  }

  return isSpanish ? label.es : label.en;
}

function resolveContractText(value: string, fallback: string) {
  if (!value || value.includes(".")) {
    return fallback;
  }

  return value;
}

export function ContractsPageContent({
  viewMode = "client",
}: ContractsPageContentProps) {
  const { t, intlLocale } = useContractsTranslation();
  const { role } = useAuth();

  const canAccess =
    viewMode === "admin"
      ? role === 1 || role === 2
      : role === 1 || role === 2 || role === 3;

  const [page] = React.useState(1);
  const [downloadingUuid, setDownloadingUuid] = React.useState<string | null>(
    null,
  );
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  const filters = React.useMemo(
    () => ({
      page,
      limit: DEFAULT_PAGE_SIZE,
    }),
    [page],
  );

  const { data: contractsData, isLoading } = useContractsList(
    filters,
    canAccess,
  );

  const isSpanish = intlLocale.toLowerCase().startsWith("es");

  const pageTitle =
    viewMode === "admin"
      ? resolveContractText(
          t("admin.title" as never),
          isSpanish ? "Contratos" : "Contracts",
        )
      : t("title");

  const pageDescription =
    viewMode === "admin"
      ? resolveContractText(
          t("admin.description" as never),
          isSpanish
            ? "Consulta los contratos generados para rentas y ventas."
            : "View generated contracts for rentals and sales.",
        )
      : t("description");

  const emptyTitle =
    viewMode === "admin"
      ? resolveContractText(
          t("admin.empty.title" as never),
          isSpanish
            ? "No hay contratos registrados."
            : "There are no registered contracts.",
        )
      : t("table.empty");

  const emptyDescription =
    viewMode === "admin"
      ? resolveContractText(
          t("admin.empty.description" as never),
          isSpanish
            ? "Cuando se genere un contrato de renta o venta, aparecerá aquí."
            : "When a rental or sale contract is generated, it will appear here.",
        )
      : t("table.emptyDescription");

  const exploreActionLabel = resolveContractText(
    t("actions.explore" as never),
    isSpanish ? "Explorar propiedades" : "Explore properties",
  );

  const loadingActionLabel = resolveContractText(
    t("actions.loading" as never),
    isSpanish ? "Cargando..." : "Loading...",
  );

  const handleDownloadPdf = async (uuid: string) => {
    setDownloadingUuid(uuid);
    setErrorMsg(null);

    const pdfWindow = window.open("", "_blank");

    if (!pdfWindow) {
      setDownloadingUuid(null);
      setErrorMsg(
        resolveContractText(
          t("errors.popupBlocked" as never),
          isSpanish
            ? "No pudimos abrir el PDF. Permite ventanas emergentes e inténtalo de nuevo."
            : "We could not open the PDF. Allow pop-ups and try again.",
        ),
      );
      return;
    }

    try {
      const detail = await contractsHttpAdapter.getById(uuid);

      if (detail.pdfUrl) {
        pdfWindow.location.href = detail.pdfUrl;
      } else {
        pdfWindow.close();
        setErrorMsg(
          resolveContractText(
            t("errors.noPdfUrl" as never),
            isSpanish
              ? "No se encontró la URL del PDF."
              : "PDF URL was not found.",
          ),
        );
      }
    } catch (error) {
      pdfWindow.close();
      console.error("Error fetching contract detail:", error);

      if (error instanceof HttpError) {
        setErrorMsg(error.message);
      } else {
        setErrorMsg(
          resolveContractText(
            t("errors.downloadFailed" as never),
            isSpanish
              ? "No fue posible recuperar el PDF."
              : "Could not retrieve the PDF.",
          ),
        );
      }
    } finally {
      setDownloadingUuid(null);
    }
  };

  const rows = React.useMemo<ContractGridRow[]>(
    () =>
      (contractsData ?? []).map((item) => ({
        id: item.contractUuid,
        ...item,
      })),
    [contractsData],
  );

  const rowsToRender = React.useMemo<ContractsTableRow[]>(
    () =>
      isLoading
        ? Array.from({ length: LOADING_ROW_COUNT }, (_, index) => ({
            id: `loading-${index}`,
            isLoading: true as const,
          }))
        : rows,
    [isLoading, rows],
  );

  const columns = React.useMemo<DataGridColumn<ContractColumnId>[]>(
    () => [
      {
        id: "propertyTitle",
        label: columnLabel(Building03Icon, t("table.columns.property")),
        width: 250,
        minWidth: 200,
      },
      {
        id: "transactionType",
        label: columnLabel(NoteIcon, t("table.columns.type")),
        width: 130,
        minWidth: 110,
      },
      {
        id: "agreedAmount",
        label: columnLabel(CreditCardIcon, t("table.columns.amount")),
        width: 170,
        minWidth: 150,
        align: "right",
      },
      {
        id: "startDate",
        label: columnLabel(Calendar03Icon, t("table.columns.startDate")),
        width: 160,
        minWidth: 140,
      },
      {
        id: "status",
        label: columnLabel(NoteIcon, t("table.columns.status")),
        width: 130,
        minWidth: 110,
      },
      {
        id: "actions",
        label: "",
        width: 260,
        minWidth: 240,
        align: "right",
        sticky: "right",
      },
    ],
    [t],
  );

  const renderCell = React.useCallback(
    (row: ContractsTableRow, columnId: ContractColumnId) => {
      if (isLoadingRow(row)) {
        switch (columnId) {
          case "propertyTitle":
            return <Skeleton className="h-4 w-40 rounded-full" />;
          case "transactionType":
          case "status":
            return <Skeleton className="h-4 w-20 rounded-full" />;
          case "agreedAmount":
            return <Skeleton className="ml-auto h-4 w-24 rounded-full" />;
          case "startDate":
            return <Skeleton className="h-4 w-28 rounded-full" />;
          case "actions":
            return <Skeleton className="ml-auto h-9 w-28 rounded-2xl" />;
          default:
            return null;
        }
      }

      switch (columnId) {
        case "propertyTitle":
          return (
            <span className="font-semibold text-foreground">
              {row.propertyTitle}
            </span>
          );

        case "transactionType": {
          const isRent = row.transactionType === "rent";

          return (
            <span className={chipClassName}>
              {isRent ? t("table.types.rent") : t("table.types.sale")}
            </span>
          );
        }

        case "agreedAmount":
          return (
            <span className="font-semibold text-foreground">
              {formatCurrency(row.agreedAmount, row.currency, intlLocale)}
            </span>
          );

        case "startDate":
          return formatDate(row.startDate, intlLocale, "-");

        case "status": {
          const normalizedStatus = normalizeContractStatus(row.status);
          const statusKey = `status.${normalizedStatus}`;
          const translatedStatus = t(statusKey as never);
          const fallbackStatus = getContractStatusFallback(
            normalizedStatus,
            intlLocale,
          );

          return (
            <span className="text-muted-foreground">
              {translatedStatus === statusKey ? fallbackStatus : translatedStatus}
            </span>
          );
        }

        case "actions":
          return (
            <div className="flex items-center justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                className="gap-2 rounded-2xl border-border/80"
                onClick={() => handleDownloadPdf(row.contractUuid)}
                disabled={downloadingUuid === row.contractUuid}
              >
                <HugeiconsIcon
                  className="h-4 w-4"
                  icon={
                    downloadingUuid === row.contractUuid
                      ? NoteIcon
                      : Download01Icon
                  }
                />
                <span>
                  {downloadingUuid === row.contractUuid
                    ? loadingActionLabel
                    : t("table.actions.download")}
                </span>
              </Button>
            </div>
          );

        default:
          return null;
      }
    },
    [downloadingUuid, intlLocale, loadingActionLabel, t],
  );

  if (!canAccess) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-4 text-center">
        <HugeiconsIcon
          className="h-12 w-12 text-destructive"
          icon={Alert02Icon}
        />
        <p className="text-lg font-semibold text-foreground">
          {resolveContractText(
            t("errors.unauthorized" as never),
            isSpanish ? "Acceso denegado" : "Access denied",
          )}
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 space-y-1">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
          {pageTitle}
        </h1>
        <p className="text-muted-foreground">{pageDescription}</p>
      </div>

      {!isLoading && rows.length === 0 ? (
        <Empty className="py-24">
          <EmptyMedia>
            <HugeiconsIcon
              className="h-12 w-12 text-muted-foreground"
              icon={NoteIcon}
            />
          </EmptyMedia>
          <EmptyHeader>
            <EmptyTitle>{emptyTitle}</EmptyTitle>
            <EmptyDescription>{emptyDescription}</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button
              className="gap-2 rounded-2xl font-medium"
              onClick={() => window.location.assign("/explore")}
            >
              <span>{exploreActionLabel}</span>
              <HugeiconsIcon className="h-4 w-4" icon={ArrowRight01Icon} />
            </Button>
          </EmptyContent>
        </Empty>
      ) : (
        <div className="overflow-hidden rounded-3xl border border-border/80 bg-background/50 shadow-sm backdrop-blur-md">
          <DataGrid
            columns={columns}
            rows={rowsToRender}
            renderCell={renderCell}
          />
        </div>
      )}

      <AlertDialog open={!!errorMsg} onOpenChange={() => setErrorMsg(null)}>
        <AlertDialogContent className="max-w-sm rounded-3xl border border-border/70 bg-background/95">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2.5 text-destructive">
              <HugeiconsIcon className="h-5 w-5 shrink-0" icon={Alert02Icon} />
              <span>Error</span>
            </AlertDialogTitle>
            <AlertDialogDescription className="mt-2 text-sm leading-relaxed text-foreground/80">
              {errorMsg}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4">
            <Button
              className="w-full rounded-2xl sm:w-auto"
              onClick={() => setErrorMsg(null)}
            >
              OK
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}