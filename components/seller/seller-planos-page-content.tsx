"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/components/providers/auth-provider";
import { PlanCard } from "@/components/ui/plan-card";
import { PageHeader } from "@/components/ui/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import {
  MARKETPLACE_PLANOS_UPDATED_EVENT,
  carregarAssinaturaPlanoMarketplace,
  listarPlanosMarketplace,
  salvarAssinaturaPlanoMarketplace,
  type MarketplacePlano,
  type MarketplacePlanoAssinatura,
} from "@/lib/marketplace-planos";

function assinaturaLabel(assinatura: MarketplacePlanoAssinatura | null, planoId: string): string {
  if (!assinatura || assinatura.planoId !== planoId) return "";
  const when = new Date(assinatura.assinadoEm).toLocaleDateString("pt-BR");
  return `Assinado em ${when}`;
}

function formatMoney(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 2,
  }).format(value);
}

const MOCK_FATURAS = [
  { id: "fat-001", referencia: "Abr/2026", valor: 179, status: "Pago", vencimento: "2026-04-10" },
  { id: "fat-002", referencia: "Mai/2026", valor: 179, status: "Em aberto", vencimento: "2026-05-10" },
] as const;

export function SellerPlanosPageContent() {
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [planos, setPlanos] = React.useState<MarketplacePlano[]>([]);
  const [assinatura, setAssinatura] = React.useState<MarketplacePlanoAssinatura | null>(null);
  const [loadingPlanoId, setLoadingPlanoId] = React.useState<string | null>(null);

  React.useEffect(() => {
    const refresh = () => {
      setPlanos(listarPlanosMarketplace());
      const uid = user?.id?.trim();
      setAssinatura(uid ? carregarAssinaturaPlanoMarketplace(uid) : null);
    };
    refresh();
    window.addEventListener(MARKETPLACE_PLANOS_UPDATED_EVENT, refresh);
    return () => window.removeEventListener(MARKETPLACE_PLANOS_UPDATED_EVENT, refresh);
  }, [user?.id]);

  const handleAssinar = React.useCallback(
    async (planoId: MarketplacePlano["id"]) => {
      const uid = user?.id?.trim();
      if (!uid) {
        toast({
          type: "warning",
          title: "Sessão inválida",
          description: "Faça login novamente para assinar um plano.",
        });
        return;
      }
      setLoadingPlanoId(planoId);
      try {
        salvarAssinaturaPlanoMarketplace(uid, {
          planoId,
          assinadoEm: new Date().toISOString(),
        });
        setAssinatura({ planoId, assinadoEm: new Date().toISOString() });
        toast({
          type: "success",
          title: "Plano assinado",
          description: "Você já pode publicar anúncios no painel do vendedor.",
        });
        router.push("/painel-vendedor/meus-anuncios");
      } finally {
        setLoadingPlanoId(null);
      }
    },
    [router, toast, user?.id]
  );

  return (
    <div>
      <PageHeader
        title="Planos de anúncios"
        subtitle="Escolha um plano para liberar a publicação de anúncios no marketplace."
      />

      <Tabs defaultValue="planos" className="mt-2">
        <TabsList className="rounded-2xl border border-zinc-200">
          <TabsTrigger value="planos">Planos</TabsTrigger>
          <TabsTrigger value="faturamento">Faturamento</TabsTrigger>
        </TabsList>

        <TabsContent value="planos" className="mt-4 space-y-5 bg-transparent">
          <div className="rounded-2xl bg-white p-4 text-sm text-zinc-600 ring-1 ring-zinc-200">
            Seu perfil vendedor precisa de um plano ativo para criar anúncios.
          </div>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
            {planos.map((plano) => {
              const isActive = assinatura?.planoId === plano.id;
              return (
                <PlanCard
                  key={plano.id}
                  plano={plano}
                  active={isActive}
                  actionLabel={isActive ? "Plano atual" : "Assinar plano"}
                  actionDisabled={isActive}
                  actionLoading={loadingPlanoId === plano.id}
                  onAction={() => void handleAssinar(plano.id)}
                  footer={
                    isActive ? (
                      <p className="text-xs font-medium text-[var(--nulance-purple)]">
                        {assinaturaLabel(assinatura, plano.id)}
                      </p>
                    ) : null
                  }
                />
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="faturamento" className="mt-4 bg-transparent">
          <section className="rounded-3xl bg-white p-6 ring-1 ring-zinc-200">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-4">
              <div>
                <p className="text-lg font-semibold text-zinc-900">Resumo de cobrança</p>
                <p className="text-sm text-zinc-500">Informações mockadas para validação da jornada.</p>
              </div>
              <p className="text-sm font-medium text-zinc-700">
                Plano atual:{" "}
                <span className="text-[var(--nulance-purple)]">
                  {assinatura ? (planos.find((p) => p.id === assinatura.planoId)?.nome ?? "—") : "Sem plano"}
                </span>
              </p>
            </div>

            <ul className="mt-4 space-y-3">
              {MOCK_FATURAS.map((fatura) => (
                <li
                  key={fatura.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-zinc-50/70 px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-semibold text-zinc-900">{fatura.referencia}</p>
                    <p className="text-xs text-zinc-500">
                      Vencimento: {new Date(fatura.vencimento).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-zinc-900">{formatMoney(fatura.valor)}</p>
                    <p className="text-xs text-zinc-500">{fatura.status}</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </TabsContent>
      </Tabs>
    </div>
  );
}
