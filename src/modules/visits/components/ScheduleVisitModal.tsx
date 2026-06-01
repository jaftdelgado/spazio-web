"use client";

import * as React from "react";
import { format, parse, setHours, setMinutes, setSeconds } from "date-fns";
import { 
  Clock01Icon, 
  Home01Icon 
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { 
  Button, 
  Input, 
  Dropdown, 
  Label, 
  AlertDialog,
  Skeleton
} from "@heroui/react";

import { usePropertyList } from "@/modules/properties/application/get/hooks/useProperty";
import { useAvailableSlots, useVisitsMutations } from "../application/hooks/useVisits";
import { useVisitsTranslation } from "../i18n/useVisitsTranslation";

type ScheduleVisitModalProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSuccess: () => void;
};

export function ScheduleVisitModal({ isOpen, onOpenChange, onSuccess }: ScheduleVisitModalProps) {
  const { t } = useVisitsTranslation();
  
  // Selection States
  const [selectedPropertyId, setSelectedPropertyId] = React.useState<number | null>(null);
  const [selectedPropertyTitle, setSelectedPropertyTitle] = React.useState("");
  const [selectedDate, setSelectedDate] = React.useState("");
  const [selectedSlot, setSelectedSlot] = React.useState<string | null>(null);

  // Queries
  const { data: propertiesResponse, isLoading: isLoadingProps } = usePropertyList({}, isOpen);
  const { data: slots = [], isLoading: isLoadingSlots } = useAvailableSlots(
    selectedPropertyId, 
    selectedDate || undefined
  );
  
  // Mutations
  const { scheduleVisit } = useVisitsMutations();

  const properties = (propertiesResponse as any)?.data || [];

  // Minimum date: Today + 3 days (approx 72h to be safe with 48h rule)
  const minDate = React.useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    return format(d, "yyyy-MM-dd");
  }, []);

  const handleSchedule = () => {
    if (!selectedPropertyId || !selectedDate || !selectedSlot) return;

    // Combine date and slot (HH:00) into a full ISO string
    const [hours] = selectedSlot.split(":");
    let visitDate = parse(selectedDate, "yyyy-MM-dd", new Date());
    visitDate = setHours(visitDate, parseInt(hours));
    visitDate = setMinutes(visitDate, 0);
    visitDate = setSeconds(visitDate, 0);

    scheduleVisit.mutate({
      propertyId: selectedPropertyId,
      visitDate: visitDate.toISOString(),
    }, {
      onSuccess: () => {
        onSuccess();
        onOpenChange(false);
        // Reset states
        setSelectedPropertyId(null);
        setSelectedPropertyTitle("");
        setSelectedDate("");
        setSelectedSlot(null);
      },
      onError: (err: any) => {
        const errorMsg = err.body?.error || err.message || "Error desconocido";
        alert(`No se pudo agendar la visita: ${errorMsg}`);
      }
    });
  };

  const isFormValid = selectedPropertyId && selectedDate && selectedSlot;

  return (
    <AlertDialog.Backdrop isOpen={isOpen} onOpenChange={onOpenChange}>
      <AlertDialog.Container>
        <AlertDialog.Dialog className="sm:max-w-120">
          <AlertDialog.CloseTrigger />
          <AlertDialog.Header>
            <AlertDialog.Heading>{t("actions.schedule")}</AlertDialog.Heading>
          </AlertDialog.Header>
          
          <AlertDialog.Body className="flex flex-col gap-5 py-4">
            
            {/* 1. Seleccionar Propiedad */}
            <div className="flex flex-col gap-1.5">
              <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                {t("filters.property")}
              </Label>
              <Dropdown>
                <Dropdown.Trigger>
                  <div className="flex h-10 w-full items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 cursor-pointer transition-colors outline-none ring-primary-500 focus-visible:ring-2 shadow-sm">
                    <div className="flex items-center gap-2">
                      <HugeiconsIcon icon={Home01Icon} size={16} className="text-slate-400" />
                      <span className="truncate">
                        {selectedPropertyTitle || t("filters.propertyAll")}
                      </span>
                    </div>
                    <HugeiconsIcon icon={Clock01Icon} size={16} className="text-slate-400 rotate-180" />
                  </div>
                </Dropdown.Trigger>
                <Dropdown.Popover className="min-w-64 max-h-60 overflow-y-auto">
                  <Dropdown.Menu
                    onAction={(key) => {
                      const prop = properties.find((p: any) => p.propertyId.toString() === key.toString());
                      if (prop) {
                        setSelectedPropertyId(prop.propertyId);
                        setSelectedPropertyTitle(prop.title);
                        setSelectedSlot(null); // Reset slot when property changes
                      }
                    }}
                  >
                    {isLoadingProps ? (
                      <Dropdown.Item id="loading" isDisabled>Cargando propiedades...</Dropdown.Item>
                    ) : properties.length === 0 ? (
                      <Dropdown.Item id="empty" isDisabled>No hay propiedades disponibles</Dropdown.Item>
                    ) : (
                      properties.map((prop: any) => (
                        <Dropdown.Item id={prop.propertyId.toString()} key={prop.propertyId}>
                          {prop.title}
                        </Dropdown.Item>
                      ))
                    )}
                  </Dropdown.Menu>
                </Dropdown.Popover>
              </Dropdown>
            </div>

            {/* 2. Seleccionar Fecha */}
            <div className="flex flex-col gap-1.5">
              <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                {t("filters.dateFrom")}
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
              <p className="text-[10px] text-slate-400 italic mt-0.5">
                * Debe agendar con al menos 48 horas de anticipación.
              </p>
            </div>

            {/* 3. Seleccionar Horario (Slots) */}
            <div className="flex flex-col gap-2">
              <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Horarios Disponibles
              </Label>
              
              {!selectedPropertyId || !selectedDate ? (
                <div className="text-xs text-slate-400 bg-slate-50 p-4 rounded-lg border border-dashed border-slate-200 text-center">
                  Selecciona una propiedad y fecha para ver horarios
                </div>
              ) : isLoadingSlots ? (
                <div className="grid grid-cols-3 gap-2">
                  {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-9 rounded-lg" />)}
                </div>
              ) : slots.length === 0 ? (
                <div className="text-xs text-red-400 bg-red-50 p-4 rounded-lg border border-red-100 text-center">
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

          <AlertDialog.Footer className="bg-slate-50 border-t border-slate-100">
            <Button slot="close" variant="tertiary" isDisabled={scheduleVisit.isPending}>
              {t("confirmDialog.cancel")}
            </Button>
            <Button
              variant="primary"
              className="font-bold px-8 shadow-sm"
              isDisabled={!isFormValid || scheduleVisit.isPending}
              onPress={handleSchedule}
            >
              {scheduleVisit.isPending ? "Agendando..." : "Agendar Visita"}
            </Button>
          </AlertDialog.Footer>
        </AlertDialog.Dialog>
      </AlertDialog.Container>
    </AlertDialog.Backdrop>
  );
}
