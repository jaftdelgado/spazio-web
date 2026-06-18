"use client";

import { UserIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { usePropertiesTranslation } from "@properties/i18n/usePropertiesTranslation";
import { useAssignableAgents } from "@users/application/hooks/useUsers";
import type { AgentListItem } from "@users/domain/users.entity";

function getAgentFullName(agent: Pick<AgentListItem, "firstName" | "lastName">) {
  return `${agent.firstName} ${agent.lastName}`.trim();
}

function getAgentInitials(agent: Pick<AgentListItem, "firstName" | "lastName">) {
  const source = getAgentFullName(agent) || "AG";
  return source
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

type AgentAssignmentSubsectionProps = {
  agentId: number | null;
  canClearSelection?: boolean;
  onChange: (agentId: number | null) => void;
};

export function AgentAssignmentSubsection({
  agentId,
  canClearSelection = true,
  onChange,
}: AgentAssignmentSubsectionProps) {
  const { t } = usePropertiesTranslation();
  const agentsQuery = useAssignableAgents();
  const selectedAgent =
    (agentsQuery.data ?? []).find((agent) => agent.userId === agentId) ?? null;

  return (
    <div className="space-y-2">
      <Select
        value={agentId !== null ? String(agentId) : undefined}
        onValueChange={(value) => {
          if (value === "unassigned") {
            onChange(null);
            return;
          }

          onChange(Number(value));
        }}
      >
        <SelectTrigger className="h-11 px-4">
          {selectedAgent ? (
            <span className="flex min-w-0 items-center gap-3">
              <Avatar className="size-7 border-border/70">
                {selectedAgent.profilePictureUrl ? (
                  <AvatarImage
                    alt={getAgentFullName(selectedAgent)}
                    src={selectedAgent.profilePictureUrl}
                  />
                ) : null}
                <AvatarFallback>{getAgentInitials(selectedAgent)}</AvatarFallback>
              </Avatar>
              <span className="truncate text-sm text-foreground">
                {getAgentFullName(selectedAgent)}
              </span>
            </span>
          ) : (
            <span className="truncate text-sm text-muted-foreground">
              {t("create.fields.agent.placeholder")}
            </span>
          )}
        </SelectTrigger>
        <SelectContent>
          {canClearSelection ? (
            <SelectItem value="unassigned">
              <span className="flex items-center gap-3">
                <span className="flex size-7 items-center justify-center rounded-full border border-border/70 bg-muted/40 text-muted-foreground">
                  <HugeiconsIcon icon={UserIcon} size={14} strokeWidth={1.8} />
                </span>
                <span>{t("create.fields.agent.unassigned")}</span>
              </span>
            </SelectItem>
          ) : null}

          {(agentsQuery.data ?? []).map((agent) => (
            <SelectItem key={agent.userId} value={String(agent.userId)}>
              <span className="flex min-w-0 items-center gap-3">
                <Avatar className="size-7 border-border/70">
                  {agent.profilePictureUrl ? (
                    <AvatarImage
                      alt={getAgentFullName(agent)}
                      src={agent.profilePictureUrl}
                    />
                  ) : null}
                  <AvatarFallback>{getAgentInitials(agent)}</AvatarFallback>
                </Avatar>
                <span className="truncate">{getAgentFullName(agent)}</span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <p
        className={cn(
          "text-xs leading-relaxed text-muted-foreground",
          agentsQuery.isError && "text-destructive",
        )}
      >
        {agentsQuery.isLoading
          ? t("create.fields.agent.loading")
          : agentsQuery.isError
            ? t("create.fields.agent.error")
            : canClearSelection
              ? t("create.fields.agent.hint")
              : t("edit.fields.agentLockedHint")}
      </p>
    </div>
  );
}
