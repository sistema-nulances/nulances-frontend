"use client";

import { Suspense } from "react";
import * as React from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/components/providers/auth-provider";
import { AdminMarketplaceAnunciosContent } from "@/app/(private-routes)/admin/marketplace/anuncios/admin-marketplace-anuncios-content";
import { SellerCriarAnuncioSheet } from "@/components/seller/seller-criar-anuncio-sheet";
import { SkeletonMarketplaceAnunciosGrid } from "@/components/skeletons";
import { useToast } from "@/components/ui/use-toast";
import {
  MARKETPLACE_PLANOS_UPDATED_EVENT,
  carregarAssinaturaPlanoMarketplace,
} from "@/lib/marketplace-planos";

export default function SellerMeusAnunciosPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const [createSheetOpen, setCreateSheetOpen] = React.useState(false);
  const [refreshSignal, setRefreshSignal] = React.useState(0);
  const [hasPlanoAtivo, setHasPlanoAtivo] = React.useState(false);

  React.useEffect(() => {
    const refreshPlano = () => {
      const uid = user?.id?.trim();
      const assinatura = uid ? carregarAssinaturaPlanoMarketplace(uid) : null;
      setHasPlanoAtivo(Boolean(assinatura));
    };
    refreshPlano();
    window.addEventListener(MARKETPLACE_PLANOS_UPDATED_EVENT, refreshPlano);
    return () => window.removeEventListener(MARKETPLACE_PLANOS_UPDATED_EVENT, refreshPlano);
  }, [user?.id]);

  return (
    <Suspense fallback={<SkeletonMarketplaceAnunciosGrid />}>
      {!hasPlanoAtivo ? (
        <div className="mb-4 rounded-2xl bg-white px-4 py-3 text-sm text-zinc-700 ring-1 ring-zinc-200">
          Você precisa assinar um plano para publicar anúncios.
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
