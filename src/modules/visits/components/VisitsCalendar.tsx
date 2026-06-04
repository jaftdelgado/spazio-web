"use client";

import * as React from "react";
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameMonth, 
  isToday, 
  startOfWeek, 
  endOfWeek 
} from "date-fns";

import { useVisitsTranslation } from "../i18n/useVisitsTranslation";
import type { VisitEntity } from "../domain/visits.entity";

interface VisitsCalendarProps {
  currentDate: Date;
  visits: VisitEntity[];
  isAgent: boolean;
  isAdmin?: boolean;
}

export function VisitsCalendar({ currentDate, visits, isAgent, isAdmin = false }: VisitsCalendarProps) {
  const { t } = useVisitsTranslation();

  // Helper to determine styles based on status
  const getStatusStyles = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-warning/20 border-warning/30 text-warning-600 dark:text-warning";
      case "Confirmed":
        return "bg-success/20 border-success/30 text-success-600 dark:text-success";
      case "Cancelled":
        return "bg-danger/20 border-danger/30 text-danger-600 dark:text-danger";
      case "Completed":
        return "bg-muted/40 border-divider text-muted-foreground";
      case "WaitingAgent":
        return "bg-warning/10 border-warning/20 text-warning-500";
      case "WaitingClient":
        return "bg-primary/20 border-primary/30 text-primary-600 dark:text-primary";
      default:
        return "bg-muted/20 border-divider text-foreground";
    }
  };

  // Generate calendar grid (7x5 or 7x6 depending on month)
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }); 
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });
  
  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });
  const weekDays = [
    t("calendar.days.mon"), t("calendar.days.tue"), t("calendar.days.wed"), 
    t("calendar.days.thu"), t("calendar.days.fri"), t("calendar.days.sat"), t("calendar.days.sun")
  ];

  return (
    <div className="flex flex-col h-full min-h-[500px]">
      {/* Cabecera de Días */}
      <div className="grid grid-cols-7 border-b border-divider">
        {weekDays.map((day) => (
          <div key={day} className="py-2 text-center text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            {day}
          </div>
        ))}
      </div>

      {/* Bloques de Días (Grid) */}
      <div className="grid grid-cols-7 flex-1 border-l border-divider">
        {calendarDays.map((day) => {
          const isCurrentMonth = isSameMonth(day, monthStart);
          const isCurrentToday = isToday(day);
          
          // Filter and sort visits for this day chronologically
          const dayVisits = visits.filter(v => {
            const vDate = new Date(v.visitDate);
            return vDate.getDate() === day.getDate() && 
                   vDate.getMonth() === day.getMonth() && 
                   vDate.getFullYear() === day.getFullYear();
          }).sort((a, b) => new Date(a.visitDate).getTime() - new Date(b.visitDate).getTime());

          return (
            <div 
              key={day.toISOString()} 
              className={`min-h-[110px] border-b border-r border-divider p-2 flex flex-col gap-1 transition-colors ${
                !isCurrentMonth ? "bg-muted/20 opacity-40" : "bg-content1 hover:bg-muted/10"
              }`}
            >
              <div className={`text-xs font-bold ${isCurrentToday ? "text-primary" : "text-muted-foreground"}`}>
                {format(day, "d")}
              </div>
              
              <div className="flex flex-col gap-1 overflow-y-auto mt-1 no-scrollbar">
                {dayVisits.map((visit) => {
                  const timeStr = format(new Date(visit.visitDate), "HH:mm");
                  
                  let displayPerson = "";
                  if (isAdmin) {
                    displayPerson = `${visit.agentName || "A"} / ${visit.clientName || "C"}`;
                  } else {
                    displayPerson = isAgent ? (visit.clientName || "Cliente") : (visit.agentName || "Agente");
                  }

                  const eventText = t("calendar.visitWith", { name: displayPerson, time: timeStr });
                  
                  return (
                    <div 
                      key={visit.visitUuid} 
                      className={`text-[9px] font-medium border px-1.5 py-1 rounded shadow-sm truncate ${getStatusStyles(visit.status)}`}
                      title={eventText}
                    >
                      {eventText}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
