"use client";

import * as React from "react";
import { AuctionIcon, Clock01Icon, LegalHammerIcon } from "@hugeicons/core-free-icons";
import { PageHeader } from "@/components/ui/page-header";
import { AdminMetricTile } from "@/components/admin/dashboard/admin-metric-tile";
import { AdminDashboardPanel } from "@/components/admin/dashboard/admin-dashboard-panel";
import {
  AdminDashboardTextLink,
  AuctionLiveRow,
  type AuctionLiveRowItem,
} from "@/components/admin/dashboard/auction-dashboard-rows";
import { buscarResumoDashboardLeiloesAdmin } from "@/lib/repositories/admin-dashboard-repository";
import { formatDashboardDateTime } from "@/lib/format-dashboard-datetime";
import type { AuctionStatus } from "@/data/auction-items";

const LIVE_PREVIEW_LIMIT = 3;

type DashboardState = {
  totalLotesCadastrados: number;
  totalLeiloesAoVivo: number;
  totalLeiloesEmBreve: number;
  leiloesAoVivo: AuctionLiveRowItem[];
};

function formatMoney(value?: number | null): string | undefined {
  if (value == null || Number.isNaN(Number(value))) return undefined;
  return Number(value).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function toAuctionStatus(raw?: string | null): AuctionStatus {
  const s = String(raw ?? "").toUpperCase();
  if (s === "ABERTO") return "ABERTO";
  if (s === "AGUARDANDO_ABERTURA" || s === "EM_BREVE") return "EM_BREVE";
  return "ENCERRADO";
}

export function AuctionAdminDashboard() {
  const [state, setState] = React.useState<DashboardState>({
    totalLotesCadastrados: 0,
    totalLeiloesAoVivo: 0,
    totalLeiloesEmBreve: 0,
    leiloesAoVivo: [],
  });
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await buscarResumoDashboardLeiloesAdmin(LIVE_PREVIEW_LIMIT);
      setState({
        totalLotesCadastrados: res.totalLotesCadastrados ?? 0,
        totalLeiloesAoVivo: res.totalLeiloesAoVivo ?? 0,
        totalLeiloesEmBreve: res.totalLeiloesEmBreve ?? 0,
        leiloesAoVivo: (res.leiloesAoVivo ?? []).map((row) => ({
          titulo: row.tituloLeilao || "Leilão",
          dataEncerramento: row.encerraEm ? formatDashboardDateTime(row.encerraEm) : "-",
          lote: row.lote || "Lote",
          local: row.local || "Online",
          status: toAuctionStatus(row.status),
          lanceAtual: formatMoney(row.lanceAtual),
          lanceInicial: undefined,
        })),
      });
    } catch (e) {
      const message = e instanceof Error ? e.message : "Falha ao carregar dashboard.";
      setError(message);
      setState((prev) => ({ ...prev, leiloesAoVivo: [] }));
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void load();
  }, [load]);

  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle="Resumo rápido. Detalhes ficam em Leilões, Lotes e Documentos."
      />

      <div className="grid max-w-375 grid-cols-1 gap-4 sm:grid-cols-3">
        <AdminMetricTile
          label="Lotes cadastrados"
          value={loading ? "..." : state.totalLotesCadastrados}
          icon={AuctionIcon}
          accent="purple"
        />
        <AdminMetricTile
          label="Ao vivo"
          value={loading ? "..." : state.totalLeiloesAoVivo}
          icon={LegalHammerIcon}
          accent="emerald"
        />
        <AdminMetricTile
          label="Em breve"
          value={loading ? "..." : state.totalLeiloesEmBreve}
          icon={Clock01Icon}
          accent="amber"
        />
      </div>

      <div className="mt-8">
        <AdminDashboardPanel
          title="Leilões ao vivo"
          subtitle="Amostra dos que recebem lance agora."
          headerAction={
            <AdminDashboardTextLink href="/admin/leiloes">Abrir leilões →</AdminDashboardTextLink>
          }
        >
          {loading ? (
            <p className="text-sm text-zinc-500">Carregando leilões ao vivo...</p>
          ) : error ? (
            <p className="text-sm text-red-600">
              Não foi possível carregar agora. <button type="button" className="underline" onClick={() => void load()}>Tentar novamente</button>
            </p>
          ) : state.leiloesAoVivo.length === 0 ? (
            <p className="text-sm text-zinc-500">Nenhum leilão aberto no momento.</p>
          ) : (
            <div>
              {state.leiloesAoVivo.map((item, idx) => (
                <AuctionLiveRow key={`${item.titulo}-${item.lote}-${idx}`} item={item} />
              ))}
            </div>
          )}
        </AdminDashboardPanel>
      </div>
    </>
  );
}
