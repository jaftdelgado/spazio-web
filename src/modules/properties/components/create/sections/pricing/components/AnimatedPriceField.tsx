"use client";

import NumberFlow from "@number-flow/react";

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
      <div className="w-full rounded-2xl bg-muted/50 px-4 py-3">
        <div
          className={[
            "flex items-baseline gap-1 text-3xl font-semibold [font-variant-numeric:tabular-nums]",
            numericValue === null ? "text-muted-foreground" : "text-foreground",
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
      </div>
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
