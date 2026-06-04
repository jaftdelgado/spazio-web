"use client";

import * as React from "react";
import { PlusSignIcon, ChevronsDownUpIcon, ArrowLeft01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons";
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

  const [selectedVisitUuid, setSelectedVisitUuid] = React.useState<string | null>(null);
  const [selectedVisit, setSelectedVisit] = React.useState<VisitEntity | null>(null);

  const [filterState, setFilterState] = React.useState({
    statusId: "",
    statusKey: "",
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
    return filteredVisits.filter(v => v.status !== "Cancelled");
  }, [filteredVisits]);

  const handlePrevMonth = () => setCurrentDate(prev => subMonths(prev, 1));
  const handleNextMonth = () => setCurrentDate(prev => addMonths(prev, 1));
  const handleToday = () => setCurrentDate(new Date());

  return (
    <div className="flex flex-1 flex-col gap-6 min-h-0">
      {/* 1. Encabezado Principal y Acciones Globales */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-foreground uppercase">
          {t("title")}
        </h1>
        {isClient && (
          <Button
            color="primary"
            className="font-bold shadow-sm"
            onPress={() => setIsScheduleOpen(true)}
          >
            <HugeiconsIcon icon={PlusSignIcon} size={20} strokeWidth={2.5} />
            <span>{t("actions.schedule")}</span>
          </Button>
        )}
      </div>

      {/* 2. Sección de Filtros de Búsqueda */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-content1 p-4 rounded-xl border border-divider shadow-sm">

        {/* Filtro 1 - Estado */}
        <div className="flex flex-col gap-1">
          <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{t("filters.status")}</Label>
          <Dropdown>
            <Dropdown.Trigger>
              <div className="flex h-9 w-full items-center justify-between rounded-lg border border-divider bg-background px-3 py-2 text-sm text-foreground hover:bg-muted/50 cursor-pointer transition-colors outline-none ring-primary-500 focus-visible:ring-2 shadow-sm">
                <span className="truncate">
                  {filterState.statusKey
                    ? statusLabelByKey[
                        filterState.statusKey as keyof typeof statusLabelByKey
                      ] ?? t("filters.statusAll")
                    : t("filters.statusAll")}
                </span>
                <HugeiconsIcon icon={ChevronsDownUpIcon} size={16} className="text-muted-foreground" />
              </div>
            </Dropdown.Trigger>
            <Dropdown.Popover className="min-w-48">
              <Dropdown.Menu
                onAction={(key) => {
                  const k = key.toString();
                  if (k === "all") {
                    setFilterState(prev => ({ ...prev, statusId: "", statusKey: "" }));
                  } else {
                    const [id, name] = k.split("|");
                    setFilterState(prev => ({ ...prev, statusId: id, statusKey: name }));
                  }
                }}
              >
                <Dropdown.Item id="1|Pending">{t("status.Pending")}</Dropdown.Item>
                <Dropdown.Item id="4|Confirmed">{t("status.Confirmed")}</Dropdown.Item>
                <Dropdown.Item id="6|Completed">{t("status.Completed")}</Dropdown.Item>
                <Dropdown.Item id="all">{t("filters.statusAll")}</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown.Popover>
          </Dropdown>
        </div>

        {/* Filtro 2 - Fecha Desde */}
        <div className="flex flex-col gap-1">
          <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{t("filters.dateFrom")}</Label>
          <Input 
            type="date"
            size="sm"
            value={filterState.dateFrom}
            onChange={(e) => setFilterState((prev) => ({ ...prev, dateFrom: e.target.value }))}
            className="shadow-sm"
          />
        </div>

        {/* Filtro 3 - Fecha Hasta */}
        <div className="flex flex-col gap-1">
          <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{t("filters.dateTo")}</Label>
          <Input 
            type="date"
            size="sm"
            value={filterState.dateTo}
            onChange={(e) => setFilterState((prev) => ({ ...prev, dateTo: e.target.value }))}
            className="shadow-sm"
          />
        </div>

        {/* Filtro 4 - Propiedad */}
        <div className="flex flex-col gap-1">
          <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{t("filters.property")}</Label>
          <Dropdown>
            <Dropdown.Trigger>
              <div className="flex h-9 w-full items-center justify-between rounded-lg border border-divider bg-background px-3 py-2 text-sm text-foreground hover:bg-muted/50 cursor-pointer transition-colors outline-none ring-primary-500 focus-visible:ring-2 shadow-sm">
                <span className="truncate">{filterState.propertyLabel || t("filters.propertyAll")}</span>
                <HugeiconsIcon icon={ChevronsDownUpIcon} size={16} className="text-muted-foreground" />
              </div>
            </Dropdown.Trigger>
            <Dropdown.Popover className="min-w-48">
              <Dropdown.Menu
                onAction={(key) => {
                  const k = key.toString();
                  setFilterState(prev => ({ 
                    ...prev, 
                    propertyId: k === "all" ? "" : k, 
                    propertyLabel: k === "all" ? "" : "Departamento Roma" 
                  }));
                }}
              >
                <Dropdown.Item id="100">Departamento Roma</Dropdown.Item>
                <Dropdown.Item id="all">{t("filters.propertyAll")}</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown.Popover>
          </Dropdown>
        </div>
      </div>

      {/* 3. Componente de Calendario Mensual */}
      <div className="flex-1 flex flex-col bg-content1 rounded-xl border border-divider shadow-sm overflow-hidden min-h-150">
        {/* Navegación del Calendario */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-divider bg-muted/20">
           <div className="flex items-center gap-4">
              <h2 className="text-lg font-bold text-foreground capitalize">
                {format(currentDate, "MMMM yyyy", { locale: dateLocale })}
              </h2>
              <div className="flex items-center bg-background border border-divider rounded-lg p-0.5 shadow-sm">
                 <Button variant="ghost" size="sm" className="min-w-8 p-0 h-8 rounded-md" onPress={handlePrevMonth}>
                    <HugeiconsIcon icon={ArrowLeft01Icon} size={18} />
                 </Button>
                 <Button variant="ghost" size="sm" className="px-3 h-8 text-xs font-semibold rounded-md" onPress={handleToday}>
                    Hoy
                 </Button>
                 <Button variant="ghost" size="sm" className="min-w-8 p-0 h-8 rounded-md" onPress={handleNextMonth}>
                    <HugeiconsIcon icon={ArrowRight01Icon} size={18} />
                 </Button>
              </div>
           </div>
           <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full">
                 <div className="size-2 rounded-full bg-primary animate-pulse" />
                 <span className="text-[10px] font-bold text-primary uppercase tracking-widest">{filteredVisits.length} Visitas</span>
              </div>
           </div>
        </div>

        <div className="flex-1 p-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
                Cargando calendario...
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center h-full text-danger bg-danger/10 rounded-xl border border-danger/20 p-6 text-center">
                <span className="font-semibold mb-1">Error de conexión</span>
                <span className="text-sm text-danger/70">No se pudo cargar el calendario de visitas. Por favor, intenta de nuevo más tarde.</span>
            </div>
          ) : (
            <VisitsCalendar currentDate={currentDate} visits={calendarVisits} isAgent={isAgent} isAdmin={isAdmin} />
          )}
        </div>
      </div>

      {/* 4. Componente de Tabla */}
      <div className="bg-content1 rounded-xl border border-divider shadow-sm overflow-hidden">
         <div className="px-6 py-4 border-b border-divider bg-muted/20">
            <h2 className="font-bold text-sm text-foreground uppercase tracking-wider">{t("table.title")}</h2>
         </div>
         {isLoading ? (
             <div className="flex items-center justify-center h-48 text-muted-foreground">
                 Cargando visitas...
             </div>
         ) : isError ? (
             <div className="flex flex-col items-center justify-center h-48 text-danger bg-danger/10 m-6 rounded-xl border border-danger/20 text-center">
                 <span className="font-semibold mb-1">Error al obtener datos</span>
                 <span className="text-sm text-danger/70">Ocurrió un problema de red y no pudimos recuperar la lista de visitas.</span>
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
                 const visit = filteredVisits.find(v => v.visitUuid === uuid);
                 if (visit) {
                   setSelectedVisit(visit);
                   setIsRescheduleOpen(true);
                 }
               }}
             />
         )}
      </div>

      {/* Modales de Confirmación */}
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
          toast.success("Visita agendada", {
            description: "Tu solicitud de visita ha sido enviada con éxito.",
          });
        }}
      />

      <RescheduleVisitModal
        isOpen={isRescheduleOpen}
        onOpenChange={setIsRescheduleOpen}
        visit={selectedVisit}
        onSuccess={() => {
          toast.success("Visita reagendada", {
            description: "La cita ha sido actualizada con el nuevo horario.",
          });
          setSelectedVisit(null);
        }}
      />
    </div>
  );
}
