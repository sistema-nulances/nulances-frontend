import { PageHeader } from "@/components/ui/page-header";

export function MarketplaceAdminPlaceholder({ title }: { title: string }) {
  return (
    <>
      <PageHeader title={title} subtitle="Esta área será preenchida em breve." />
      <p className="text-sm text-zinc-500">Conteúdo em construção.</p>
    </>
  );
}
