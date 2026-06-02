"use client";

import NumberFlow from "@number-flow/react";
import { Surface } from "@heroui/react";

function normalizePriceInput(value: string) {
  return value.replace(/\D+/g, "");
}

export function AnimatedPriceField({
  id,
  locale,
  suffix,
  value,
  onChange,
}: {
  id: string;
  locale: string;
  suffix: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const numericValue = value.trim() === "" ? null : Number(value);
  const flowValue = numericValue ?? 0;

  return (
    <div className="relative">
      <Surface className="w-full py-3">
        <div
          className={[
            "flex items-baseline gap-1 text-3xl font-semibold [font-variant-numeric:tabular-nums]",
            numericValue === null ? "text-default-400" : "",
          ].join(" ")}
        >
          <span>$</span>
          <NumberFlow
            format={{
              maximumFractionDigits: 0,
              useGrouping: true,
            }}
            locales={locale}
            suffix={suffix}
            value={flowValue}
            willChange
          />
        </div>
      </Surface>
      <input
        aria-label={`price input ${suffix}`}
        className="absolute inset-0 h-full w-full cursor-text opacity-0"
        id={id}
        inputMode="numeric"
        type="text"
        value={value}
        onChange={(event) => onChange(normalizePriceInput(event.target.value))}
      />
    </div>
  );
}
