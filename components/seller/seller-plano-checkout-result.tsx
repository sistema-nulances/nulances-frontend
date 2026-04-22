"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";

type CheckoutResultStatus = "success" | "pending" | "failure";

type SellerPlanoCheckoutResultProps = {
  status: CheckoutResultStatus;
};

function resultConfig(status: CheckoutResultStatus): {
  title: string;
  subtitle: string;
  body: string;
  cta: string;
} {
  if (status === "success") {
    return {
      title: "Pagamento recebido",
      subtitle: "Estamos confirmando sua assinatura no marketplace.",
      body: "O pagamento foi retornado com sucesso. Em instantes seu plano deve ficar ativo.",
      cta: "Ir para meus planos",
    };
  }
  if (status === "pending") {
    return {
      title: "Pagamento pendente",
      subtitle: "Seu pagamento está em análise no momento.",
      body: "Assim que o pagamento for confirmado, sua assinatura será atualizada automaticamente.",
      cta: "Acompanhar assinatura",
    };
  }
  return {
    title: "Pagamento não concluído",
    subtitle: "Não foi possível finalizar o pagamento desta tentativa.",
    body: "Você pode voltar para os planos e tentar novamente quando quiser.",
    cta: "Voltar para planos",
  };
}

export function SellerPlanoCheckoutResult({ status }: SellerPlanoCheckoutResultProps) {
  const router = useRouter();
  const cfg = resultConfig(status);

  React.useEffect(() => {
    const t = window.setTimeout(() => {
      router.replace(`/painel-vendedor/planos?status=${status}`);
    }, 2800);
    return () => window.clearTimeout(t);
  }, [router, status]);

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <PageHeader title={cfg.title} subtitle={cfg.subtitle} />

      <section className="rounded-3xl bg-white p-6 ring-1 ring-zinc-200">
        <p className="text-sm text-zinc-700">{cfg.body}</p>
        <p className="mt-2 text-xs text-zinc-500">
          Você será redirecionado automaticamente em alguns segundos.
        </p>

        <div className="mt-5">
          <Button
            type="button"
            className="rounded-full"
            onClick={() => router.replace(`/painel-vendedor/planos?status=${status}`)}
          >
            {cfg.cta}
          </Button>
        </div>
      </section>
    </main>
  );
}
