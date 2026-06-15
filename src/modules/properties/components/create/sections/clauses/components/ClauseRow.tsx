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

  if (Number.isNaN(parsedValue)) {
    return null;
  }

  return Math.max(0, parsedValue);
}

export function ClauseRow({ clause, entry, onChange }: ClauseRowProps) {
  const { t } = usePropertiesTranslation();
  const clauseValue = entry.value;

  if (clauseValue.type === "boolean") {
    return (
      <div className="pointer-events-auto flex items-center justify-start gap-3 bg-transparent">
        <Switch
          checked={clauseValue.value}
          onCheckedChange={(checked) =>
            onChange(clause.clauseId, {
              type: "boolean",
              value: checked,
            })
          }
        />
        <span className="text-sm text-muted-foreground">
          {clauseValue.value
            ? t("create.clauses.booleanAllowed")
            : t("create.clauses.booleanNotAllowed")}
        </span>
      </div>
    );
  }

  if (clauseValue.type === "range") {
    return (
      <div className="pointer-events-auto flex items-center gap-2 bg-transparent">
        <Input
          className="w-24 bg-transparent focus-visible:ring-0"
          inputMode="numeric"
          min={0}
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
          onBlur={() => {
            if (clauseValue.min === null) {
              onChange(clause.clauseId, {
                type: "range",
                min: 0,
                max: clauseValue.max ?? 0,
              });
            }
          }}
        />
        <span className="text-muted-foreground text-xs">-</span>
        <Input
          className="w-24 bg-transparent focus-visible:ring-0"
          inputMode="numeric"
          min={0}
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
          onBlur={() => {
            if (clauseValue.max === null) {
              onChange(clause.clauseId, {
                type: "range",
                min: clauseValue.min ?? 0,
                max: 0,
              });
            }
          }}
        />
      </div>
    );
  }

  return (
    <div className="pointer-events-auto flex items-center justify-start bg-transparent">
      <Input
        className="w-24 bg-transparent focus-visible:ring-0"
        inputMode="numeric"
        min={0}
        type="number"
        value={clauseValue.type === "integer" ? (clauseValue.value ?? "") : ""}
        onChange={(event) =>
          onChange(clause.clauseId, {
            type: "integer",
            value: parseNumberValue(event.target.value),
          })
        }
        onBlur={() => {
          if (clauseValue.type === "integer" && clauseValue.value === null) {
            onChange(clause.clauseId, {
              type: "integer",
              value: 0,
            });
          }
        }}
      />
    </div>
  );
}
