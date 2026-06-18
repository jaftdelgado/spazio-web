"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  CreditCardIcon,
  Home01Icon,
  Building03Icon,
  Calendar03Icon,
  PanelLeftCloseIcon,
  PanelLeftOpenIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import {
  Button,
  Drawer,
  DrawerBackdrop,
  DrawerContent,
  DrawerDialog,
  Tooltip,
  cn,
  useOverlayState,
} from "@heroui/react";

type AdminSidebarNavItem = {
  href: string;
  label: string;
  icon: IconSvgElement;
};

// ─── Constants ───────────────────────────────────────────────────────────────

const SIDEBAR_COOKIE_NAME = "sidebar_state";
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;
const SIDEBAR_WIDTH = "16rem";
const SIDEBAR_WIDTH_MOBILE = "18rem";
const SIDEBAR_WIDTH_ICON = "4.5rem";
const SIDEBAR_KEYBOARD_SHORTCUT = "b";

// ─── Context ─────────────────────────────────────────────────────────────────

type SidebarContextProps = {
  state: "expanded" | "collapsed";
  open: boolean;
  setOpen: (open: boolean) => void;
  openMobile: boolean;
  setOpenMobile: (open: boolean) => void;
  isMobile: boolean;
  toggleSidebar: () => void;
};

const SidebarContext = React.createContext<SidebarContextProps | null>(null);

function useSidebar() {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider.");
  }
  return context;
}

// ─── Hook: useIsMobile ────────────────────────────────────────────────────────

function useIsMobile(breakpoint = 768) {
  const subscribe = React.useCallback(
    (onStoreChange: () => void) => {
      if (typeof window === "undefined") {
        return () => undefined;
      }

      const mediaQuery = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
      mediaQuery.addEventListener("change", onStoreChange);

      return () => mediaQuery.removeEventListener("change", onStoreChange);
    },
    [breakpoint],
  );

  const getSnapshot = React.useCallback(() => {
    if (typeof window === "undefined") {
      return false;
    }

    return window.matchMedia(`(max-width: ${breakpoint - 1}px)`).matches;
  }, [breakpoint]);

  return React.useSyncExternalStore(subscribe, getSnapshot, () => false);
}

// ─── SidebarProvider ──────────────────────────────────────────────────────────

function SidebarProvider({
  defaultOpen = true,
  open: openProp,
  onOpenChange: setOpenProp,
  className,
  style,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const isMobile = useIsMobile();
  const [openMobile, setOpenMobile] = React.useState(false);
  const [_open, _setOpen] = React.useState(defaultOpen);

  const open = openProp ?? _open;

  const setOpen = React.useCallback(
    (value: boolean | ((value: boolean) => boolean)) => {
      const openState = typeof value === "function" ? value(open) : value;
      if (setOpenProp) {
        setOpenProp(openState);
      } else {
        _setOpen(openState);
      }
      document.cookie = `${SIDEBAR_COOKIE_NAME}=${openState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`;
    },
    [setOpenProp, open],
  );

  const toggleSidebar = React.useCallback(() => {
    return isMobile ? setOpenMobile((prev) => !prev) : setOpen((prev) => !prev);
  }, [isMobile, setOpen]);

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.key === SIDEBAR_KEYBOARD_SHORTCUT &&
        (event.metaKey || event.ctrlKey)
      ) {
        event.preventDefault();
        toggleSidebar();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleSidebar]);

  const state = open ? "expanded" : "collapsed";

  const contextValue = React.useMemo<SidebarContextProps>(
    () => ({
      state,
      open,
      setOpen,
      isMobile,
      openMobile,
      setOpenMobile,
      toggleSidebar,
    }),
    [state, open, setOpen, isMobile, openMobile, setOpenMobile, toggleSidebar],
  );

  return (
    <SidebarContext.Provider value={contextValue}>
      <div
        data-slot="sidebar-wrapper"
        style={
          {
            "--sidebar-width": SIDEBAR_WIDTH,
            "--sidebar-width-icon": SIDEBAR_WIDTH_ICON,
            ...style,
          } as React.CSSProperties
        }
        className={cn("group/sidebar-wrapper flex min-h-svh w-full", className)}
        {...props}
      >
        {children}
      </div>
    </SidebarContext.Provider>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

function Sidebar({
  side = "left",
  variant = "sidebar",
  collapsible = "offcanvas",
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  side?: "left" | "right";
  variant?: "sidebar" | "floating" | "inset";
  collapsible?: "offcanvas" | "icon" | "none";
}) {
  const { isMobile, state, openMobile, setOpenMobile } = useSidebar();
  const mobileDrawerState = useOverlayState({
    isOpen: openMobile,
    onOpenChange: setOpenMobile,
  });

  // Non-collapsible: always visible
  if (collapsible === "none") {
    return (
      <div
        data-slot="sidebar"
        className={cn(
          "bg-content1 text-foreground flex h-full flex-col",
          className,
        )}
        style={{ width: SIDEBAR_WIDTH }}
        {...props}
      >
        {children}
      </div>
    );
  }

  // Mobile: HeroUI Drawer instead of shadcn Sheet
  if (isMobile) {
    return (
      <Drawer state={mobileDrawerState}>
        <DrawerBackdrop />
        <DrawerContent
          placement={side}
          className="bg-content1 text-foreground p-0"
        >
          <DrawerDialog className="outline-none">
            <div
              data-slot="sidebar"
              data-mobile="true"
              className="flex h-full w-full flex-col"
              style={{ width: SIDEBAR_WIDTH_MOBILE }}
            >
              {children}
            </div>
          </DrawerDialog>
        </DrawerContent>
      </Drawer>
    );
  }

  // Desktop
  return (
    <div
      className="group peer text-foreground hidden md:block"
      data-state={state}
      data-collapsible={state === "collapsed" ? collapsible : ""}
      data-variant={variant}
      data-side={side}
      data-slot="sidebar"
    >
      {/* Gap placeholder that shrinks when collapsed */}
      <div
        data-slot="sidebar-gap"
        className={cn(
          "relative w-(--sidebar-width) bg-transparent transition-[width] duration-200 ease-linear",
          "group-data-[collapsible=offcanvas]:w-0",
          "group-data-[side=right]:rotate-180",
          variant === "floating" || variant === "inset"
            ? "group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+1rem)]"
            : "group-data-[collapsible=icon]:w-(--sidebar-width-icon)",
        )}
      />

      {/* Fixed sidebar panel */}
      <div
        data-slot="sidebar-container"
        className={cn(
          "fixed inset-y-0 z-10 hidden h-svh w-(--sidebar-width) transition-[left,right,width] duration-200 ease-linear md:flex",
          side === "left"
            ? "left-0 group-data-[collapsible=offcanvas]:-left-(--sidebar-width)"
            : "right-0 group-data-[collapsible=offcanvas]:-right-(--sidebar-width)",
          variant === "floating" || variant === "inset"
            ? "p-2 group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+1rem+2px)]"
            : "group-data-[collapsible=icon]:w-(--sidebar-width-icon) group-data-[side=left]:border-r group-data-[side=right]:border-l border-divider",
          className,
        )}
        {...props}
      >
        <div
          data-sidebar="sidebar"
          data-slot="sidebar-inner"
          className={cn(
            "bg-content1 flex h-full w-full flex-col",
            variant === "floating" &&
              "rounded-large border border-divider shadow-small",
          )}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

// ─── SidebarTrigger ───────────────────────────────────────────────────────────
// Uses HeroUI Button

function SidebarTrigger({
  className,
  onPress,
  ...props
}: React.ComponentProps<typeof Button>) {
  const { state, toggleSidebar } = useSidebar();
  const icon = state === "collapsed" ? PanelLeftOpenIcon : PanelLeftCloseIcon;

  return (
    <Button
      data-sidebar="trigger"
      data-slot="sidebar-trigger"
      variant="ghost"
      isIconOnly
      size="sm"
      className={cn("size-7", className)}
      onPress={(e) => {
        onPress?.(e);
        toggleSidebar();
      }}
      {...props}
    >
      <HugeiconsIcon icon={icon} size={16} strokeWidth={1.8} />
      <span className="sr-only">Toggle Sidebar</span>
    </Button>
  );
}

// ─── SidebarRail ──────────────────────────────────────────────────────────────

function SidebarRail({ className, ...props }: React.ComponentProps<"button">) {
  const { toggleSidebar } = useSidebar();

  return (
    <button
      data-sidebar="rail"
      data-slot="sidebar-rail"
      aria-label="Toggle Sidebar"
      tabIndex={-1}
      onClick={toggleSidebar}
      title="Toggle Sidebar"
      className={cn(
        "absolute inset-y-0 z-20 hidden w-4 -translate-x-1/2 transition-all ease-linear",
        "group-data-[side=left]:-right-4 group-data-[side=right]:left-0",
        "after:absolute after:inset-y-0 after:left-1/2 after:w-0.5",
        "hover:after:bg-divider",
        "sm:flex",
        "in-data-[side=left]:cursor-w-resize in-data-[side=right]:cursor-e-resize",
        "[[data-side=left][data-state=collapsed]_&]:cursor-e-resize",
        "[[data-side=right][data-state=collapsed]_&]:cursor-w-resize",
        "hover:group-data-[collapsible=offcanvas]:bg-content1",
        "group-data-[collapsible=offcanvas]:translate-x-0 group-data-[collapsible=offcanvas]:after:left-full",
        "[[data-side=left][data-collapsible=offcanvas]_&]:-right-2",
        "[[data-side=right][data-collapsible=offcanvas]_&]:-left-2",
        className,
      )}
      {...props}
    />
  );
}

// ─── SidebarInset ─────────────────────────────────────────────────────────────

function SidebarInset({ className, ...props }: React.ComponentProps<"main">) {
  return (
    <main
      data-slot="sidebar-inset"
      className={cn(
        "bg-background relative flex w-full flex-1 flex-col min-w-0",
        "md:peer-data-[variant=inset]:m-2 md:peer-data-[variant=inset]:ml-0",
        "md:peer-data-[variant=inset]:rounded-large md:peer-data-[variant=inset]:shadow-small",
        "md:peer-data-[variant=inset]:peer-data-[state=collapsed]:ml-2",
        className,
      )}
      {...props}
    />
  );
}

// ─── SidebarInput ─────────────────────────────────────────────────────────────
// Uses HeroUI Input — import separately in your app

function SidebarInput({ className, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      data-slot="sidebar-input"
      data-sidebar="input"
      className={cn(
        "bg-default-100 h-8 w-full rounded-medium px-3 text-sm outline-none",
        "placeholder:text-foreground-400 focus:bg-default-200 transition-colors",
        className,
      )}
      {...props}
    />
  );
}

// ─── Structural slots ─────────────────────────────────────────────────────────

function SidebarHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-header"
      data-sidebar="header"
      className={cn("flex flex-col gap-2 p-2", className)}
      {...props}
    />
  );
}

function SidebarFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-footer"
      data-sidebar="footer"
      className={cn("flex flex-col gap-2 p-2", className)}
      {...props}
    />
  );
}

function SidebarSeparator({ className, ...props }: React.ComponentProps<"hr">) {
  return (
    <hr
      data-slot="sidebar-separator"
      data-sidebar="separator"
      className={cn("border-divider mx-2", className)}
      {...props}
    />
  );
}

function SidebarContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-content"
      data-sidebar="content"
      className={cn(
        "flex min-h-0 flex-1 flex-col gap-2 overflow-auto",
        "group-data-[collapsible=icon]:overflow-hidden",
        className,
      )}
      {...props}
    />
  );
}

// ─── Groups ───────────────────────────────────────────────────────────────────

function SidebarGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-group"
      data-sidebar="group"
      className={cn("relative flex w-full min-w-0 flex-col p-2", className)}
      {...props}
    />
  );
}

function SidebarGroupLabel({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-group-label"
      data-sidebar="group-label"
      className={cn(
        "text-muted flex h-8 shrink-0 items-center rounded-medium px-2",
        "text-xs font-medium outline-none transition-[margin,opacity] duration-200 ease-linear",
        "[&>svg]:size-4 [&>svg]:shrink-0",
        "group-data-[collapsible=icon]:-mt-8 group-data-[collapsible=icon]:opacity-0",
        className,
      )}
      {...props}
    />
  );
}

function SidebarGroupAction({
  className,
  ...props
}: React.ComponentProps<"button">) {
  return (
    <button
      data-slot="sidebar-group-action"
      data-sidebar="group-action"
      className={cn(
        "text-foreground-500 hover:bg-default-100 hover:text-foreground",
        "absolute top-3.5 right-3 flex aspect-square w-5 items-center justify-center rounded-medium p-0",
        "outline-none transition-colors [&>svg]:size-4 [&>svg]:shrink-0",
        "after:absolute after:-inset-2 md:after:hidden",
        "group-data-[collapsible=icon]:hidden",
        className,
      )}
      {...props}
    />
  );
}

function SidebarGroupContent({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-group-content"
      data-sidebar="group-content"
      className={cn("w-full text-sm", className)}
      {...props}
    />
  );
}

// ─── Menu ─────────────────────────────────────────────────────────────────────

function SidebarMenu({ className, ...props }: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="sidebar-menu"
      data-sidebar="menu"
      className={cn("flex w-full min-w-0 flex-col gap-1", className)}
      {...props}
    />
  );
}

function SidebarMenuItem({ className, ...props }: React.ComponentProps<"li">) {
  return (
    <li
      data-slot="sidebar-menu-item"
      data-sidebar="menu-item"
      className={cn("group/menu-item relative", className)}
      {...props}
    />
  );
}

// ─── SidebarMenuButton — uses HeroUI Tooltip when collapsed ──────────────────

function SidebarMenuButton({
  asChild = false,
  isActive = false,
  size = "default",
  tooltip,
  className,
  children,
  ...props
}: React.ComponentProps<"button"> & {
  asChild?: boolean;
  isActive?: boolean;
  size?: "sm" | "default" | "lg";
  tooltip?: string | { children: React.ReactNode };
}) {
  const { isMobile, state } = useSidebar();
  void asChild;

  const heightClass =
    size === "sm"
      ? "h-7 text-xs"
      : size === "lg"
        ? "h-12 text-sm"
        : "h-8 text-sm";

  const button = (
    <button
      data-slot="sidebar-menu-button"
      data-sidebar="menu-button"
      data-size={size}
      data-active={isActive}
      className={cn(
        "peer/menu-button flex w-full cursor-pointer items-center gap-2 overflow-hidden rounded-medium p-2 text-left outline-none",
        "transition-[width,height,padding] duration-150",
        "hover:bg-default-100 hover:text-foreground",
        "active:bg-default-200",
        "disabled:pointer-events-none disabled:opacity-50",
        isActive && "bg-default-100 font-medium text-foreground",
        "group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:p-2!",
        "[&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0",
        heightClass,
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );

  // Show HeroUI Tooltip only when sidebar is collapsed on desktop
  const shouldShowTooltip = tooltip && state === "collapsed" && !isMobile;

  if (!shouldShowTooltip) return button;

  const tooltipContent =
    typeof tooltip === "string" ? tooltip : tooltip.children;

  return (
    <Tooltip delay={0}>
      <Tooltip.Trigger>{button}</Tooltip.Trigger>
      <Tooltip.Content placement="right">{tooltipContent}</Tooltip.Content>
    </Tooltip>
  );
}

// ─── Menu Action / Badge / Skeleton ──────────────────────────────────────────

function SidebarMenuAction({
  className,
  showOnHover = false,
  ...props
}: React.ComponentProps<"button"> & { showOnHover?: boolean }) {
  return (
    <button
      data-slot="sidebar-menu-action"
      data-sidebar="menu-action"
      className={cn(
        "text-foreground-500 hover:bg-default-100 hover:text-foreground",
        "absolute top-1.5 right-1 flex aspect-square w-5 items-center justify-center rounded-medium p-0",
        "outline-none transition-colors [&>svg]:size-4 [&>svg]:shrink-0",
        "after:absolute after:-inset-2 md:after:hidden",
        "peer-data-[size=sm]/menu-button:top-1",
        "peer-data-[size=default]/menu-button:top-1.5",
        "peer-data-[size=lg]/menu-button:top-2.5",
        "group-data-[collapsible=icon]:hidden",
        showOnHover &&
          "group-focus-within/menu-item:opacity-100 group-hover/menu-item:opacity-100 md:opacity-0 data-[state=open]:opacity-100",
        className,
      )}
      {...props}
    />
  );
}

function SidebarMenuBadge({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-menu-badge"
      data-sidebar="menu-badge"
      className={cn(
        "text-foreground-500 pointer-events-none absolute right-1 flex h-5 min-w-5",
        "items-center justify-center rounded-medium px-1 text-xs font-medium tabular-nums select-none",
        "peer-data-[size=sm]/menu-button:top-1",
        "peer-data-[size=default]/menu-button:top-1.5",
        "peer-data-[size=lg]/menu-button:top-2.5",
        "group-data-[collapsible=icon]:hidden",
        className,
      )}
      {...props}
    />
  );
}

function SidebarMenuSkeleton({
  className,
  showIcon = false,
  ...props
}: React.ComponentProps<"div"> & { showIcon?: boolean }) {
  const skeletonId = React.useId();
  const width = React.useMemo(
    () =>
      `${([...skeletonId].reduce((sum, char) => sum + char.charCodeAt(0), 0) % 40) + 50}%`,
    [skeletonId],
  );

  return (
    <div
      data-slot="sidebar-menu-skeleton"
      data-sidebar="menu-skeleton"
      className={cn(
        "flex h-8 items-center gap-2 rounded-medium px-2",
        className,
      )}
      {...props}
    >
      {showIcon && (
        <span className="bg-default-200 size-4 animate-pulse rounded-medium" />
      )}
      <span
        className="bg-default-200 h-4 flex-1 animate-pulse rounded-medium"
        style={{ maxWidth: width }}
      />
    </div>
  );
}

// ─── Sub-menu ─────────────────────────────────────────────────────────────────

function SidebarMenuSub({ className, ...props }: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="sidebar-menu-sub"
      data-sidebar="menu-sub"
      className={cn(
        "border-divider mx-3.5 flex min-w-0 translate-x-px flex-col gap-1 border-l px-2.5 py-0.5",
        "group-data-[collapsible=icon]:hidden",
        className,
      )}
      {...props}
    />
  );
}

function SidebarMenuSubItem({
  className,
  ...props
}: React.ComponentProps<"li">) {
  return (
    <li
      data-slot="sidebar-menu-sub-item"
      data-sidebar="menu-sub-item"
      className={cn("group/menu-sub-item relative", className)}
      {...props}
    />
  );
}

function SidebarMenuSubButton({
  asChild = false,
  size = "md",
  isActive = false,
  className,
  ...props
}: React.ComponentProps<"a"> & {
  asChild?: boolean;
  size?: "sm" | "md";
  isActive?: boolean;
}) {
  void asChild;

  return (
    <a
      data-slot="sidebar-menu-sub-button"
      data-sidebar="menu-sub-button"
      data-size={size}
      data-active={isActive}
      className={cn(
        "text-foreground-600 hover:bg-default-100 hover:text-foreground",
        "active:bg-default-200",
        "flex h-7 min-w-0 -translate-x-px cursor-pointer items-center gap-2 overflow-hidden rounded-medium px-2",
        "outline-none transition-colors",
        "disabled:pointer-events-none disabled:opacity-50",
        isActive && "bg-default-100 text-foreground",
        size === "sm" ? "text-xs" : "text-sm",
        "group-data-[collapsible=icon]:hidden",
        "[&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0 [&>svg]:text-foreground-400",
        className,
      )}
      {...props}
    />
  );
}

function AdminSidebarNav({
  items,
  className,
}: {
  items: readonly AdminSidebarNavItem[];
  className?: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { isMobile, state } = useSidebar();

  return (
    <SidebarMenu className={className}>
      {items.map((item) => {
        const isActive = pathname === item.href;
        const button = (
          <Button
            fullWidth
            variant="ghost"
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "h-10 justify-start px-4 text-sm font-medium outline-none",
              "group-data-[collapsible=icon]:size-11 group-data-[collapsible=icon]:min-w-11 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0",
              isActive
                ? "bg-black/6 text-slate-950 hover:bg-black/8"
                : "text-slate-700 hover:bg-black/4 hover:text-slate-950",
            )}
            onPress={() => router.push(item.href)}
          >
            <HugeiconsIcon icon={item.icon} size={18} strokeWidth={1.8} />
            <span className="group-data-[collapsible=icon]:hidden">
              {item.label}
            </span>
          </Button>
        );

        return (
          <SidebarMenuItem key={item.href}>
            {state === "collapsed" && !isMobile ? (
              <Tooltip delay={0}>
                <Tooltip.Trigger>{button}</Tooltip.Trigger>
                <Tooltip.Content placement="right">
                  {item.label}
                </Tooltip.Content>
              </Tooltip>
            ) : (
              button
            )}
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
}

// ─── Exports ──────────────────────────────────────────────────────────────────

export {
  AdminSidebarNav,
  Building03Icon,
  Calendar03Icon,
  CreditCardIcon,
  Home01Icon,
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
};
