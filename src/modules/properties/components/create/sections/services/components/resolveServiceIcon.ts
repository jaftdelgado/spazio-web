"use client";

import * as HugeiconsCore from "@hugeicons/core-free-icons";
import type { IconSvgElement } from "@hugeicons/react";

const fallbackIcon = HugeiconsCore.HelpCircleIcon as IconSvgElement;

export function resolveServiceIcon(iconKey: string): IconSvgElement {
  const directMatch = HugeiconsCore[
    iconKey as keyof typeof HugeiconsCore
  ] as IconSvgElement | undefined;

  if (directMatch) {
    return directMatch;
  }

  const normalizedIconKey = iconKey.replace(/Icon(\d+)$/, "$1Icon");
  const normalizedMatch = HugeiconsCore[
    normalizedIconKey as keyof typeof HugeiconsCore
  ] as IconSvgElement | undefined;

  if (normalizedMatch) {
    return normalizedMatch;
  }

  const suffixedMatch = HugeiconsCore[
    `${iconKey}Icon` as keyof typeof HugeiconsCore
  ] as IconSvgElement | undefined;

  return suffixedMatch ?? fallbackIcon;
}
