import { Suspense } from "react";

import { SkeletonBensItensGrid } from "@/components/skeletons";
import { BensItensPageContent } from "./bens-itens-page-content";

export default function AdminBensItensPage() {
  return (
    <Suspense fallback={<SkeletonBensItensGrid />}>
      <BensItensPageContent />
    </Suspense>
  );
}
