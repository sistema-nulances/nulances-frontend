"use client";

import { Suspense } from "react";
import * as React from "react";
import { useRouter } from "next/navigation";

import { AdminMarketplaceAnunciosContent } from "@/app/(private-routes)/admin/marketplace/anuncios/admin-marketplace-anuncios-content";
import { SellerCriarAnuncioSheet } from "@/components/seller/seller-criar-anuncio-sheet";
import { SkeletonMarketplaceAnunciosGrid } from "@/components/skeletons";

export default function SellerMeusAnunciosPage() {
  const router = useRouter();
  const [createSheetOpen, setCreateSheetOpen] = React.useState(false);
  const [refreshSignal, setRefreshSignal] = React.useState(0);

  return (
    <Suspense fallback={<SkeletonMarketplaceAnunciosGrid />}>
      <AdminMarketplaceAnunciosContent
        allowApproveAction={false}
        showSellerInfo={false}
        allowCreateAction
        createActionLabel="Criar anúncio"
        onCreateAction={() => setCreateSheetOpen(true)}
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
