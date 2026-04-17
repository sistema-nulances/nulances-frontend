import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { Search01Icon } from "@hugeicons/core-free-icons";

import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[var(--background)] pb-[calc(4.5rem+env(safe-area-inset-bottom))] md:pb-0">
      <Header />
      <section className="mx-auto w-full max-w-375 px-4 py-12 md:py-16">
        <div className="rounded-3xl border border-zinc-200 bg-white p-8 text-center sm:p-10">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-sky-200 bg-sky-50 text-sky-700">
            <HugeiconsIcon icon={Search01Icon} size={30} color="currentColor" strokeWidth={1.9} />
          </div>
          <p className="mt-6 text-sm font-semibold uppercase tracking-[0.14em] text-sky-600">Erro 404</p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">Página não encontrada</h1>
          <p className="mt-3 text-sm text-zinc-600 sm:text-base">
            O conteúdo que você tentou acessar não existe ou foi movido.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/"
              className="inline-flex h-11 items-center justify-center rounded-full bg-[var(--nulance-purple)] px-7 text-sm font-semibold text-white hover:opacity-95"
            >
              Ir para início
            </Link>
            <Link
              href="/marketplace"
              className="inline-flex h-11 items-center justify-center rounded-full border border-[#63146c] bg-white px-7 text-sm font-semibold text-zinc-900 hover:bg-zinc-50"
            >
              Ver marketplace
            </Link>
          </div>
        </div>
      </section>
      <Footer />
      <MobileBottomNav />
    </main>
  );
}
