import { PropertyDetailPageContent } from "@/modules/explore/pages/PropertyDetailPageContent";

type PropertyDetailPageProps = {
  params: Promise<{
    uuid: string;
  }>;
};

export default async function PropertyDetailPage({
  params,
}: PropertyDetailPageProps) {
  const { uuid } = await params;

  return <PropertyDetailPageContent uuid={uuid} />;
}