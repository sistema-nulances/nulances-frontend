import { redirect } from "next/navigation";
import { AuctionAdminDashboard } from "@/components/admin/dashboard/auction-admin-dashboard";

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ leilao?: string }>;
}) {
  const sp = await searchParams;
  if (sp.leilao) {
    redirect(`/admin/leiloes/${encodeURIComponent(sp.leilao)}`);
  }
  return <AuctionAdminDashboard />;
}
