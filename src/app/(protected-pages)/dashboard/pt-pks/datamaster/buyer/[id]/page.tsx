import { BuyerDetail } from "~/components/pt-pks/datamaster/buyer/buyer-detail";

interface BuyerDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function BuyerDetailPage({ params }: BuyerDetailPageProps) {
  const { id } = await params;

  return <BuyerDetail buyerId={id} />;
}

