"use client";

import * as React from "react";
import { format, parse, setHours, setMinutes, setSeconds } from "date-fns";
import { 
  Calendar03Icon, 
  Clock01Icon, 
  Home01Icon 
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { 
  Button, 
  Input, 
  Label, 
  AlertDialog,
  Skeleton
} from "@heroui/react";

import { useAvailableSlots, useVisitsMutations } from "../application/hooks/useVisits";
import { useVisitsTranslation } from "../i18n/useVisitsTranslation";
import type { VisitEntity } from "../domain/visits.entity";

type RescheduleVisitModalProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  visit: VisitEntity | null;
  onSuccess: () => void;
};

export function RescheduleVisitModal({ isOpen, onOpenChange, visit, onSuccess }: RescheduleVisitModalProps) {
  const { t } = useVisitsTranslation();
  
  // Selection States
  const [selectedDate, setSelectedDate] = React.useState("");
  const [selectedSlot, setSelectedSlot] = React.useState<string | null>(null);

  // Queries - Fetch slots for the FIXED property of the visit
  const { data: slots = [], isLoading: isLoadingSlots } = useAvailableSlots(
    visit?.propertyId || null, 
    selectedDate || undefined
  );
  
  // Mutations
  const { rescheduleVisit } = useVisitsMutations();

  // Minimum date: Today + 2 days (48h rule)
  const minDate = React.useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return format(d, "yyyy-MM-dd");
  }, []);

  const handleReschedule = () => {
    if (!visit || !selectedDate || !selectedSlot) return;

    // Combine date and slot (HH:00) into a full ISO string
    const [hours] = selectedSlot.split(":");
    let visitDate = parse(selectedDate, "yyyy-MM-dd", new Date());
    visitDate = setHours(visitDate, parseInt(hours));
    visitDate = setMinutes(visitDate, 0);
    visitDate = setSeconds(visitDate, 0);

    rescheduleVisit.mutate({
      visitUuid: visit.visitUuid,
      input: {
        propertyId: visit.propertyId, // Backend validation requires it
        visitDate: visitDate.toISOString(),
      }
    }, {
      onSuccess: () => {
        onSuccess();
        onOpenChange(false);
        // Reset states
        setSelectedDate("");
        setSelectedSlot(null);
      },
      onError: (err: any) => {
        const errorMsg = err.body?.error || err.message || "Error desconocido";
        alert(`No se pudo reagendar la visita: ${errorMsg}`);
      }
    });
  };

  const isFormValid = selectedDate && selectedSlot;

  return (
    <AlertDialog.Backdrop isOpen={isOpen} onOpenChange={onOpenChange}>
      <AlertDialog.Container>
        <AlertDialog.Dialog className="sm:max-w-120">
          <AlertDialog.CloseTrigger />
          <AlertDialog.Header>
            <AlertDialog.Heading>{t("actions.reschedule")}</AlertDialog.Heading>
          </AlertDialog.Header>
          
          <AlertDialog.Body className="flex flex-col gap-5 py-4">
            
            {/* 1. Propiedad (Lectura) */}
            <div className="flex flex-col gap-1.5 opacity-70">
              <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                {t("filters.property")}
              </Label>
              <div className="flex h-10 w-full items-center justify-between rounded-lg border border-divider bg-muted/20 px-3 py-2 text-sm text-muted-foreground cursor-not-allowed">
                <div className="flex items-center gap-2">
                  <HugeiconsIcon icon={Home01Icon} size={16} />
                  <span className="truncate font-medium">
                    {visit?.propertyTitle || "Sin título"}
                  </span>
                </div>
              </div>
            </div>

            {/* 2. Seleccionar Nueva Fecha */}
            <div className="flex flex-col gap-1.5">
              <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                Nueva Fecha
              </Label>
              <div className="relative">
                <Input 
                  type="date"
                  className="w-full"
                  min={minDate}
                  value={selectedDate}
                  onChange={(e) => {
                    setSelectedDate(e.target.value);
                    setSelectedSlot(null);
                  }}
                />
              </div>
              <p className="text-[10px] text-muted-foreground/60 italic mt-0.5">
                * Debe haber al menos 48 horas de anticipación para el nuevo horario.
              </p>
            </div>

            {/* 3. Seleccionar Nuevo Horario (Slots) */}
            <div className="flex flex-col gap-2">
              <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                Horarios Disponibles
              </Label>
              
              {!selectedDate ? (
                <div className="text-xs text-muted-foreground bg-muted/20 p-4 rounded-lg border border-dashed border-divider text-center">
                  Selecciona una fecha para ver horarios
                </div>
              ) : isLoadingSlots ? (
                <div className="grid grid-cols-3 gap-2">
                  {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-9 rounded-lg" />)}
                </div>
              ) : slots.length === 0 ? (
                <div className="text-xs text-danger bg-danger/10 p-4 rounded-lg border border-danger/20 text-center">
                  No hay horarios disponibles para este día
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {slots.map((slot) => {
                    const timeLabel = format(new Date(slot.startTime), "HH:mm");
                    const isSelected = selectedSlot === timeLabel;
                    
                    return (
                      <Button
                        key={slot.startTime}
                        variant={isSelected ? "primary" : "outline"}
                        size="sm"
                        className={`h-9 font-medium ${!slot.available ? "opacity-50" : ""}`}
                        isDisabled={!slot.available}
                        onPress={() => setSelectedSlot(timeLabel)}
                      >
                        {timeLabel}
                      </Button>
                    );
                  })}
                </div>
              )}
            </div>

          </AlertDialog.Body>

          <AlertDialog.Footer className="bg-muted/10 border-t border-divider">
            <Button slot="close" variant="tertiary" isDisabled={rescheduleVisit.isPending}>
              {t("confirmDialog.cancel")}
            </Button>
            <Button
              variant="primary"
              className="font-bold px-8 shadow-sm"
              isDisabled={!isFormValid || rescheduleVisit.isPending}
              onPress={handleReschedule}
            >
              {rescheduleVisit.isPending ? "Confirmando..." : "Confirmar Cambio"}
            </Button>
          </AlertDialog.Footer>
        </AlertDialog.Dialog>
      </AlertDialog.Container>
    </AlertDialog.Backdrop>
  );
}
