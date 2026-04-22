"use client";

import * as React from "react";
import { AuctionIcon, Clock01Icon, SaleTag02Icon, ShoppingBag01Icon } from "@hugeicons/core-free-icons";

import { AdminDashboardTextLink } from "@/components/admin/dashboard/auction-dashboard-rows";
import {
  ActivityFeedRow,
  ModerationQueueRow,
} from "@/components/admin/marketplace/marketplace-dashboard-rows";
import { AdminDashboardPanel } from "@/components/admin/dashboard/admin-dashboard-panel";
import { AdminMetricTile } from "@/components/admin/dashboard/admin-metric-tile";
import { PageHeader } from "@/components/ui/page-header";
import { useToast } from "@/components/ui/use-toast";
import { MARKETPLACE_ANUNCIOS_MODERACAO_QUERY, marketplaceAdminRecentActivity } from "@/data/marketplace-admin-mock";
import { marketplaceItems } from "@/data/marketplace-items";
import { computeMarketplaceDashboardCounts } from "@/lib/admin-marketplace-dashboard";
import { listarFilaModeracaoDashboard } from "@/lib/repositories/admin-anuncios-repository";
import type { AnuncioModerarListResponse } from "@/lib/repositories/types/admin-anuncios.types";
import { ApiError } from "@/lib/repositories/types/auth.types";

const MODERACAO_LIMITE_PREVIEW = 4;
const ATIVIDADE_LIMITE_PREVIEW = 6;

export function MarketplaceAdminDashboard() {
  const { toast } = useToast();
  const stats = React.useMemo(() => computeMarketplaceDashboardCounts(marketplaceItems), []);

  const [filaPreview, setFilaPreview] = React.useState<AnuncioModerarListResponse[]>([]);
  const [filaTotal, setFilaTotal] = React.useState(0);
  const [filaLoading, setFilaLoading] = React.useState(true);
  const [filaError, setFilaError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      setFilaLoading(true);
      setFilaError(null);
      try {
        const page = await listarFilaModeracaoDashboard({
          page: 0,
          size: MODERACAO_LIMITE_PREVIEW,
        });
        if (cancelled) return;
        setFilaPreview(page.content ?? []);
        setFilaTotal(page.totalElements ?? 0);
      } catch (err) {
        if (cancelled) return;
        setFilaPreview([]);
        setFilaTotal(0);
        const msg = err instanceof ApiError ? err.message : err instanceof Error ? err.message : "Não foi possível carregar a fila.";
        setFilaError(msg);
        toast({ type: "error", title: "Fila de moderação", description: msg });
      } finally {
        if (!cancelled) setFilaLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [toast]);

  const atividadePreview = React.useMemo(
    () => marketplaceAdminRecentActivity.slice(0, ATIVIDADE_LIMITE_PREVIEW),
    []
  );

  const anunciosModeracaoHref = `/admin/marketplace/anuncios?${MARKETPLACE_ANUNCIOS_MODERACAO_QUERY}`;

  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle="Resumo do marketplace. Detalhes em Anúncios e Vendedores."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdminMetricTile label="Anúncios no catálogo" value={stats.total} icon={ShoppingBag01Icon} accent="purple" />
        <AdminMetricTile label="Publicados" value={stats.aberto} icon={SaleTag02Icon} accent="emerald" />
        <AdminMetricTile label="Em breve" value={stats.emBreve} icon={Clock01Icon} accent="amber" />
        <AdminMetricTile label="Encerrados" value={stats.encerrado} icon={AuctionIcon} accent="zinc" />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
        <AdminDashboardPanel
          title="Fila de moderação"
          subtitle={
            filaLoading
              ? "Carregando fila..."
              : `${filaTotal} anúncio${filaTotal === 1 ? "" : "s"} aguardando aprovação para ir ao ar.`
          }
          headerAction={
            <AdminDashboardTextLink href={anunciosModeracaoHref}>Abrir fila completa →</AdminDashboardTextLink>
          }
        >
          {filaError ? (
            <p className="text-sm text-red-600">{filaError}</p>
          ) : filaLoading ? (
            <p className="text-sm text-zinc-500">Carregando...</p>
          ) : filaPreview.length === 0 ? (
            <p className="text-sm text-zinc-500">Nenhum anúncio na fila no momento.</p>
          ) : (
            <div>
              {filaPreview.map((item) => (
                <ModerationQueueRow key={item.id} item={item} />
              ))}
            </div>
          )}
        </AdminDashboardPanel>

        <AdminDashboardPanel
          title="Últimas movimentações"
          subtitle="Novos anúncios, edições relevantes e encerramentos recentes."
          headerAction={
            <AdminDashboardTextLink href="/admin/marketplace/anuncios">Ver anúncios →</AdminDashboardTextLink>
          }
        >
          <div>
            {atividadePreview.map((ev) => (
              <ActivityFeedRow key={ev.id} event={ev} />
            ))}
          </div>
        </AdminDashboardPanel>
      </div>
    </>
  );
}
