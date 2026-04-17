import { Suspense } from "react";

import { SkeletonMarketplaceAnunciosGrid } from "@/components/skeletons";
import { AdminMarketplaceAnunciosContent } from "./admin-marketplace-anuncios-content";

export default function AdminMarketplaceAnunciosPage() {
  return (
    <Suspense fallback={<SkeletonMarketplaceAnunciosGrid />}>
      <AdminMarketplaceAnunciosContent dataSource="adminApi" />
    </Suspense>
  );
}
