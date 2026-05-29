"use client";

import * as React from "react";

function cn(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

type FeedbackTone = "default" | "danger" | "warning" | "success";
type FeedbackMediaVariant = "default" | "icon";

type FeedbackStateContextValue = {
  tone: FeedbackTone;
};

const FeedbackStateContext = React.createContext<FeedbackStateContextValue>({
  tone: "default",
});

function useFeedbackStateContext() {
  return React.useContext(FeedbackStateContext);
}

function getToneClasses(tone: FeedbackTone) {
  switch (tone) {
    case "danger":
      return {
        surface:
          "border-red-200 bg-linear-to-br from-red-50 via-white to-red-100/80",
        media: "border-red-200 bg-red-50 text-red-600",
        title: "text-red-950",
        description: "text-red-700",
      };
    case "warning":
      return {
        surface:
          "border-amber-200 bg-linear-to-br from-amber-50 via-white to-amber-100/80",
        media: "border-amber-200 bg-amber-50 text-amber-700",
        title: "text-amber-950",
        description: "text-amber-700",
      };
    case "success":
      return {
        surface:
          "border-emerald-200 bg-linear-to-br from-emerald-50 via-white to-emerald-100/80",
        media: "border-emerald-200 bg-emerald-50 text-emerald-700",
        title: "text-emerald-950",
        description: "text-emerald-700",
      };
    default:
      return {
        surface:
          "border-slate-200 bg-linear-to-br from-slate-50 via-white to-slate-100/90",
        media: "border-slate-200 bg-white text-slate-500",
        title: "text-slate-950",
        description: "text-slate-600",
      };
  }
}

export type FeedbackStateProps = React.ComponentPropsWithoutRef<"section"> & {
  tone?: FeedbackTone;
};

export const FeedbackState = React.forwardRef<HTMLElement, FeedbackStateProps>(
  function FeedbackState(
    { className, tone = "default", ...props },
    ref,
  ) {
    const toneClasses = getToneClasses(tone);

    return (
      <FeedbackStateContext.Provider value={{ tone }}>
        <section
          ref={ref}
          className={cn(
            "flex min-h-64 w-full flex-col items-center justify-center rounded-2xl border px-6 py-10 text-center shadow-sm",
            toneClasses.surface,
            className,
          )}
          {...props}
        />
      </FeedbackStateContext.Provider>
    );
  },
);

export type FeedbackStateHeaderProps = React.ComponentPropsWithoutRef<"div">;

export const FeedbackStateHeader = React.forwardRef<
  HTMLDivElement,
  FeedbackStateHeaderProps
>(function FeedbackStateHeader({ className, ...props }, ref) {
  return (
    <div
      ref={ref}
      className={cn("flex max-w-md flex-col items-center gap-4", className)}
      {...props}
    />
  );
});

export type FeedbackStateMediaProps = React.ComponentPropsWithoutRef<"div"> & {
  variant?: FeedbackMediaVariant;
};

export const FeedbackStateMedia = React.forwardRef<
  HTMLDivElement,
  FeedbackStateMediaProps
>(function FeedbackStateMedia(
  { className, variant = "default", ...props },
  ref,
) {
  const { tone } = useFeedbackStateContext();
  const toneClasses = getToneClasses(tone);

  return (
    <div
      ref={ref}
      className={cn(
        "flex shrink-0 items-center justify-center overflow-hidden",
        variant === "icon"
          ? "size-14 rounded-2xl border shadow-sm"
          : "rounded-2xl",
        variant === "icon" && toneClasses.media,
        className,
      )}
      {...props}
    />
  );
});

export type FeedbackStateTitleProps = React.ComponentPropsWithoutRef<"h3">;

export const FeedbackStateTitle = React.forwardRef<
  HTMLHeadingElement,
  FeedbackStateTitleProps
>(function FeedbackStateTitle({ className, ...props }, ref) {
  const { tone } = useFeedbackStateContext();
  const toneClasses = getToneClasses(tone);

  return (
    <h3
      ref={ref}
      className={cn("text-lg font-semibold tracking-tight", toneClasses.title, className)}
      {...props}
    />
  );
});

export type FeedbackStateDescriptionProps =
  React.ComponentPropsWithoutRef<"p">;

export const FeedbackStateDescription = React.forwardRef<
  HTMLParagraphElement,
  FeedbackStateDescriptionProps
>(function FeedbackStateDescription({ className, ...props }, ref) {
  const { tone } = useFeedbackStateContext();
  const toneClasses = getToneClasses(tone);

  return (
    <p
      ref={ref}
      className={cn("max-w-sm text-sm leading-6", toneClasses.description, className)}
      {...props}
    />
  );
});

export type FeedbackStateContentProps = React.ComponentPropsWithoutRef<"div">;

export const FeedbackStateContent = React.forwardRef<
  HTMLDivElement,
  FeedbackStateContentProps
>(function FeedbackStateContent({ className, ...props }, ref) {
  return (
    <div
      ref={ref}
      className={cn(
        "mt-6 flex w-full max-w-md flex-wrap items-center justify-center gap-3",
        className,
      )}
      {...props}
    />
  );
});
