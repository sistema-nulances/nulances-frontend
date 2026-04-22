"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { PlanCard } from "@/components/ui/plan-card";
import { PageHeader } from "@/components/ui/page-header";
import { useToast } from "@/components/ui/use-toast";
import { getApiErrorMessage } from "@/lib/api/error-body";
import { assinarPlanoVendedor, buscarPainelPlanosVendedor } from "@/lib/repositories/vendedor-planos-repository";
import { ApiError } from "@/lib/repositories/types/auth.types";
import type {
  AssinaturaPlanoStatusApi,
  VendedorPlanosResponse,
} from "@/lib/repositories/types/marketplace-planos.types";

function parseApiError(error: unknown, fallback: string): string {
  if (error instanceof ApiError) return getApiErrorMessage(error.body) ?? error.message;
  if (error instanceof Error) return error.message;
  return fallback;
}

function formatDateTime(iso: string | undefined | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("pt-BR");
}

function planoNomeLabel(nome: string): string {
  const code = String(nome ?? "").trim().toUpperCase();
  if (code === "BASICO") return "Básico";
  if (code === "PRO") return "Pro";
  if (code === "PREMIUM") return "Premium";
  return nome;
}

function statusAssinaturaLabel(status: AssinaturaPlanoStatusApi | undefined): string {
  const code = String(status ?? "").toUpperCase();
  if (code === "PENDENTE_PAGAMENTO") return "Pendente de pagamento";
  if (code === "ATIVA") return "Ativa";
  if (code === "INADIMPLENTE") return "Inadimplente";
  if (code === "CANCELADA") return "Cancelada";
  return status ? String(status) : "—";
}

function normalizeCheckoutResult(params: URLSearchParams): "success" | "pending" | "failure" | null {
  const candidates = [
    params.get("status"),
    params.get("collection_status"),
    params.get("paymentStatus"),
    params.get("resultado"),
  ]
    .map((v) => String(v ?? "").trim().toLowerCase())
    .filter(Boolean);
  for (const item of candidates) {
    if (item === "success" || item === "approved" || item === "pago") return "success";
    if (item === "pending" || item === "in_process") return "pending";
    if (item === "failure" || item === "rejected" || item === "cancelled") return "failure";
  }
  return null;
}

export function SellerPlanosPageContent() {
  const { toast } = useToast();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [painel, setPainel] = React.useState<VendedorPlanosResponse | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [loadingPlanoId, setLoadingPlanoId] = React.useState<string | null>(null);
  const [polling, setPolling] = React.useState(false);
  const checkoutResult = normalizeCheckoutResult(searchParams);
  const handledCheckoutRef = React.useRef<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const data = await buscarPainelPlanosVendedor();
        if (cancelled) return;
        setPainel(data);
      } catch (error) {
        if (cancelled) return;
        toast({
          type: "error",
          title: "Falha ao carregar planos",
          description: parseApiError(error, "Não foi possível carregar seus planos."),
        });
        setPainel({ planosDisponiveis: [], assinaturaAtual: null });
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [toast]);

  React.useEffect(() => {
    const key = searchParams.toString();
    if (!checkoutResult) return;
    if (handledCheckoutRef.current === key) return;
    handledCheckoutRef.current = key;

    if (checkoutResult === "failure") {
      toast({
        type: "warning",
        title: "Pagamento não concluído",
        description: "Você pode tentar novamente escolhendo um plano.",
      });
      router.replace(pathname, { scroll: false });
      return;
    }

    setPolling(true);
    toast({
      type: "info",
      title: checkoutResult === "success" ? "Pagamento recebido" : "Pagamento em análise",
      description: "Estamos atualizando o status da assinatura.",
    });

    let cancelled = false;
    let attempts = 0;
    const maxAttempts = 12;
    const timer = window.setInterval(() => {
      attempts += 1;
      void (async () => {
        try {
          const next = await buscarPainelPlanosVendedor();
          if (cancelled) return;
          setPainel(next);
          const status = String(next.assinaturaAtual?.status ?? "").toUpperCase();
          if (status === "ATIVA") {
            window.clearInterval(timer);
            setPolling(false);
            toast({
              type: "success",
              title: "Assinatura ativada",
              description: "Seu plano está ativo para publicar anúncios.",
            });
            router.replace(pathname, { scroll: false });
            return;
          }
          if (attempts >= maxAttempts) {
            window.clearInterval(timer);
            setPolling(false);
            router.replace(pathname, { scroll: false });
          }
        } catch {
          if (attempts >= maxAttempts) {
            window.clearInterval(timer);
            setPolling(false);
            router.replace(pathname, { scroll: false });
          }
        }
      })();
    }, 5000);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
      setPolling(false);
    };
  }, [checkoutResult, pathname, router, searchParams, toast]);

  const handleAssinar = React.useCallback(
    async (planoId: string) => {
      setLoadingPlanoId(planoId);
      try {
        const result = await assinarPlanoVendedor({ planoId });
        if (!result.checkoutUrl) {
          throw new Error("Checkout indisponível no momento.");
        }
        window.location.assign(result.checkoutUrl);
      } catch (error) {
        toast({
          type: "error",
          title: "Falha ao iniciar pagamento",
          description: parseApiError(error, "Não foi possível gerar o checkout."),
        });
      } finally {
        setLoadingPlanoId(null);
      }
    },
    [toast]
  );

  const assinaturaAtual = painel?.assinaturaAtual ?? null;
  const planos = painel?.planosDisponiveis ?? [];
  const assinaturaAtiva = String(assinaturaAtual?.status ?? "").toUpperCase() === "ATIVA";

  return (
    <div>
      <PageHeader
        title="Planos de anúncios"
        subtitle="Gerencie sua assinatura para publicar anúncios no marketplace."
      />

      <section className="mt-2 rounded-3xl bg-white p-6 ring-1 ring-zinc-200">
        {loading ? (
          <p className="text-sm text-zinc-500">Carregando dados da assinatura...</p>
        ) : assinaturaAtual ? (
          <div className="space-y-2">
            <p className="text-sm text-zinc-700">
              Status atual: <strong>{statusAssinaturaLabel(assinaturaAtual.status)}</strong>
            </p>
            <p className="text-sm text-zinc-700">
              Plano: <strong>{planoNomeLabel(assinaturaAtual.plano.nome)}</strong>
            </p>
            <p className="text-sm text-zinc-700">
              Anúncios disponíveis: <strong>{assinaturaAtual.anunciosDisponiveis}</strong>
            </p>
            <p className="text-sm text-zinc-600">
              Início: {formatDateTime(assinaturaAtual.inicioVigencia)} · Próxima cobrança:{" "}
              {formatDateTime(assinaturaAtual.proximaCobranca)}
            </p>

            {String(assinaturaAtual.status).toUpperCase() === "PENDENTE_PAGAMENTO" ? (
              <div className="pt-2">
                <Button
                  type="button"
                  className="rounded-full"
                  onClick={() => void handleAssinar(assinaturaAtual.plano.id)}
                  loading={loadingPlanoId === assinaturaAtual.plano.id}
                  disabled={polling}
                >
                  Pagar agora
                </Button>
              </div>
            ) : null}
          </div>
        ) : (
          <p className="text-sm text-zinc-700">
            Você ainda não possui assinatura ativa. Escolha um plano abaixo para começar.
          </p>
        )}
      </section>

      <div className="mt-5 grid grid-cols-1 gap-4 xl:grid-cols-3">
        {planos.map((plano) => {
          const isCurrent = assinaturaAtual?.plano?.id === plano.id;
          return (
            <PlanCard
              key={plano.id}
              plano={{
                id: plano.id,
                nome: planoNomeLabel(plano.nome),
                descricao: plano.descricao,
                precoMensal: plano.valorMensal,
                limiteAnuncios: plano.totalAnuncios,
                destaque: planoNomeLabel(plano.nome) === "Pro",
              }}
              active={isCurrent && assinaturaAtiva}
              actionLabel={isCurrent && assinaturaAtiva ? "Plano atual" : "Assinar plano"}
              actionDisabled={!plano.ativo || (isCurrent && assinaturaAtiva) || polling}
              actionLoading={loadingPlanoId === plano.id}
              onAction={() => void handleAssinar(plano.id)}
              footer={
                !plano.ativo ? (
                  <p className="text-xs text-zinc-500">Plano indisponível no momento.</p>
                ) : null
              }
            />
          );
        })}
      </div>
    </div>
  );
}
