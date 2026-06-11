"use client";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useProperty } from "@/modules/properties/application/get/hooks/useProperty";

type PropertyDetailPageContentProps = {
  uuid: string;
};

function formatBoolean(value?: boolean) {
  return value ? "Sí" : "No";
}

function formatArea(value?: number) {
  if (!value) return "-";

  return `${value} m²`;
}

function getModalityLabel(modalityId?: number) {
  if (modalityId === 1) return "Venta";
  if (modalityId === 2) return "Renta";
  if (modalityId === 3) return "Venta y renta";

  return "Sin modalidad";
}

function getStatusLabel(statusId?: number) {
  if (statusId === 1) return "Borrador";
  if (statusId === 2) return "Disponible";
  if (statusId === 3) return "Apartada";
  if (statusId === 4) return "Vendida / Rentada";
  if (statusId === 5) return "Eliminada";

  return "Sin estado";
}

export function PropertyDetailPageContent({
  uuid,
}: PropertyDetailPageContentProps) {
  const router = useRouter();
 const propertyQuery = useProperty(uuid ?? "");
const property = propertyQuery.data;
  if (propertyQuery.isLoading) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-10">
        <Card className="p-8">
          <p className="text-sm text-muted-foreground">
            Cargando detalle de la propiedad...
          </p>
        </Card>
      </main>
    );
  }

  if (propertyQuery.isError) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-10">
        <Card className="space-y-4 p-8">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">
              No pudimos cargar el detalle
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              El endpoint de detalle respondió con error. Si estás usando una
              cuenta cliente, probablemente el backend todavía está bloqueando
              este detalle con permisos.
            </p>
          </div>

          <Button type="button" variant="outline" onClick={() => router.back()}>
            Volver
          </Button>
        </Card>
      </main>
    );
  }

  if (!property) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-10">
        <Card className="space-y-4 p-8">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">
              Propiedad no encontrada
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              No se encontró información para esta propiedad.
            </p>
          </div>

          <Button type="button" variant="outline" onClick={() => router.back()}>
            Volver
          </Button>
        </Card>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl space-y-6 px-4 py-10">
      <Button type="button" variant="outline" onClick={() => router.back()}>
        Volver
      </Button>

      <section className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        <Card className="overflow-hidden p-0">
          <div className="flex min-h-72 items-center justify-center bg-muted">
            <div className="text-center">
              <p className="text-sm font-medium text-muted-foreground">
                Imagen de la propiedad
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Todavía no hay foto pública disponible
              </p>
            </div>
          </div>

          <div className="space-y-4 p-6">
            <div>
              <div className="mb-3 flex flex-wrap gap-2">
                <span className="rounded-full border bg-card px-3 py-1 text-xs text-muted-foreground">
                  {getModalityLabel(property.modalityId)}
                </span>

                <span className="rounded-full border bg-card px-3 py-1 text-xs text-muted-foreground">
                  {getStatusLabel(property.statusId)}
                </span>

                {property.isFeatured ? (
                  <span className="rounded-full border bg-card px-3 py-1 text-xs text-muted-foreground">
                    Destacada
                  </span>
                ) : null}
              </div>

              <h1 className="text-3xl font-semibold text-foreground">
                {property.title}
              </h1>

              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                {property.description}
              </p>
            </div>
          </div>
        </Card>

        <Card className="h-fit space-y-5 p-6">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Información general
            </h2>
            <p className="text-sm text-muted-foreground">
              Datos principales de la propiedad.
            </p>
          </div>

          <div className="space-y-3 text-sm">
            <DetailRow label="UUID" value={property.propertyUuid} />
            <DetailRow label="Subtipo" value={property.subtype} />
            <DetailRow
              label="Área de terreno"
              value={formatArea(property.lotArea)}
            />
            <DetailRow
              label="Tipo de propiedad"
              value={`ID ${property.propertyTypeId}`}
            />
            <DetailRow
              label="Dirección pública"
              value={formatBoolean(property.location?.isPublicAddress)}
            />
          </div>
        </Card>
      </section>

      {property.residential ? (
        <Card className="space-y-5 p-6">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Características residenciales
            </h2>
            <p className="text-sm text-muted-foreground">
              Información específica de vivienda.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <InfoBox label="Recámaras" value={property.residential.bedrooms} />
            <InfoBox label="Baños" value={property.residential.bathrooms} />
            <InfoBox label="Camas" value={property.residential.beds} />
            <InfoBox label="Pisos" value={property.residential.floors} />
            <InfoBox
              label="Estacionamientos"
              value={property.residential.parkingSpots}
            />
            <InfoBox
              label="Área construida"
              value={formatArea(property.residential.builtArea)}
            />
            <InfoBox
              label="Año de construcción"
              value={property.residential.constructionYear}
            />
            <InfoBox
              label="Amueblada"
              value={formatBoolean(property.residential.isFurnished)}
            />
          </div>
        </Card>
      ) : null}

      {property.commercial ? (
        <Card className="space-y-5 p-6">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Características comerciales
            </h2>
            <p className="text-sm text-muted-foreground">
              Información específica para propiedad comercial.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <InfoBox
              label="Altura de techo"
              value={formatArea(property.commercial.ceilingHeight)}
            />
            <InfoBox
              label="Andenes de carga"
              value={property.commercial.loadingDocks}
            />
            <InfoBox
              label="Oficinas internas"
              value={property.commercial.internalOffices}
            />
            <InfoBox
              label="Energía trifásica"
              value={formatBoolean(property.commercial.threePhasePower)}
            />
            <InfoBox label="Uso de suelo" value={property.commercial.landUse} />
          </div>
        </Card>
      ) : null}

      {property.location ? (
        <Card className="space-y-5 p-6">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Ubicación
            </h2>
            <p className="text-sm text-muted-foreground">
              Datos de ubicación registrados en backend.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <InfoBox label="Ciudad ID" value={property.location.cityId} />
            <InfoBox label="Colonia" value={property.location.neighborhood} />
            <InfoBox label="Calle" value={property.location.street} />
            <InfoBox
              label="Número exterior"
              value={property.location.exteriorNumber}
            />
            <InfoBox
              label="Número interior"
              value={property.location.interiorNumber ?? "-"}
            />
            <InfoBox label="Código postal" value={property.location.postalCode} />
          </div>
        </Card>
      ) : null}
    </main>
  );
}

function DetailRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b pb-2 last:border-b-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium text-foreground">{value}</span>
    </div>
  );
}

function InfoBox({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-3xl bg-muted/70 px-4 py-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}