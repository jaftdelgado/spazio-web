"use client";

import Image from "next/image";
import {
  BedDoubleIcon,
  Building06Icon,
  Location01Icon,
  RulerIcon,
  ShowerHeadIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { ExploreListing } from "@/modules/explore/data/explore-listings";
import { exploreTypeMeta } from "@/modules/explore/data/explore-listings";

import { useAuth } from "@lib/auth/useAuth";
import { useRouter } from "next/navigation";

function formatPrice(price: number, mode: ExploreListing["mode"]) {
  const formatter = new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  });

  return mode === "rent"
    ? `${formatter.format(price)} / mes`
    : formatter.format(price);
}

export function ExploreListingCard({ listing }: { listing: ExploreListing }) {
  const router = useRouter();
  const { isAuthenticated, role } = useAuth();
  const typeMeta = exploreTypeMeta[listing.type];
  const modeLabel = listing.mode === "sale" ? "Venta" : "Renta";
  const isClient = role === 3;

  return (
    <Card className="gap-0 overflow-hidden py-0">
      <div className="relative h-52 overflow-hidden border-b bg-muted">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.14),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(90,103,255,0.18),transparent_34%)]" />
        <div className="relative flex h-full items-center justify-center">
          <Image
            src={typeMeta.imageSrc}
            alt={typeMeta.label}
            className="size-28 object-contain opacity-95"
          />
        </div>

        <div className="absolute top-3 left-3 flex gap-2">
          <span className="rounded-full border bg-background/90 px-2.5 py-1 text-[11px] font-medium text-foreground backdrop-blur">
            {typeMeta.label}
          </span>
          <span className="rounded-full border bg-background/90 px-2.5 py-1 text-[11px] font-medium text-foreground backdrop-blur">
            {modeLabel}
          </span>
        </div>

        {listing.featured ? (
          <span className="absolute top-3 right-3 rounded-full border bg-background/90 px-2.5 py-1 text-[11px] font-medium text-foreground backdrop-blur">
            Destacada
          </span>
        ) : null}
      </div>

      <div className="space-y-4 p-4">
        <div className="space-y-1">
          <h3 className="text-base font-medium text-foreground">
            {listing.title}
          </h3>
          <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <HugeiconsIcon icon={Location01Icon} size={15} />
            <span>
              {listing.neighborhood}, {listing.city}
            </span>
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3 text-sm">
          <Stat
            icon={BedDoubleIcon}
            label="Recamaras"
            value={listing.bedrooms ?? "-"}
          />
          <Stat
            icon={ShowerHeadIcon}
            label="Banos"
            value={listing.bathrooms ?? "-"}
          />
          <Stat icon={RulerIcon} label="m2" value={listing.area} />
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0 flex-1">
            <p className="text-xs text-muted-foreground">Precio</p>
            <p className="text-base font-medium text-foreground">
              {formatPrice(listing.price, listing.mode)}
            </p>
          </div>

          <Button 
            size="sm" 
            className="h-9 rounded-2xl px-4 text-xs"
            onClick={() => {
              if (!isAuthenticated) {
                router.push("/auth/login");
              } else if (isClient) {
                // Here we would open the visit modal or detail
                router.push(`/explore/${listing.id}`);
              } else {
                router.push("/admin/properties");
              }
            }}
          >
            {!isAuthenticated 
              ? "Ver mas" 
              : isClient 
                ? (listing.mode === "rent" ? "Rentar" : "Comprar") 
                : "Gestionar"}
          </Button>
        </div>
      </div>
    </Card>
  );
}

function Stat({
  icon,
  label,
  value,
}: {
  icon: typeof Building06Icon;
  label: string;
  value: number | string;
}) {
  return (
    <div className="rounded-3xl bg-muted/70 px-3 py-2">
      <div className="mb-1 flex items-center gap-1.5 text-muted-foreground">
        <HugeiconsIcon icon={icon} size={14} />
        <span className="text-[11px]">{label}</span>
      </div>
      <p className="text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}
