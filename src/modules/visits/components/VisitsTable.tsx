"use client";

import * as React from "react";
import { format } from "date-fns";
import { 
  Location01Icon, 
  UserIcon, 
  Calendar03Icon, 
  Clock01Icon, 
  Edit01Icon, 
  Tick01Icon,
  TickDouble01Icon
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button } from "@heroui/react";

import { useVisitsTranslation } from "../i18n/useVisitsTranslation";
import type { VisitEntity } from "../domain/visits.entity";

interface VisitsTableProps {
  visits: VisitEntity[];
  isAgent: boolean;
  onReschedule?: (visitUuid: string) => void;
  onConfirm?: (visitUuid: string) => void;
  onComplete?: (visitUuid: string) => void;
  confirmingUuid?: string | null;
  completingUuid?: string | null;
}

export function VisitsTable({ visits, isAgent, onReschedule, onConfirm, onComplete, confirmingUuid, completingUuid }: VisitsTableProps) {
  const { t } = useVisitsTranslation();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending": return "bg-yellow-50 text-yellow-700 border-yellow-100";
      case "Confirmed": return "bg-green-50 text-green-700 border-green-100";
      case "Cancelled": return "bg-red-50 text-red-700 border-red-100";
      case "Completed": return "bg-slate-50 text-slate-600 border-slate-100";
      case "WaitingAgent": return "bg-orange-50 text-orange-700 border-orange-100";
      case "WaitingClient": return "bg-blue-50 text-blue-700 border-blue-100";
      default: return "bg-slate-50 text-slate-600 border-slate-100";
    }
  };

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="text-[10px] text-slate-400 uppercase bg-slate-50/50 border-b border-slate-200">
          <tr>
            <th className="px-6 py-4 font-bold tracking-wider">{t("table.columns.property")}</th>
            <th className="px-6 py-4 font-bold tracking-wider">{isAgent ? t("table.columns.client") : t("table.columns.agent")}</th>
            <th className="px-6 py-4 font-bold tracking-wider">{t("table.columns.date")}</th>
            <th className="px-6 py-4 font-bold tracking-wider">{t("table.columns.time")}</th>
            <th className="px-6 py-4 font-bold tracking-wider">{t("table.columns.status")}</th>
            <th className="px-6 py-4 font-bold tracking-wider text-right">{t("table.columns.actions")}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {visits.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-6 py-12 text-center text-slate-400 font-medium italic">
                No hay visitas registradas
              </td>
            </tr>
          ) : (
            visits.map((visit) => {
              const vDate = new Date(visit.visitDate);
              const isConfirming = confirmingUuid === visit.visitUuid;
              const isCompleting = completingUuid === visit.visitUuid;
              const isProcessing = isConfirming || isCompleting;
              
              // Logic: 
              // 1. If Pending, both can confirm to move to their respective waiting states.
              // 2. If WaitingAgent and current user is Agent, they can confirm to move to Confirmed.
              // 3. If WaitingClient and current user is Client, they can confirm to move to Confirmed.
              const canConfirm = 
                visit.status === "Pending" || 
                (visit.status === "WaitingAgent" && isAgent) ||
                (visit.status === "WaitingClient" && !isAgent);

              // 4. If Confirmed and current user is Agent, they can complete the visit.
              const canComplete = visit.status === "Confirmed" && isAgent;

              // 5. Reschedule is only allowed if not fully confirmed, completed, or cancelled.
              const canReschedule = 
                visit.status === "Pending" || 
                visit.status === "WaitingAgent" || 
                visit.status === "WaitingClient";
              
              return (
                <tr key={visit.visitUuid} className="bg-white hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 bg-slate-50 rounded-lg text-slate-400 group-hover:bg-white group-hover:text-primary-500 transition-colors">
                        <HugeiconsIcon icon={Location01Icon} size={18} />
                      </div>
                      <span className="font-semibold text-slate-700">{visit.propertyTitle || "Sin título"}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-slate-600">
                      <HugeiconsIcon icon={UserIcon} size={16} className="text-slate-300" />
                      <span>{isAgent ? visit.clientName : visit.agentName || "N/A"}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-slate-600">
                      <HugeiconsIcon icon={Calendar03Icon} size={16} className="text-slate-300" />
                      <span>{format(vDate, "dd/MM/yyyy")}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-slate-600">
                      <HugeiconsIcon icon={Clock01Icon} size={16} className="text-slate-300" />
                      <span>{format(vDate, "HH:mm")}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border shadow-sm uppercase tracking-tighter ${getStatusColor(visit.status)}`}>
                      {t(`status.${visit.status}` as any) || visit.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      {canReschedule && (
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-8 border-slate-200 text-slate-600 font-medium"
                          startContent={<HugeiconsIcon icon={Edit01Icon} size={14} />}
                          onPress={() => onReschedule?.(visit.visitUuid)}
                          isDisabled={isProcessing}
                        >
                          {t("actions.reschedule")}
                        </Button>
                      )}
                      
                      {canConfirm && (
                        <Button 
                          size="sm" 
                          color="success" 
                          variant="flat" 
                          className="h-8 font-bold"
                          startContent={!isConfirming && <HugeiconsIcon icon={Tick01Icon} size={14} />}
                          onPress={() => onConfirm?.(visit.visitUuid)}
                          isLoading={isConfirming}
                          isDisabled={isProcessing}
                        >
                          {t("actions.confirm")}
                        </Button>
                      )}

                      {canComplete && (
                        <Button 
                          size="sm" 
                          color="primary" 
                          variant="flat" 
                          className="h-8 font-bold"
                          startContent={!isCompleting && <HugeiconsIcon icon={TickDouble01Icon} size={14} />}
                          onPress={() => onComplete?.(visit.visitUuid)}
                          isLoading={isCompleting}
                          isDisabled={isProcessing}
                        >
                          {t("actions.complete")}
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
