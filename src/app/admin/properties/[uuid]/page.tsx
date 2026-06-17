import { PropertyShowPageContent } from "@properties/components/show/PropertyShowPageContent";

type AdminPropertyShowPageProps = {
  params: Promise<{
    uuid: string;
  }>;
};

export default async function AdminPropertyShowPage({
  params,
}: AdminPropertyShowPageProps) {
  const { uuid } = await params;

  return <PropertyShowPageContent propertyUuid={uuid} />;
}
