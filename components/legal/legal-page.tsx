import React from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { cn } from "@/lib/cn";

export function LegalPage({
  title,
  subtitle,
  children,
  withCard = true,
  fullWidthContent = false,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  withCard?: boolean;
  fullWidthContent?: boolean;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--background)]">
      <Header />

      <main className="flex-1 py-10 md:py-16">
        <div className="mx-auto w-full max-w-375 px-4 sm:px-6 lg:px-8">
          <div className="mb-8 max-w-3xl">
            <h1 className="text-3xl font-bold tracking-tight text-zinc-950 sm:text-4xl">
              {title}
            </h1>
            {subtitle ? <p className="mt-3 text-base text-zinc-500 leading-relaxed">{subtitle}</p> : null}
          </div>

          {withCard ? (
            <div className="rounded-3xl bg-white p-6 ring-1 ring-zinc-200 sm:p-8">
              <div className={cn("space-y-6", fullWidthContent ? "w-full" : "max-w-3xl")}>{children}</div>
            </div>
          ) : (
            <div className={cn("space-y-6", fullWidthContent ? "w-full" : "max-w-3xl")}>{children}</div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

