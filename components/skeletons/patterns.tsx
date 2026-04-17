import { Skeleton } from "@/components/ui/skeleton";

/** Conteúdo principal do admin (padding vem do scroll area). */
export function AdminContentSkeleton() {
  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <Skeleton className="h-9 w-56 max-w-[80%] rounded-lg" />
        <Skeleton className="h-4 w-full max-w-xl rounded-md" />
      </header>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-2xl" />
        ))}
      </div>
      <Skeleton className="h-[min(360px,55vh)] w-full rounded-3xl" />
      <div className="space-y-3">
        <Skeleton className="h-4 w-full rounded-md" />
        <Skeleton className="h-4 w-[92%] rounded-md" />
        <Skeleton className="h-4 w-[78%] rounded-md" />
      </div>
    </div>
  );
}

/** Painel vendedor — mesma densidade visual do admin. */
export function SellerContentSkeleton() {
  return <AdminContentSkeleton />;
}

/** Site público: barra superior + hero + faixas de conteúdo. */
export function PublicRoutePageSkeleton() {
  return (
    <div className="min-h-[70vh] bg-[var(--background)] pb-[calc(4.5rem+env(safe-area-inset-bottom))] md:pb-0">
      <Skeleton className="h-[64px] w-full rounded-none sm:h-[72px]" />
      <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
        <Skeleton className="h-36 w-full max-w-5xl rounded-2xl sm:h-44 md:h-52" />
        <div className="mt-8 flex flex-wrap gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-24 rounded-full" />
          ))}
        </div>
        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-72 rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

/** Home: hero largo + área de grade de leilões. */
export function PublicHomeSkeleton() {
  return (
    <div className="min-h-screen bg-[var(--background)] pb-[calc(4.5rem+env(safe-area-inset-bottom))] md:pb-0">
      <Skeleton className="h-[64px] w-full rounded-none sm:h-[72px]" />
      <Skeleton className="mt-0 h-44 w-full rounded-none sm:h-52 md:h-64" />
      <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-11 w-28 rounded-full" />
          ))}
        </div>
        <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-[340px] rounded-3xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

/** Perfil / documentos: barra tipo header + formulário. */
export function ProfileRoutePageSkeleton() {
  return (
    <div className="flex min-h-[60vh] flex-col">
      <Skeleton className="h-[64px] w-full rounded-none sm:h-[72px]" />
      <div className="mx-auto w-full max-w-375 flex-1 px-4 py-10 sm:px-6 md:py-16 lg:px-8">
        <div className="space-y-3">
          <Skeleton className="h-10 w-56 rounded-lg" />
          <Skeleton className="h-4 w-full max-w-md rounded-md" />
        </div>
        <Skeleton className="mt-10 h-48 w-full rounded-3xl" />
        <div className="mt-8 space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

/** Grade de anúncios (admin marketplace + painel vendedor). */
export function SkeletonMarketplaceAnunciosGrid() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-16 max-w-xl rounded-2xl" />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-80 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

export function SkeletonBensItensGrid() {
  return (
    <div className="space-y-4">
      <Skeleton className="mb-2 h-16 max-w-xl rounded-2xl" />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-[18px]" />
        ))}
      </div>
    </div>
  );
}

export function SkeletonVendedoresList() {
  return (
    <>
      <Skeleton className="h-10 max-w-md rounded-xl" />
      <Skeleton className="mt-4 h-4 max-w-sm rounded" />
    </>
  );
}

/**
 * Conteúdo da página `/auction/[id]` enquanto a API carrega.
 * O `page` mantém Header/Footer reais; use este bloco só no miolo.
 */
export function AuctionDetailPageContentSkeleton() {
  return (
    <div aria-busy="true" aria-live="polite">
      <span className="sr-only">Carregando detalhes do leilão</span>
      <div className="mb-6 flex flex-wrap items-center gap-3 border-b border-zinc-200 pb-4">
        <Skeleton className="h-7 w-24 rounded-full" />
        <Skeleton className="h-7 w-36 rounded-full" />
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          <div className="overflow-hidden rounded-3xl bg-white p-3 ring-1 ring-zinc-200">
            <Skeleton className="aspect-video w-full rounded-2xl" />
            <div className="mt-3 grid grid-cols-3 gap-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="aspect-video rounded-xl" />
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <Skeleton className="h-10 w-full max-w-xl rounded-lg" />
            <Skeleton className="h-5 w-48 rounded-md" />
          </div>

          <div className="rounded-3xl bg-white p-6 ring-1 ring-zinc-200 sm:p-8">
            <Skeleton className="h-6 w-52 rounded-lg" />
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-14 rounded-2xl" />
              ))}
            </div>
          </div>

          <div className="rounded-3xl bg-white p-6 ring-1 ring-zinc-200 sm:p-8">
            <Skeleton className="h-5 w-40 rounded-lg" />
            <Skeleton className="mt-3 h-20 w-full rounded-xl" />
          </div>

          <div className="rounded-3xl bg-white p-6 ring-1 ring-zinc-200 sm:p-8">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
              <Skeleton className="h-6 w-48 rounded-lg" />
              <Skeleton className="h-7 w-24 rounded-full" />
            </div>
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-[4.5rem] rounded-2xl" />
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="rounded-3xl bg-white p-5 ring-1 ring-zinc-200 sm:p-6 lg:p-7">
            <div className="mb-6 flex items-center gap-3 border-b border-zinc-100 pb-5">
              <Skeleton className="h-12 w-12 shrink-0 rounded-full" />
              <div className="min-w-0 flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4 max-w-[180px] rounded-md" />
                <Skeleton className="h-3 w-1/2 max-w-[120px] rounded-md" />
              </div>
            </div>
            <Skeleton className="h-24 w-full rounded-2xl" />
            <div className="mt-4 space-y-3">
              <Skeleton className="h-4 w-full rounded-md" />
              <Skeleton className="h-10 w-full rounded-lg" />
              <Skeleton className="h-4 w-full rounded-md" />
            </div>
            <Skeleton className="mt-6 h-24 w-full rounded-xl" />
            <Skeleton className="mt-4 h-12 w-full rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

/** Rota `loading.tsx`: barra + miolo alinhado ao layout real da página de leilão. */
export function AuctionDetailPageSkeleton() {
  return (
    <div className="min-h-screen bg-[var(--background)] pb-[calc(4.5rem+env(safe-area-inset-bottom))] md:pb-0">
      <Skeleton className="h-[64px] w-full rounded-none sm:h-[72px]" />
      <main className="flex-1 py-5 md:py-8">
        <div className="mx-auto w-full max-w-375 px-4">
          <AuctionDetailPageContentSkeleton />
        </div>
      </main>
    </div>
  );
}

/** Página de anúncio do marketplace. */
export function MarketplaceDetailPageSkeleton() {
  return (
    <div className="min-h-screen bg-[var(--background)] pb-[calc(4.5rem+env(safe-area-inset-bottom))] md:pb-0">
      <Skeleton className="h-[64px] w-full rounded-none sm:h-[72px]" />
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Skeleton className="h-9 w-48 rounded-lg" />
        <div className="mt-8 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-4">
            <Skeleton className="aspect-[16/10] w-full rounded-2xl" />
            <div className="grid grid-cols-3 gap-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="aspect-[4/3] rounded-xl" />
              ))}
            </div>
          </div>
          <div className="space-y-3">
            <Skeleton className="h-10 w-full rounded-xl" />
            <Skeleton className="h-6 w-2/3 rounded-md" />
            <Skeleton className="h-48 w-full rounded-2xl" />
            <Skeleton className="h-12 w-full rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
