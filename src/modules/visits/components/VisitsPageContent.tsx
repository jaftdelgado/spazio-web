"use client";

import * as React from "react";
import {
  PlusSignIcon,
  ChevronsDownUpIcon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button, Input, Dropdown, Label, toast } from "@heroui/react";
import { format, addMonths, subMonths } from "date-fns";
import { es, enUS } from "date-fns/locale";

import { useAppLocale } from "@/app/i18n/useAppLocale";
import { useAuth } from "@/lib/auth/useAuth";
import { useVisitsTranslation } from "../i18n/useVisitsTranslation";
import { useVisitsList, useVisitsMutations } from "../application/hooks/useVisits";
import { VisitsCalendar } from "./VisitsCalendar";
import { VisitsTable } from "./VisitsTable";
import { VisitConfirmAlertDialog } from "./VisitConfirmAlertDialog";
import { VisitCompleteAlertDialog } from "./VisitCompleteAlertDialog";
import { VisitCancelAlertDialog } from "./VisitCancelAlertDialog";
import { ScheduleVisitModal } from "./ScheduleVisitModal";
import { RescheduleVisitModal } from "./RescheduleVisitModal";
import type { VisitEntity } from "../domain/visits.entity";

type VisitStatusKey = "Pending" | "Confirmed" | "Completed";

const statusOptions: Array<{
  id: number;
  labelKey: `status.${VisitStatusKey}`;
  value: VisitStatusKey;
}> = [
  { id: 1, labelKey: "status.Pending", value: "Pending" },
  { id: 4, labelKey: "status.Confirmed", value: "Confirmed" },
  { id: 6, labelKey: "status.Completed", value: "Completed" },
];

const allStatusOptionId = 0;
const allPropertyOptionId = 0;
const mockPropertyOption = {
  id: 100,
  label: "Departamento Roma",
} as const;

export function VisitsPageContent() {
  const { t } = useVisitsTranslation();
  const { locale } = useAppLocale();
  const { role } = useAuth();
  const [currentDate, setCurrentDate] = React.useState(new Date());

  // Dialog States
  const [isConfirmOpen, setIsConfirmOpen] = React.useState(false);
  const [isCompleteOpen, setIsCompleteOpen] = React.useState(false);
  const [isCancelOpen, setIsCancelOpen] = React.useState(false);
  const [isScheduleOpen, setIsScheduleOpen] = React.useState(false);
  const [isRescheduleOpen, setIsRescheduleOpen] = React.useState(false);

  const [selectedVisitUuid, setSelectedVisitUuid] = React.useState<string | null>(
    null,
  );
  const [selectedVisit, setSelectedVisit] = React.useState<VisitEntity | null>(null);

  const [filterState, setFilterState] = React.useState({
    statusId: "",
    statusKey: "" as VisitStatusKey | "",
    dateFrom: "",
    dateTo: "",
    propertyId: "",
    propertyLabel: "",
  });

  const isAdmin = role === 1;
  const isAgent = role === 2;
  const isClient = role === 3;
  const dateLocale = locale === "es" ? es : enUS;
  const statusLabelByKey = React.useMemo(
    () =>
      ({
        Completed: t("status.Completed"),
        Confirmed: t("status.Confirmed"),
        Pending: t("status.Pending"),
      }) as const,
    [t],
  );

  const filterParams = React.useMemo(() => {
    const statusIdNum = parseInt(filterState.statusId);
    const propertyIdNum = parseInt(filterState.propertyId);

    return {
      statusId: !isNaN(statusIdNum) ? statusIdNum : undefined,
      propertyId: !isNaN(propertyIdNum) ? propertyIdNum : undefined,
    };
  }, [filterState.statusId, filterState.propertyId]);

  const { data: rawVisits = [], isLoading, isError } = useVisitsList(filterParams);
  const { confirmVisit, completeVisit, cancelVisit } = useVisitsMutations();

  const handleConfirmAction = () => {
    if (!selectedVisitUuid) return;

    confirmVisit.mutate(selectedVisitUuid, {
      onSuccess: () => {
        toast.success(t("toast.confirmSuccess"), {
          description: t("toast.confirmSuccessDescription"),
        });
        setIsConfirmOpen(false);
        setSelectedVisitUuid(null);
      },
      onError: () => {
        toast.danger(t("toast.confirmError"), {
          description: t("toast.confirmErrorDescription"),
        });
      },
    });
  };

  const handleCompleteAction = () => {
    if (!selectedVisitUuid) return;

    completeVisit.mutate(selectedVisitUuid, {
      onSuccess: () => {
        toast.success(t("toast.completeSuccess"), {
          description: t("toast.completeSuccessDescription"),
        });
        setIsCompleteOpen(false);
        setSelectedVisitUuid(null);
      },
      onError: () => {
        toast.danger(t("toast.completeError"), {
          description: t("toast.completeErrorDescription"),
        });
      },
    });
  };

  const handleCancelAction = () => {
    if (!selectedVisitUuid) return;

    cancelVisit.mutate(selectedVisitUuid, {
      onSuccess: () => {
        toast.success(t("toast.cancelSuccess"), {
          description: t("toast.cancelSuccessDescription"),
        });
        setIsCancelOpen(false);
        setSelectedVisitUuid(null);
      },
      onError: () => {
        toast.danger(t("toast.cancelError"), {
          description: t("toast.cancelErrorDescription"),
        });
      },
    });
  };

  const filteredVisits = React.useMemo(() => {
    return rawVisits || [];
  }, [rawVisits]);

  const calendarVisits = React.useMemo(() => {
    return filteredVisits.filter((visit) => visit.status !== "Cancelled");
  }, [filteredVisits]);

  const handlePrevMonth = () => setCurrentDate((prev) => subMonths(prev, 1));
  const handleNextMonth = () => setCurrentDate((prev) => addMonths(prev, 1));
  const handleToday = () => setCurrentDate(new Date());

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-foreground uppercase">
          {t("title")}
        </h1>
        {isClient && (
          <Button
            variant="primary"
            className="font-bold shadow-sm"
            onClick={() => setIsScheduleOpen(true)}
          >
            <HugeiconsIcon icon={PlusSignIcon} size={20} strokeWidth={2.5} />
            <span>{t("actions.schedule")}</span>
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 rounded-xl border border-divider bg-content1 p-4 shadow-sm md:grid-cols-4">
        <div className="flex flex-col gap-1">
          <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
            {t("filters.status")}
          </Label>
          <Dropdown>
            <Dropdown.Trigger>
              <div className="flex h-9 w-full items-center justify-between rounded-lg border border-divider bg-background px-3 py-2 text-sm text-foreground hover:bg-muted/50 cursor-pointer transition-colors outline-none ring-primary-500 focus-visible:ring-2 shadow-sm">
                <span className="truncate">
                  {filterState.statusKey
                    ? statusLabelByKey[filterState.statusKey] ?? t("filters.statusAll")
                    : t("filters.statusAll")}
                </span>
                <HugeiconsIcon
                  icon={ChevronsDownUpIcon}
                  size={16}
                  className="text-muted-foreground"
                />
              </div>
            </Dropdown.Trigger>
            <Dropdown.Popover className="min-w-48">
              <Dropdown.Menu
                onAction={(key) => {
                  const selectedId = Number(key);
                  if (selectedId === allStatusOptionId) {
                    setFilterState((prev) => ({ ...prev, statusId: "", statusKey: "" }));
                    return;
                  }

                  const selectedStatus = statusOptions.find(
                    (option) => option.id === selectedId,
                  );

                  setFilterState((prev) => ({
                    ...prev,
                    statusId: selectedStatus ? String(selectedStatus.id) : "",
                    statusKey: selectedStatus?.value ?? "",
                  }));
                }}
              >
                {statusOptions.map((option) => (
                  <Dropdown.Item id={option.id} key={option.id}>
                    {t(option.labelKey)}
                  </Dropdown.Item>
                ))}
                <Dropdown.Item id={allStatusOptionId} key={allStatusOptionId}>
                  {t("filters.statusAll")}
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown.Popover>
          </Dropdown>
        </div>

        <div className="flex flex-col gap-1">
          <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
            {t("filters.dateFrom")}
          </Label>
          <Input
            type="date"
            value={filterState.dateFrom}
            onChange={(e) => setFilterState((prev) => ({ ...prev, dateFrom: e.target.value }))}
            className="shadow-sm"
          />
        </div>

        <div className="flex flex-col gap-1">
          <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
            {t("filters.dateTo")}
          </Label>
          <Input
            type="date"
            value={filterState.dateTo}
            onChange={(e) => setFilterState((prev) => ({ ...prev, dateTo: e.target.value }))}
            className="shadow-sm"
          />
        </div>

        <div className="flex flex-col gap-1">
          <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
            {t("filters.property")}
          </Label>
          <Dropdown>
            <Dropdown.Trigger>
              <div className="flex h-9 w-full items-center justify-between rounded-lg border border-divider bg-background px-3 py-2 text-sm text-foreground hover:bg-muted/50 cursor-pointer transition-colors outline-none ring-primary-500 focus-visible:ring-2 shadow-sm">
                <span className="truncate">
                  {filterState.propertyLabel || t("filters.propertyAll")}
                </span>
                <HugeiconsIcon
                  icon={ChevronsDownUpIcon}
                  size={16}
                  className="text-muted-foreground"
                />
              </div>
            </Dropdown.Trigger>
            <Dropdown.Popover className="min-w-48">
              <Dropdown.Menu
                onAction={(key) => {
                  const selectedId = Number(key);
                  setFilterState((prev) => ({
                    ...prev,
                    propertyId:
                      selectedId === allPropertyOptionId ? "" : String(selectedId),
                    propertyLabel:
                      selectedId === allPropertyOptionId ? "" : mockPropertyOption.label,
                  }));
                }}
              >
                <Dropdown.Item id={mockPropertyOption.id} key={mockPropertyOption.id}>
                  {mockPropertyOption.label}
                </Dropdown.Item>
                <Dropdown.Item id={allPropertyOptionId} key={allPropertyOptionId}>
                  {t("filters.propertyAll")}
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown.Popover>
          </Dropdown>
        </div>
      </div>

      <div className="flex min-h-150 flex-1 flex-col overflow-hidden rounded-xl border border-divider bg-content1 shadow-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b border-divider bg-muted/20">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-bold text-foreground capitalize">
              {format(currentDate, "MMMM yyyy", { locale: dateLocale })}
            </h2>
            <div className="flex items-center rounded-lg border border-divider bg-background p-0.5 shadow-sm">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 min-w-8 rounded-md p-0"
                onClick={handlePrevMonth}
              >
                <HugeiconsIcon icon={ArrowLeft01Icon} size={18} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 rounded-md px-3 text-xs font-semibold"
                onClick={handleToday}
              >
                {t("calendar.today")}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 min-w-8 rounded-md p-0"
                onClick={handleNextMonth}
              >
                <HugeiconsIcon icon={ArrowRight01Icon} size={18} />
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1">
              <div className="size-2 rounded-full bg-primary animate-pulse" />
              <span className="text-[10px] font-bold text-primary uppercase tracking-widest">
                {t("calendar.totalVisits", { count: String(filteredVisits.length) })}
              </span>
            </div>
          </div>
        </div>

        <div className="flex-1 p-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              {t("calendar.loading")}
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center h-full text-danger bg-danger/10 rounded-xl border border-danger/20 p-6 text-center">
              <span className="mb-1 font-semibold">{t("calendar.errorTitle")}</span>
              <span className="text-sm text-danger/70">
                {t("calendar.errorDescription")}
              </span>
            </div>
          ) : (
            <VisitsCalendar
              currentDate={currentDate}
              visits={calendarVisits}
              isAgent={isAgent}
              isAdmin={isAdmin}
            />
          )}
        </div>
      </div>

      <div className="bg-content1 rounded-xl border border-divider shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-divider bg-muted/20">
          <h2 className="font-bold text-sm text-foreground uppercase tracking-wider">
            {t("table.title")}
          </h2>
        </div>
        {isLoading ? (
          <div className="flex items-center justify-center h-48 text-muted-foreground">
            {t("table.loading")}
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center h-48 text-danger bg-danger/10 m-6 rounded-xl border border-danger/20 text-center">
            <span className="font-semibold mb-1">{t("table.errorTitle")}</span>
            <span className="text-sm text-danger/70">
              {t("table.errorDescription")}
            </span>
          </div>
        ) : (
          <VisitsTable
            visits={filteredVisits}
            isAgent={isAgent}
            isAdmin={isAdmin}
            confirmingUuid={confirmVisit.isPending ? confirmVisit.variables : null}
            completingUuid={completeVisit.isPending ? completeVisit.variables : null}
            cancellingUuid={cancelVisit.isPending ? cancelVisit.variables : null}
            onConfirm={(uuid) => {
              setSelectedVisitUuid(uuid);
              setIsConfirmOpen(true);
            }}
            onComplete={(uuid) => {
              setSelectedVisitUuid(uuid);
              setIsCompleteOpen(true);
            }}
            onCancel={(uuid) => {
                setSelectedVisitUuid(uuid);
                setIsCancelOpen(true);
            }}
            onReschedule={(uuid) => {
              const visit = filteredVisits.find((item) => item.visitUuid === uuid);
              if (visit) {
                setSelectedVisit(visit);
                setIsRescheduleOpen(true);
              }
            }}
          />
        )}
      </div>

      <VisitConfirmAlertDialog
        isOpen={isConfirmOpen}
        onOpenChange={setIsConfirmOpen}
        onConfirm={handleConfirmAction}
        isLoading={confirmVisit.isPending}
      />

      <VisitCompleteAlertDialog
        isOpen={isCompleteOpen}
        onOpenChange={setIsCompleteOpen}
        onComplete={handleCompleteAction}
        isLoading={completeVisit.isPending}
      />

      <VisitCancelAlertDialog
        isOpen={isCancelOpen}
        onOpenChange={setIsCancelOpen}
        onConfirm={handleCancelAction}
        isLoading={cancelVisit.isPending}
      />

      <ScheduleVisitModal
        isOpen={isScheduleOpen}
        onOpenChange={setIsScheduleOpen}
        onSuccess={() => {
          toast.success(t("toast.scheduleSuccess"), {
            description: t("toast.scheduleSuccessDescription"),
          });
        }}
      />

      <RescheduleVisitModal
        isOpen={isRescheduleOpen}
        onOpenChange={setIsRescheduleOpen}
        visit={selectedVisit}
        onSuccess={() => {
          toast.success(t("toast.rescheduleSuccess"), {
            description: t("toast.rescheduleSuccessDescription"),
          });
          setSelectedVisit(null);
        }}
      />
    </div>
  );
}
