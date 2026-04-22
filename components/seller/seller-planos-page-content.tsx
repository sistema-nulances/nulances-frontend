"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/components/providers/auth-provider";
import { PlanCard } from "@/components/ui/plan-card";
import { PageHeader } from "@/components/ui/page-header";
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

      <div className="rounded-2xl bg-white p-4 text-sm text-zinc-600 ring-1 ring-zinc-200">
        Seu perfil vendedor precisa de um plano ativo para criar anúncios.
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 xl:grid-cols-3">
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
    </div>
  );
}
