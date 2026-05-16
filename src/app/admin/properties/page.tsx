"use client";

import { Button } from "@heroui/react";

import { PageHeader } from "@components/layout/PageHeader";
import { PropertiesPageContent } from "@properties/components/PropertiesPageContent";

export default function AdminPropertiesPage() {
  return (
    <div className="admin-page-view flex min-h-full flex-col gap-6">
      <PageHeader
        title="Propiedades"
        description="Administra el inventario de propiedades desde esta seccion."
        actions={<Button>Agregar propiedad</Button>}
      />
      <PropertiesPageContent />
    </div>
  );
}
