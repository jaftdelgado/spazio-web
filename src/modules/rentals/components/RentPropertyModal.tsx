"use client";

import * as React from "react";

import {
  AlertDialog,
  Button,
  Dropdown,
  Input,
  Label,
} from "@heroui/react";
import { toast } from "sonner";

import { HttpError } from "@lib/http/http-errors";
import { usePropertiesTranslation } from "@properties/i18n/usePropertiesTranslation";
import { useConfirmRental, useRentalPreview } from "../application/hooks/useRentals";

type RentPropertyModalProps = {
  availablePeriodIds: number[];
  clientUuid: string | null;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  propertyTitle: string;
  propertyUuid: string;
};

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function parseIsoDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);

  return new Date(Date.UTC(year, month - 1, day));
}

function addUtcMonths(value: Date, amount: number) {
  return new Date(
    Date.UTC(
      value.getUTCFullYear(),
      value.getUTCMonth() + amount,
      value.getUTCDate(),
    ),
  );
}

function addUtcYears(value: Date, amount: number) {
  return new Date(
    Date.UTC(
      value.getUTCFullYear() + amount,
      value.getUTCMonth(),
      value.getUTCDate(),
    ),
  );
}

function addPeriod(value: Date, periodId: number) {
  if (periodId === 1) {
    return new Date(value.getTime() + 86_400_000);
  }

  if (periodId === 2) {
    return new Date(value.getTime() + 7 * 86_400_000);
  }

  if (periodId === 3) {
    return addUtcMonths(value, 1);
  }

  if (periodId === 4) {
    return addUtcYears(value, 1);
  }

  return value;
}

function canResolveRangeWithPeriods(
  currentDate: Date,
  endDate: Date,
  availablePeriodIds: number[],
  memo: Map<string, boolean>,
) {
  const currentIso = currentDate.toISOString().slice(0, 10);
  const endIso = endDate.toISOString().slice(0, 10);

  if (currentIso === endIso) {
    return true;
  }

  if (currentDate > endDate) {
    return false;
  }

  const memoKey = `${currentIso}|${availablePeriodIds.join(",")}`;
  const memoized = memo.get(memoKey);

  if (memoized !== undefined) {
    return memoized;
  }

  for (const periodId of availablePeriodIds) {
    const nextDate = addPeriod(currentDate, periodId);

    if (nextDate <= currentDate || nextDate > endDate) {
      continue;
    }

    if (canResolveRangeWithPeriods(nextDate, endDate, availablePeriodIds, memo)) {
      memo.set(memoKey, true);
      return true;
    }
  }

  memo.set(memoKey, false);
  return false;
}

function isRangeResolvableForSelection(
  selectedPeriodId: number,
  availablePeriodIds: number[],
  startDate: string,
  endDate: string,
) {
  const start = parseIsoDate(startDate);
  const end = parseIsoDate(endDate);
  const selectablePeriods = [...availablePeriodIds]
    .filter((periodId) => periodId <= selectedPeriodId)
    .sort((left, right) => right - left);

  if (start >= end || selectablePeriods.length === 0) {
    return false;
  }

  return canResolveRangeWithPeriods(start, end, selectablePeriods, new Map());
}

function getRentalErrorMessage(error: unknown, fallback: string) {
  if (error instanceof HttpError) {
    const body = error.body as { error?: string } | null;
    return body?.error ?? error.message;
  }

  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }

  return fallback;
}

function getRentPeriodTranslationKey(periodId: number) {
  if (periodId === 1) return "create.rentPeriods.nightly";
  if (periodId === 2) return "create.rentPeriods.weekly";
  if (periodId === 3) return "create.rentPeriods.monthly";
  if (periodId === 4) return "create.rentPeriods.yearly";

  return null;
}

export function RentPropertyModal({
  availablePeriodIds,
  clientUuid,
  isOpen,
  onOpenChange,
  propertyTitle,
  propertyUuid,
}: RentPropertyModalProps) {
  const { intlLocale, t } = usePropertiesTranslation();
  const confirmRental = useConfirmRental();

  const [startDate, setStartDate] = React.useState("");
  const [endDate, setEndDate] = React.useState("");
  const [selectedPeriodId, setSelectedPeriodId] = React.useState<number | null>(null);
  const [confirmationErrorMessage, setConfirmationErrorMessage] =
    React.useState<string | null>(null);

  const sortedPeriodIds = React.useMemo(
    () => [...availablePeriodIds].sort((left, right) => left - right),
    [availablePeriodIds],
  );
  const selectedPeriodLabel = React.useMemo(() => {
    if (selectedPeriodId === null) {
      return null;
    }

    const key = getRentPeriodTranslationKey(selectedPeriodId);

    return key
      ? t(key)
      : t("exploreDetail.rentalFlow.fields.periodFallback", {
          periodId: selectedPeriodId,
        });
  }, [selectedPeriodId, t]);

  const formattedMinDate = React.useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }, []);

  const validationMessage = React.useMemo(() => {
    if (!clientUuid) {
      return t("exploreDetail.rentalFlow.errors.authRequired");
    }

    if (selectedPeriodId !== null && !sortedPeriodIds.includes(selectedPeriodId)) {
      return t("exploreDetail.rentalFlow.errors.invalidPeriod");
    }

    if (startDate && !DATE_PATTERN.test(startDate)) {
      return t("exploreDetail.rentalFlow.errors.invalidStartDate");
    }

    if (endDate && !DATE_PATTERN.test(endDate)) {
      return t("exploreDetail.rentalFlow.errors.invalidEndDate");
    }

    if (startDate && endDate && startDate > endDate) {
      return t("exploreDetail.rentalFlow.errors.dateOrder");
    }

    if (
      selectedPeriodId !== null &&
      startDate &&
      endDate &&
      !isRangeResolvableForSelection(
        selectedPeriodId,
        sortedPeriodIds,
        startDate,
        endDate,
      )
    ) {
      return t("exploreDetail.rentalFlow.errors.periodDateMismatch", {
        period: selectedPeriodLabel ?? "",
      });
    }

    return null;
  }, [
    clientUuid,
    endDate,
    selectedPeriodId,
    selectedPeriodLabel,
    sortedPeriodIds,
    startDate,
    t,
  ]);

  const canPreview =
    isOpen &&
    clientUuid !== null &&
    selectedPeriodId !== null &&
    startDate.length > 0 &&
    endDate.length > 0 &&
    validationMessage === null;

  const previewQuery = useRentalPreview(
    {
      propertyUuid,
      periodId: selectedPeriodId ?? 0,
      startDate,
      endDate,
    },
    canPreview,
  );

  const formatMoney = React.useCallback(
    (amount: string, currency: string) =>
      new Intl.NumberFormat(intlLocale, {
        style: "currency",
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(Number(amount)),
    [intlLocale],
  );

  const inlineErrorMessage =
    validationMessage ??
    confirmationErrorMessage ??
    (previewQuery.isError
      ? getRentalErrorMessage(
          previewQuery.error,
          t("exploreDetail.rentalFlow.errors.previewFallback"),
        )
      : null);

  const handleConfirmRental = async () => {
    if (!clientUuid || !previewQuery.data || selectedPeriodId === null) {
      return;
    }

    setConfirmationErrorMessage(null);

    try {
      await confirmRental.mutateAsync({
        propertyUuid,
        clientUuid,
        periodId: selectedPeriodId,
        startDate,
        endDate,
      });

      toast.success(t("exploreDetail.rentalFlow.toast.successTitle"), {
        description: t("exploreDetail.rentalFlow.toast.successDescription", {
          propertyTitle,
        }),
      });

      onOpenChange(false);
    } catch (error) {
      setConfirmationErrorMessage(
        getRentalErrorMessage(
          error,
          t("exploreDetail.rentalFlow.errors.confirmFallback"),
        ),
      );
    }
  };

  const handleOpenChange = (nextIsOpen: boolean) => {
    if (!nextIsOpen) {
      setStartDate("");
      setEndDate("");
      setSelectedPeriodId(null);
      setConfirmationErrorMessage(null);
      confirmRental.reset();
    }

    onOpenChange(nextIsOpen);
  };

  return (
    <AlertDialog.Backdrop isOpen={isOpen} onOpenChange={handleOpenChange}>
      <AlertDialog.Container>
        <AlertDialog.Dialog className="sm:max-w-2xl">
          <AlertDialog.CloseTrigger />
          <AlertDialog.Header>
            <AlertDialog.Heading>
              {t("exploreDetail.rentalFlow.title")}
            </AlertDialog.Heading>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("exploreDetail.rentalFlow.description", {
                propertyTitle,
              })}
            </p>
          </AlertDialog.Header>

          <AlertDialog.Body className="flex flex-col gap-5 py-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                  {t("exploreDetail.rentalFlow.fields.startDate")}
                </Label>
                <Input
                  min={formattedMinDate}
                  type="date"
                  value={startDate}
                  onChange={(event) => {
                    setStartDate(event.target.value);
                    setConfirmationErrorMessage(null);
                  }}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                  {t("exploreDetail.rentalFlow.fields.endDate")}
                </Label>
                <Input
                  min={startDate || formattedMinDate}
                  type="date"
                  value={endDate}
                  onChange={(event) => {
                    setEndDate(event.target.value);
                    setConfirmationErrorMessage(null);
                  }}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                {t("exploreDetail.rentalFlow.fields.period")}
              </Label>
              <Dropdown>
                <Dropdown.Trigger>
                  <div className="flex h-10 w-full items-center justify-between rounded-lg border border-divider bg-background px-3 py-2 text-sm text-foreground shadow-sm transition-colors outline-none hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-primary-500">
                    <span className="truncate">
                      {selectedPeriodId !== null
                        ? selectedPeriodLabel
                        : t("exploreDetail.rentalFlow.fields.periodPlaceholder")}
                    </span>
                  </div>
                </Dropdown.Trigger>
                <Dropdown.Popover className="min-w-64">
                  <Dropdown.Menu
                    disabledKeys={sortedPeriodIds.length === 0 ? ["empty"] : []}
                    onAction={(key) => {
                      const nextPeriodId = Number(key);
                      setSelectedPeriodId(Number.isNaN(nextPeriodId) ? null : nextPeriodId);
                      setConfirmationErrorMessage(null);
                    }}
                  >
                    {sortedPeriodIds.length === 0 ? (
                      <Dropdown.Item id="empty" isDisabled>
                        {t("exploreDetail.rentalFlow.fields.noPeriods")}
                      </Dropdown.Item>
                    ) : (
                      sortedPeriodIds.map((periodId) => {
                        const translationKey = getRentPeriodTranslationKey(periodId);

                        return (
                          <Dropdown.Item id={String(periodId)} key={periodId}>
                            {translationKey
                              ? t(translationKey)
                              : t("exploreDetail.rentalFlow.fields.periodFallback", {
                                  periodId,
                                })}
                          </Dropdown.Item>
                        );
                      })
                    )}
                  </Dropdown.Menu>
                </Dropdown.Popover>
              </Dropdown>
            </div>

            {inlineErrorMessage ? (
              <div className="rounded-lg border border-danger/20 bg-danger/10 p-4 text-sm text-danger">
                {inlineErrorMessage}
              </div>
            ) : null}

            {previewQuery.isLoading ? (
              <div className="rounded-2xl border border-dashed border-divider bg-muted/20 p-5 text-sm text-muted-foreground">
                {t("exploreDetail.rentalFlow.preview.loading")}
              </div>
            ) : null}

            {previewQuery.isSuccess ? (
              <div className="space-y-4 rounded-2xl border bg-muted/10 p-5">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">
                    {t("exploreDetail.rentalFlow.preview.title")}
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {t("exploreDetail.rentalFlow.preview.description")}
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <PreviewCard
                    label={t("exploreDetail.rentalFlow.preview.subtotal")}
                    value={formatMoney(
                      previewQuery.data.subtotal,
                      previewQuery.data.currency,
                    )}
                  />
                  <PreviewCard
                    label={t("exploreDetail.rentalFlow.preview.deposit")}
                    value={formatMoney(
                      previewQuery.data.deposit,
                      previewQuery.data.currency,
                    )}
                  />
                  <PreviewCard
                    label={t("exploreDetail.rentalFlow.preview.total")}
                    value={formatMoney(
                      previewQuery.data.total,
                      previewQuery.data.currency,
                    )}
                  />
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <PreviewCard
                    label={t("exploreDetail.rentalFlow.preview.period")}
                    value={previewQuery.data.period}
                  />
                  <PreviewCard
                    label={t("exploreDetail.rentalFlow.preview.negotiable")}
                    value={
                      previewQuery.data.isNegotiable
                        ? t("exploreDetail.values.yes")
                        : t("exploreDetail.values.no")
                    }
                  />
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    {t("exploreDetail.rentalFlow.preview.breakdownTitle")}
                  </p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <BreakdownRow
                      label={t("exploreDetail.rentalFlow.preview.breakdown.years")}
                      value={previewQuery.data.breakdown.years}
                    />
                    <BreakdownRow
                      label={t("exploreDetail.rentalFlow.preview.breakdown.months")}
                      value={previewQuery.data.breakdown.months}
                    />
                    <BreakdownRow
                      label={t("exploreDetail.rentalFlow.preview.breakdown.weeks")}
                      value={previewQuery.data.breakdown.weeks}
                    />
                    <BreakdownRow
                      label={t("exploreDetail.rentalFlow.preview.breakdown.nights")}
                      value={previewQuery.data.breakdown.nights}
                    />
                  </div>
                </div>

                {previewQuery.data.priceComponents.length > 0 ? (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                      {t("exploreDetail.rentalFlow.preview.priceComponents")}
                    </p>
                    <div className="space-y-2">
                      {previewQuery.data.priceComponents.map((component, index) => (
                        <div
                          key={`${component.periodId}-${index}`}
                          className="rounded-xl border bg-background px-4 py-3"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-sm font-medium text-foreground">
                              {component.period}
                            </p>
                            <p className="text-sm font-semibold text-foreground">
                              {formatMoney(
                                component.lineTotal,
                                previewQuery.data.currency,
                              )}
                            </p>
                          </div>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {t("exploreDetail.rentalFlow.preview.unitsAtPrice", {
                              units: component.units,
                              unitPrice: formatMoney(
                                component.unitPrice,
                                previewQuery.data.currency,
                              ),
                            })}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}
          </AlertDialog.Body>

          <AlertDialog.Footer className="border-t border-divider bg-muted/10">
            <Button
              slot="close"
              isDisabled={confirmRental.isPending}
              variant="tertiary"
            >
              {t("exploreDetail.rentalFlow.actions.cancel")}
            </Button>
            {previewQuery.isSuccess ? (
              <Button
                className="px-8 font-bold shadow-sm"
                isDisabled={confirmRental.isPending}
                variant="primary"
                onPress={handleConfirmRental}
              >
                {confirmRental.isPending
                  ? t("exploreDetail.rentalFlow.actions.confirmLoading")
                  : t("exploreDetail.rentalFlow.actions.confirm")}
              </Button>
            ) : null}
          </AlertDialog.Footer>
        </AlertDialog.Dialog>
      </AlertDialog.Container>
    </AlertDialog.Backdrop>
  );
}

function PreviewCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border bg-background px-4 py-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}

function BreakdownRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between rounded-xl border bg-background px-4 py-3 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold text-foreground">{value}</span>
    </div>
  );
}
