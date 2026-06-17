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
  TickDouble01Icon,
  Cancel01Icon
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button } from "@heroui/react";

import { useVisitsTranslation } from "../i18n/useVisitsTranslation";
import type { VisitEntity } from "../domain/visits.entity";

interface VisitsTableProps {
  visits: VisitEntity[];
  isAgent: boolean;
  isAdmin?: boolean;
  onReschedule?: (visitUuid: string) => void;
  onConfirm?: (visitUuid: string) => void;
  onComplete?: (visitUuid: string) => void;
  onCancel?: (visitUuid: string) => void;
  confirmingUuid?: string | null;
  completingUuid?: string | null;
  cancellingUuid?: string | null;
}

export function VisitsTable({ 
  visits, 
  isAgent, 
  isAdmin = false,
  onReschedule, 
  onConfirm, 
  onComplete, 
  onCancel,
  confirmingUuid, 
  completingUuid,
  cancellingUuid
}: VisitsTableProps) {
  const { t } = useVisitsTranslation();

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "Pending":
      case "WaitingAgent":
      case "WaitingClient":
      case "Confirmed":
      case "Cancelled":
      case "Completed":
        return t(`status.${status}`);
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending": return "bg-warning/10 text-warning border-warning/20";
      case "Confirmed": return "bg-success/10 text-success border-success/20";
      case "Cancelled": return "bg-danger/10 text-danger border-danger/20";
      case "Completed": return "bg-muted/30 text-muted-foreground border-divider";
      case "WaitingAgent": return "bg-warning/5 text-warning-500 border-warning/10";
      case "WaitingClient": return "bg-primary/10 text-primary border-primary/20";
      default: return "bg-muted/20 text-foreground border-divider";
    }
  };

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="text-[10px] text-muted-foreground uppercase bg-muted/20 border-b border-divider">
          <tr>
            <th className="px-6 py-4 font-bold tracking-wider">{t("table.columns.property")}</th>
            {isAdmin && <th className="px-6 py-4 font-bold tracking-wider">{t("table.columns.agent")}</th>}
            {(isAdmin || isAgent) && <th className="px-6 py-4 font-bold tracking-wider">{t("table.columns.client")}</th>}
            {!isAdmin && !isAgent && <th className="px-6 py-4 font-bold tracking-wider">{t("table.columns.agent")}</th>}
            <th className="px-6 py-4 font-bold tracking-wider">{t("table.columns.date")}</th>
            <th className="px-6 py-4 font-bold tracking-wider">{t("table.columns.time")}</th>
            <th className="px-6 py-4 font-bold tracking-wider">{t("table.columns.status")}</th>
            {!isAdmin && <th className="px-6 py-4 font-bold tracking-wider text-right">{t("table.columns.actions")}</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-divider">
          {visits.length === 0 ? (
            <tr>
              <td colSpan={isAdmin ? 7 : 6} className="px-6 py-12 text-center text-muted-foreground font-medium italic">
                {t("table.empty")}
              </td>
            </tr>
          ) : (
            visits.map((visit) => {
              const vDate = new Date(visit.visitDate);
              const isConfirming = confirmingUuid === visit.visitUuid;
              const isCompleting = completingUuid === visit.visitUuid;
              const isCancelling = cancellingUuid === visit.visitUuid;
              const isProcessing = isConfirming || isCompleting || isCancelling;
              
              const canConfirm = !isAdmin && (
                visit.status === "Pending" || 
                (visit.status === "WaitingAgent" && isAgent) ||
                (visit.status === "WaitingClient" && !isAgent)
              );

              const canComplete = !isAdmin && visit.status === "Confirmed" && isAgent;

              const canReschedule = !isAdmin && (
                visit.status === "Pending" || 
                visit.status === "WaitingAgent" || 
                visit.status === "WaitingClient"
              );

              const canCancel = !isAdmin && (
                visit.status === "Pending" || 
                visit.status === "WaitingAgent" || 
                visit.status === "WaitingClient"
              );
              
              return (
                <tr key={visit.visitUuid} className="bg-transparent hover:bg-muted/10 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 bg-muted/40 rounded-lg text-muted-foreground group-hover:bg-content1 group-hover:text-primary transition-colors">
                        <HugeiconsIcon icon={Location01Icon} size={18} />
                      </div>
                      <span className="font-semibold text-foreground">
                        {visit.propertyTitle || t("table.fallbacks.untitled")}
                      </span>
                    </div>
                  </td>
                  {isAdmin && (
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <HugeiconsIcon icon={UserIcon} size={16} className="text-muted-foreground/60" />
                        <span>{visit.agentName || t("table.fallbacks.notAvailable")}</span>
                      </div>
                    </td>
                  )}
                  {(isAdmin || isAgent) && (
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <HugeiconsIcon icon={UserIcon} size={16} className="text-muted-foreground/60" />
                        <span>{visit.clientName || t("table.fallbacks.notAvailable")}</span>
                      </div>
                    </td>
                  )}
                  {!isAdmin && !isAgent && (
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <HugeiconsIcon icon={UserIcon} size={16} className="text-muted-foreground/60" />
                        <span>{visit.agentName || t("table.fallbacks.notAvailable")}</span>
                      </div>
                    </td>
                  )}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <HugeiconsIcon icon={Calendar03Icon} size={16} className="text-muted-foreground/60" />
                      <span>{format(vDate, "dd/MM/yyyy")}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <HugeiconsIcon icon={Clock01Icon} size={16} className="text-muted-foreground/60" />
                      <span>{format(vDate, "HH:mm")}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border shadow-sm uppercase tracking-tighter ${getStatusColor(visit.status)}`}>
                      {getStatusLabel(visit.status)}
                    </span>
                  </td>
                  {!isAdmin && (
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {canReschedule && (
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="h-8 border-divider text-foreground font-medium"
                            onClick={() => onReschedule?.(visit.visitUuid)}
                            isDisabled={isProcessing}
                          >
                            <HugeiconsIcon icon={Edit01Icon} size={14} />
                            {t("actions.reschedule")}
                          </Button>
                        )}
                        
                        {canConfirm && (
                          <Button 
                            size="sm" 
                            variant="primary" 
                            className="h-8 font-bold"
                            onClick={() => onConfirm?.(visit.visitUuid)}
                            isDisabled={isProcessing}
                          >
                            {isConfirming ? null : <HugeiconsIcon icon={Tick01Icon} size={14} />}
                            {t("actions.confirm")}
                          </Button>
                        )}

                        {canComplete && (
                          <Button 
                            size="sm" 
                            variant="primary" 
                            className="h-8 font-bold"
                            onClick={() => onComplete?.(visit.visitUuid)}
                            isDisabled={isProcessing}
                          >
                            {isCompleting ? null : <HugeiconsIcon icon={TickDouble01Icon} size={14} />}
                            {t("actions.complete")}
                          </Button>
                        )}

                        {canCancel && (
                          <Button 
                            size="sm" 
                            variant="danger" 
                            className="h-8 font-bold"
                            onClick={() => onCancel?.(visit.visitUuid)}
                            isDisabled={isProcessing}
                          >
                            {isCancelling ? null : <HugeiconsIcon icon={Cancel01Icon} size={14} />}
                            {t("actions.cancel")}
                          </Button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
