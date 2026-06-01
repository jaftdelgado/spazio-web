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
}

export function VisitsCalendar({ currentDate, visits, isAgent }: VisitsCalendarProps) {
  const { t } = useVisitsTranslation();

  // Helper to determine styles based on status
  const getStatusStyles = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-50 border-yellow-200 text-yellow-700";
      case "Confirmed":
        return "bg-green-50 border-green-200 text-green-700";
      case "Cancelled":
        return "bg-red-50 border-red-200 text-red-700";
      case "Completed":
        return "bg-slate-50 border-slate-200 text-slate-500";
      case "WaitingAgent":
        return "bg-orange-50 border-orange-200 text-orange-700";
      case "WaitingClient":
        return "bg-blue-50 border-blue-200 text-blue-700";
      default:
        return "bg-slate-100 border-slate-200 text-slate-700";
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
      <div className="grid grid-cols-7 border-b border-slate-200">
        {weekDays.map((day) => (
          <div key={day} className="py-2 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            {day}
          </div>
        ))}
      </div>

      {/* Bloques de Días (Grid) */}
      <div className="grid grid-cols-7 flex-1 border-l border-slate-200">
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
              className={`min-h-[110px] border-b border-r border-slate-200 p-2 flex flex-col gap-1 transition-colors ${
                !isCurrentMonth ? "bg-slate-50/50 opacity-40" : "bg-white hover:bg-slate-50/30"
              }`}
            >
              <div className={`text-xs font-bold ${isCurrentToday ? "text-primary-600" : "text-slate-400"}`}>
                {format(day, "d")}
              </div>
              
              <div className="flex flex-col gap-1 overflow-y-auto mt-1 no-scrollbar">
                {dayVisits.map((visit) => {
                  const timeStr = format(new Date(visit.visitDate), "HH:mm");
                  const displayPerson = isAgent ? visit.clientName : visit.agentName;
                  const eventText = t("calendar.visitWith", { name: displayPerson || "N/A", time: timeStr });
                  
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
