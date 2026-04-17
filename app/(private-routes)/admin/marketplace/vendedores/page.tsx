import { Suspense } from "react";

import { SkeletonVendedoresList } from "@/components/skeletons";
import { AdminMarketplaceVendedoresContent } from "./admin-marketplace-vendedores-content";

export default function AdminMarketplaceVendedoresPage() {
  return (
    <Suspense fallback={<SkeletonVendedoresList />}>
      <AdminMarketplaceVendedoresContent />
    </Suspense>
  );
}
