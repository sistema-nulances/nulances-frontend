"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import { LockPasswordIcon } from "@hugeicons/core-free-icons";

import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";

export default function UnauthorizedPage() {
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get("returnUrl")?.trim() || "/";
  const loginHref = `/auth?returnUrl=${encodeURIComponent(returnUrl)}`;

  return (
    <main className="min-h-screen bg-[var(--background)] pb-[calc(4.5rem+env(safe-area-inset-bottom))] md:pb-0">
      <Header />
      <section className="mx-auto w-full max-w-375 px-4 py-12 md:py-16">
        <div className="rounded-3xl border border-zinc-200 bg-white p-8 text-center sm:p-10">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-indigo-200 bg-indigo-50 text-indigo-700">
            <HugeiconsIcon icon={LockPasswordIcon} size={30} color="currentColor" strokeWidth={1.9} />
          </div>
          <p className="mt-6 text-sm font-semibold uppercase tracking-[0.14em] text-indigo-600">Erro 401</p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">Autenticação necessária</h1>
          <p className="mt-3 text-sm text-zinc-600 sm:text-base">
            Você precisa entrar na sua conta para acessar esta área.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href={loginHref}
              className="inline-flex h-11 items-center justify-center rounded-full bg-[var(--nulance-purple)] px-7 text-sm font-semibold text-white hover:opacity-95"
            >
              Fazer login
            </Link>
            <Link
              href="/"
              className="inline-flex h-11 items-center justify-center rounded-full border border-[#63146c] bg-white px-7 text-sm font-semibold text-zinc-900 hover:bg-zinc-50"
            >
              Voltar ao início
            </Link>
          </div>
        </div>
      </section>
      <Footer />
      <MobileBottomNav />
    </main>
  );
}
