"use client";

import NumberFlow from "@number-flow/react";

function normalizePriceInput(value: string, maxIntegerDigits: number) {
  const sanitized = value.replace(/[^0-9.]/g, "");
  const hasDot = sanitized.includes(".");
  const [integerPart = "", ...decimalParts] = sanitized.split(".");
  const normalizedInteger = integerPart
    .replace(/\D/g, "")
    .slice(0, maxIntegerDigits);
  const normalizedDecimals = decimalParts
    .join("")
    .replace(/\D/g, "")
    .slice(0, 2);

  if (!hasDot) {
    return normalizedInteger;
  }

  if (normalizedInteger === "" && normalizedDecimals === "") {
    return "";
  }

  return `${normalizedInteger}.${normalizedDecimals}`;
}

export function AnimatedPriceField({
  id,
  locale,
  suffix,
  value,
  maxIntegerDigits,
  onChange,
}: {
  id: string;
  locale: string;
  suffix: string;
  value: string;
  maxIntegerDigits: number;
  onChange: (value: string) => void;
}) {
  const numericValue = value.trim() === "" ? null : Number(value);
  const flowValue = numericValue ?? 0;

  return (
    <div className="relative">
      <div className="flex h-11 items-center rounded-2xl">
        <div
          className={[
            "flex items-baseline gap-1 text-xl font-semibold [font-variant-numeric:tabular-nums]",
            numericValue === null ? "text-muted-foreground" : "text-foreground",
          ].join(" ")}
        >
          <span>$</span>
          <NumberFlow
            format={{
              maximumFractionDigits: 2,
              minimumFractionDigits:
                numericValue !== null && value.includes(".") ? 2 : 0,
              useGrouping: true,
            }}
            locales={locale}
            suffix={` ${suffix}`}
            value={flowValue}
            willChange
          />
        </div>
      </div>
      <input
        aria-label={`price input ${suffix}`}
        autoComplete="off"
        autoCorrect="off"
        className="absolute inset-0 h-full w-full cursor-text opacity-0"
        id={id}
        inputMode="decimal"
        name={`${id}-raw`}
        spellCheck={false}
        type="text"
        value={value}
        onChange={(event) =>
          onChange(normalizePriceInput(event.target.value, maxIntegerDigits))
        }
      />
    </div>
  );
}
