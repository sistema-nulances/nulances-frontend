"use client";

import { Suspense } from "react";
import * as React from "react";
import { useRouter } from "next/navigation";

import { AdminMarketplaceAnunciosContent } from "@/app/(private-routes)/admin/marketplace/anuncios/admin-marketplace-anuncios-content";
import { SellerCriarAnuncioSheet } from "@/components/seller/seller-criar-anuncio-sheet";
import { SkeletonMarketplaceAnunciosGrid } from "@/components/skeletons";
import { useToast } from "@/components/ui/use-toast";
import { buscarPainelPlanosVendedor } from "@/lib/repositories/vendedor-planos-repository";

export default function SellerMeusAnunciosPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [createSheetOpen, setCreateSheetOpen] = React.useState(false);
  const [refreshSignal, setRefreshSignal] = React.useState(0);
  const [checkingPlano, setCheckingPlano] = React.useState(true);
  const [hasPlanoAtivo, setHasPlanoAtivo] = React.useState(false);
  const [anunciosDisponiveis, setAnunciosDisponiveis] = React.useState<number | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      setCheckingPlano(true);
      try {
        const painel = await buscarPainelPlanosVendedor();
        if (cancelled) return;
        const status = String(painel.assinaturaAtual?.status ?? "").toUpperCase();
        const disponiveis = Number(painel.assinaturaAtual?.anunciosDisponiveis ?? 0);
        setHasPlanoAtivo(status === "ATIVA" && disponiveis > 0);
        setAnunciosDisponiveis(disponiveis);
      } catch {
        if (cancelled) return;
        setHasPlanoAtivo(false);
        setAnunciosDisponiveis(null);
      } finally {
        if (!cancelled) setCheckingPlano(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [refreshSignal]);

  return (
    <Suspense fallback={<SkeletonMarketplaceAnunciosGrid />}>
      {!hasPlanoAtivo ? (
        <div className="mb-4 rounded-2xl bg-white px-4 py-3 text-sm text-zinc-700 ring-1 ring-zinc-200">
            {checkingPlano
              ? "Verificando sua assinatura..."
              : anunciosDisponiveis === 0
                ? "Seu plano está ativo, mas você não tem anúncios disponíveis no ciclo atual."
                : "Você precisa de um plano ativo para publicar anúncios."}
        </div>
      ) : null}
      <AdminMarketplaceAnunciosContent
        allowApproveAction={false}
        showSellerInfo={false}
        allowCreateAction
        createActionLabel="Criar anúncio"
        onCreateAction={() => {
          if (!hasPlanoAtivo) {
            toast({
              type: "warning",
              title: "Plano necessário",
              description: "Escolha um plano para liberar a criação de anúncios.",
            });
            router.push("/painel-vendedor/planos");
            return;
          }
          setCreateSheetOpen(true);
        }}
        dataSource="sellerApi"
        refreshSignal={refreshSignal}
      />
      <SellerCriarAnuncioSheet
        open={createSheetOpen}
        onClose={() => setCreateSheetOpen(false)}
        onCreated={() => {
          setRefreshSignal((prev) => prev + 1);
          router.refresh();
        }}
      />
    </Suspense>
  );
}
