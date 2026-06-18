"use client";

import * as React from "react";
import {
  Building03Icon,
  Calendar03Icon,
  CreditCardIcon,
  NoteIcon,
  Download01Icon,
  Alert02Icon,
  ArrowRight01Icon,
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

export function ContractsPageContent() {
  const { t, intlLocale } = useContractsTranslation();
  const { role } = useAuth();
  const canAccess = role === 1 || role === 2 || role === 3;

  const [page, setPage] = React.useState(1);
  const [downloadingUuid, setDownloadingUuid] = React.useState<string | null>(null);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  const filters = React.useMemo(
    () => ({
      page,
      limit: DEFAULT_PAGE_SIZE,
    }),
    [page],
  );

  const { data: contractsData, isLoading, refetch } = useContractsList(filters, canAccess);

  const handleDownloadPdf = async (uuid: string) => {
    setDownloadingUuid(uuid);
    setErrorMsg(null);
    try {
      const detail = await contractsHttpAdapter.getById(uuid);
      if (detail.pdfUrl) {
        window.open(detail.pdfUrl, "_blank");
      } else {
        setErrorMsg(t("errors.noPdfUrl") || "PDF URL not found");
      }
    } catch (error) {
      console.error("Error fetching contract detail:", error);
      if (error instanceof HttpError) {
        setErrorMsg(error.message);
      } else {
        setErrorMsg(t("errors.downloadFailed") || "Failed to retrieve PDF");
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
          const statusKey = `status.${row.status.toLowerCase()}`;
          return (
            <span className="capitalize text-muted-foreground">
              {t(statusKey as never) || row.status}
            </span>
          );
        }
        case "actions": {
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
                  icon={downloadingUuid === row.contractUuid ? NoteIcon : Download01Icon}
                />
                <span>
                  {downloadingUuid === row.contractUuid
                    ? t("actions.loading") || "..."
                    : t("table.actions.download")}
                </span>
              </Button>
            </div>
          );
        }
        default:
          return null;
      }
    },
    [t, intlLocale, downloadingUuid],
  );

  if (!canAccess) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-4 text-center">
        <HugeiconsIcon className="h-12 w-12 text-destructive" icon={Alert02Icon} />
        <p className="text-lg font-semibold text-foreground">
          {t("errors.unauthorized") || "Acceso Denegado"}
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="space-y-1 mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
          {t("title")}
        </h1>
        <p className="text-muted-foreground">{t("description")}</p>
      </div>

      {!isLoading && rows.length === 0 ? (
        <Empty className="py-24">
          <EmptyMedia>
            <HugeiconsIcon className="h-12 w-12 text-muted-foreground" icon={NoteIcon} />
          </EmptyMedia>
          <EmptyHeader>
            <EmptyTitle>{t("table.empty")}</EmptyTitle>
            <EmptyDescription>{t("table.emptyDescription")}</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button
              className="rounded-2xl gap-2 font-medium"
              onClick={() => window.location.assign("/explore")}
            >
              <span>{t("actions.explore") || "Explorar propiedades"}</span>
              <HugeiconsIcon className="h-4 w-4" icon={ArrowRight01Icon} />
            </Button>
          </EmptyContent>
        </Empty>
      ) : (
        <div className="rounded-3xl border border-border/80 bg-background/50 shadow-sm backdrop-blur-md overflow-hidden">
          <DataGrid
            columns={columns}
            rows={rowsToRender}
            renderCell={renderCell}
          />
        </div>
      )}

      {/* Error alert dialog */}
      <AlertDialog open={!!errorMsg} onOpenChange={() => setErrorMsg(null)}>
        <AlertDialogContent className="rounded-3xl border border-border/70 bg-background/95 max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2.5 text-destructive">
              <HugeiconsIcon className="h-5 w-5 shrink-0" icon={Alert02Icon} />
              <span>Error</span>
            </AlertDialogTitle>
            <AlertDialogDescription className="text-foreground/80 mt-2 text-sm leading-relaxed">
              {errorMsg}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4">
            <Button
              className="w-full sm:w-auto rounded-2xl"
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
