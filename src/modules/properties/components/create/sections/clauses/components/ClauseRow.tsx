"use client";

import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import type {
  Clause,
  ClauseEntry,
  ClauseValue,
} from "@clauses/domain/clause.entity";
import { usePropertiesTranslation } from "@properties/i18n/usePropertiesTranslation";

type ClauseRowProps = {
  clause: Clause;
  entry: ClauseEntry;
  onChange: (clauseId: number, next: ClauseValue) => void;
};

function parseNumberValue(value: string) {
  if (value.trim() === "") {
    return null;
  }

  const parsedValue = Number(value);

  return Number.isNaN(parsedValue) ? null : parsedValue;
}

export function ClauseRow({ clause, entry, onChange }: ClauseRowProps) {
  const { t } = usePropertiesTranslation();
  const clauseValue = entry.value;

  if (clauseValue.type === "boolean") {
    return (
      <div className="pointer-events-auto flex items-center justify-start bg-transparent">
        <Switch
          checked={clauseValue.value}
          onCheckedChange={(checked) =>
            onChange(clause.clauseId, {
              type: "boolean",
              value: checked,
            })
          }
        />
      </div>
    );
  }

  if (clauseValue.type === "range") {
    return (
      <div className="pointer-events-auto flex items-center gap-2 bg-transparent">
        <Input
          className="w-24 bg-transparent focus-visible:ring-0"
          inputMode="numeric"
          placeholder={t("create.clauses.rangePlaceholderMin")}
          type="number"
          value={clauseValue.min ?? ""}
          onChange={(event) =>
            onChange(clause.clauseId, {
              type: "range",
              min: parseNumberValue(event.target.value),
              max: clauseValue.max,
            })
          }
        />
        <span className="text-muted-foreground text-xs">-</span>
        <Input
          className="w-24 bg-transparent focus-visible:ring-0"
          inputMode="numeric"
          placeholder={t("create.clauses.rangePlaceholderMax")}
          type="number"
          value={clauseValue.max ?? ""}
          onChange={(event) =>
            onChange(clause.clauseId, {
              type: "range",
              min: clauseValue.min,
              max: parseNumberValue(event.target.value),
            })
          }
        />
      </div>
    );
  }

  return (
    <div className="pointer-events-auto flex items-center justify-start bg-transparent">
      <Input
        className="w-24 bg-transparent focus-visible:ring-0"
        inputMode="numeric"
        type="number"
        value={clauseValue.type === "integer" ? (clauseValue.value ?? "") : ""}
        onChange={(event) =>
          onChange(clause.clauseId, {
            type: "integer",
            value: parseNumberValue(event.target.value),
          })
        }
      />
    </div>
  );
}
