import { TransporterDetail } from "~/components/pt-pks/datamaster/transportir";

interface TransporterDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function TransporterDetailPage({ params }: TransporterDetailPageProps) {
  const { id } = await params;

  return <TransporterDetail transporterId={id} />;
}

