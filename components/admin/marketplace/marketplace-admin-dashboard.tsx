"use client";

import * as React from "react";
import Link from "next/link";
import { AuctionIcon, Clock01Icon, SaleTag02Icon, ShoppingBag01Icon } from "@hugeicons/core-free-icons";

import { AdminDashboardTextLink } from "@/components/admin/dashboard/auction-dashboard-rows";
import {
  ActivityFeedRow,
  ModerationQueueRow,
} from "@/components/admin/marketplace/marketplace-dashboard-rows";
import { AdminDashboardPanel } from "@/components/admin/dashboard/admin-dashboard-panel";
import { AdminMetricTile } from "@/components/admin/dashboard/admin-metric-tile";
import { PageHeader } from "@/components/ui/page-header";
import {
  MARKETPLACE_ANUNCIOS_MODERACAO_QUERY,
  marketplaceAdminPendingModeration,
  marketplaceAdminRecentActivity,
} from "@/data/marketplace-admin-mock";
import { marketplaceItems } from "@/data/marketplace-items";
import { computeMarketplaceDashboardCounts } from "@/lib/admin-marketplace-dashboard";

const MODERACAO_LIMITE_PREVIEW = 4;
const ATIVIDADE_LIMITE_PREVIEW = 6;

export function MarketplaceAdminDashboard() {
  const stats = React.useMemo(() => computeMarketplaceDashboardCounts(marketplaceItems), []);

  const filaCount = marketplaceAdminPendingModeration.length;
  const filaPreview = React.useMemo(
    () => marketplaceAdminPendingModeration.slice(0, MODERACAO_LIMITE_PREVIEW),
    []
  );
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
          subtitle={`${filaCount} anúncio${filaCount === 1 ? "" : "s"} aguardando aprovação para ir ao ar.`}
          headerAction={
            <AdminDashboardTextLink href={anunciosModeracaoHref}>Abrir fila completa →</AdminDashboardTextLink>
          }
        >
          {filaPreview.length === 0 ? (
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

      <div className="mt-8">
        <AdminDashboardPanel
          title="Atalhos"
          subtitle="Acesse as áreas principais do admin do marketplace."
        >
          <ul className="flex flex-col gap-2 text-sm">
            <li>
              <Link
                href={anunciosModeracaoHref}
                className="font-medium text-[var(--nulance-purple)] hover:underline"
              >
                Moderação pendente ({filaCount}) →
              </Link>
            </li>
            <li>
              <Link
                href="/admin/marketplace/anuncios"
                className="font-medium text-[var(--nulance-purple)] hover:underline"
              >
                Anúncios →
              </Link>
            </li>
            <li>
              <Link
                href="/admin/marketplace/vendedores"
                className="font-medium text-[var(--nulance-purple)] hover:underline"
              >
                Vendedores →
              </Link>
            </li>
            <li>
              <Link
                href="/admin/marketplace/banners"
                className="font-medium text-[var(--nulance-purple)] hover:underline"
              >
                Banners →
              </Link>
            </li>
            <li>
              <Link
                href="/admin/marketplace/usuarios"
                className="font-medium text-[var(--nulance-purple)] hover:underline"
              >
                Gestão de usuários →
              </Link>
            </li>
          </ul>
        </AdminDashboardPanel>
      </div>
    </>
  );
}
