"use client";

import * as React from "react";
import { AuctionIcon, Clock01Icon, SaleTag02Icon, ShoppingBag01Icon } from "@hugeicons/core-free-icons";

import { AdminDashboardTextLink } from "@/components/admin/dashboard/auction-dashboard-rows";
import { ModerationQueueRow } from "@/components/admin/marketplace/marketplace-dashboard-rows";
import { AdminDashboardPanel } from "@/components/admin/dashboard/admin-dashboard-panel";
import { AdminMetricTile } from "@/components/admin/dashboard/admin-metric-tile";
import { PageHeader } from "@/components/ui/page-header";
import { useToast } from "@/components/ui/use-toast";
import { MARKETPLACE_ANUNCIOS_MODERACAO_QUERY } from "@/data/marketplace-admin-mock";
import {
  buscarDashboardStatsMarketplace,
  listarFilaModeracaoDashboard,
} from "@/lib/repositories/admin-anuncios-repository";
import type {
  AnuncioModerarListResponse,
  DashboardStatsMarketplaceResponse,
} from "@/lib/repositories/types/admin-anuncios.types";
import { ApiError } from "@/lib/repositories/types/auth.types";

const MODERACAO_LIMITE_PREVIEW = 4;

const EMPTY_STATS: DashboardStatsMarketplaceResponse = {
  totalAnuncios: 0,
  totalPublicados: 0,
  totalPendentes: 0,
  totalSuspensos: 0,
};

export function MarketplaceAdminDashboard() {
  const { toast } = useToast();
  const [stats, setStats] = React.useState<DashboardStatsMarketplaceResponse>(EMPTY_STATS);

  const [filaPreview, setFilaPreview] = React.useState<AnuncioModerarListResponse[]>([]);
  const [filaTotal, setFilaTotal] = React.useState(0);
  const [filaLoading, setFilaLoading] = React.useState(true);
  const [filaError, setFilaError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const response = await buscarDashboardStatsMarketplace();
        if (cancelled) return;
        setStats({
          totalAnuncios: response.totalAnuncios ?? 0,
          totalPublicados: response.totalPublicados ?? 0,
          totalPendentes: response.totalPendentes ?? 0,
          totalSuspensos: response.totalSuspensos ?? 0,
        });
      } catch (err) {
        if (cancelled) return;
        setStats(EMPTY_STATS);
        const msg =
          err instanceof ApiError
            ? err.message
            : err instanceof Error
              ? err.message
              : "Não foi possível carregar as estatísticas.";
        toast({ type: "error", title: "Estatísticas do dashboard", description: msg });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [toast]);

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

  const anunciosModeracaoHref = `/admin/marketplace/anuncios?${MARKETPLACE_ANUNCIOS_MODERACAO_QUERY}`;

  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle="Resumo do marketplace. Detalhes em Anúncios e Vendedores."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdminMetricTile
          label="Anúncios no catálogo"
          value={stats.totalAnuncios}
          icon={ShoppingBag01Icon}
          accent="purple"
        />
        <AdminMetricTile label="Publicados" value={stats.totalPublicados} icon={SaleTag02Icon} accent="emerald" />
        <AdminMetricTile label="Pendentes" value={stats.totalPendentes} icon={Clock01Icon} accent="amber" />
        <AdminMetricTile label="Suspensos" value={stats.totalSuspensos} icon={AuctionIcon} accent="zinc" />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8">
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
      </div>
    </>
  );
}
