"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { PlanCard } from "@/components/ui/plan-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/ui/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { getApiErrorMessage } from "@/lib/api/error-body";
import {
  atualizarPlanoAdminMarketplace,
  listarFaturamentoAdminMarketplace,
  listarPlanosAdminMarketplace,
} from "@/lib/repositories/admin-marketplace-planos-repository";
import { ApiError } from "@/lib/repositories/types/auth.types";
import type {
  FaturaPlanoResponse,
  PlanoAnuncioResponse,
  StatusPagamentoPlanoApi,
} from "@/lib/repositories/types/marketplace-planos.types";

type DraftPlan = {
  id: string;
  nome: string;
  descricao: string;
  ativo: boolean;
  precoInput: string;
  limiteInput: string;
};

function planNomeLabel(nome: string): string {
  const code = String(nome ?? "").toUpperCase();
  if (code === "BASICO") return "Básico";
  if (code === "PRO") return "Pro";
  if (code === "PREMIUM") return "Premium";
  return nome;
}

function toDraft(plan: PlanoAnuncioResponse): DraftPlan {
  return {
    id: plan.id,
    nome: planNomeLabel(plan.nome),
    descricao: plan.descricao,
    ativo: Boolean(plan.ativo),
    precoInput: String(plan.valorMensal),
    limiteInput: String(plan.totalAnuncios),
  };
}

function formatMoney(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 2,
  }).format(value);
}

function parseApiError(error: unknown, fallback: string): string {
  if (error instanceof ApiError) return getApiErrorMessage(error.body) ?? error.message;
  if (error instanceof Error) return error.message;
  return fallback;
}

function normalizeTab(value: string | null): "planos" | "faturamento" {
  return value === "faturamento" ? "faturamento" : "planos";
}

function faturamentoStatusLabel(status: StatusPagamentoPlanoApi | undefined): string {
  const code = String(status ?? "").toUpperCase();
  if (code === "GERADO") return "Aguardando pagamento";
  if (code === "PAGO") return "Pago";
  if (code === "FALHOU") return "Falhou";
  if (code === "EXPIRADO") return "Expirado";
  if (code === "CANCELADO") return "Cancelado";
  return status ?? "—";
}

export function AdminMarketplacePlanosContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [drafts, setDrafts] = React.useState<DraftPlan[]>([]);
  const [saving, setSaving] = React.useState(false);
  const [loadingPlanos, setLoadingPlanos] = React.useState(true);
  const [faturas, setFaturas] = React.useState<FaturaPlanoResponse[]>([]);
  const [loadingFaturamento, setLoadingFaturamento] = React.useState(false);
  const [faturamentoError, setFaturamentoError] = React.useState<string | null>(null);
  const [vendedorIdFiltroInput, setVendedorIdFiltroInput] = React.useState("");
  const [vendedorIdFiltroAplicado, setVendedorIdFiltroAplicado] = React.useState("");
  const activeTab = normalizeTab(searchParams.get("tab"));

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoadingPlanos(true);
      try {
        const plans = await listarPlanosAdminMarketplace();
        if (cancelled) return;
        setDrafts(plans.map(toDraft));
      } catch (error) {
        if (cancelled) return;
        setDrafts([]);
        toast({
          type: "error",
          title: "Falha ao carregar planos",
          description: parseApiError(error, "Não foi possível carregar os planos do marketplace."),
        });
      } finally {
        if (!cancelled) setLoadingPlanos(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [toast]);

  React.useEffect(() => {
    if (activeTab !== "faturamento") return;
    let cancelled = false;
    (async () => {
      setLoadingFaturamento(true);
      setFaturamentoError(null);
      try {
        const list = await listarFaturamentoAdminMarketplace({
          vendedorId: vendedorIdFiltroAplicado || undefined,
        });
        if (cancelled) return;
        setFaturas(list);
      } catch (error) {
        if (cancelled) return;
        const msg = parseApiError(error, "Não foi possível carregar o faturamento.");
        setFaturamentoError(msg);
        setFaturas([]);
      } finally {
        if (!cancelled) setLoadingFaturamento(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [activeTab, vendedorIdFiltroAplicado]);

  const saveChanges = React.useCallback(() => {
    const nextPlans: Array<{
      id: string;
      valorMensal: number;
      totalAnuncios: number;
      ativo: boolean;
    }> = [];

    for (const plan of drafts) {
      const price = Number(plan.precoInput.replace(",", "."));
      const limit = Number(plan.limiteInput);
      if (!Number.isFinite(price) || price < 0.01) {
        toast({
          type: "warning",
          title: "Valor inválido",
          description: `Revise o preço do plano ${plan.nome}.`,
        });
        return;
      }
      if (!Number.isFinite(limit) || limit < 1) {
        toast({
          type: "warning",
          title: "Limite inválido",
          description: `Revise o limite de anúncios do plano ${plan.nome}.`,
        });
        return;
      }
      nextPlans.push({
        id: plan.id,
        valorMensal: Number(price.toFixed(2)),
        totalAnuncios: Math.round(limit),
        ativo: Boolean(plan.ativo),
      });
    }

    setSaving(true);
    void (async () => {
      try {
        for (const plan of nextPlans) {
          await atualizarPlanoAdminMarketplace(plan.id, {
            valorMensal: plan.valorMensal,
            totalAnuncios: plan.totalAnuncios,
            ativo: plan.ativo,
          });
        }
        const refreshed = await listarPlanosAdminMarketplace();
        setDrafts(refreshed.map(toDraft));
        toast({
          type: "success",
          title: "Planos atualizados",
          description: "Preço e limite de anúncios foram salvos.",
        });
      } catch (error) {
        toast({
          type: "error",
          title: "Falha ao salvar planos",
          description: parseApiError(error, "Não foi possível salvar os planos."),
        });
      } finally {
        setSaving(false);
      }
    })();
  }, [drafts, toast]);

  const handleTabChange = React.useCallback(
    (tab: string) => {
      const normalized = normalizeTab(tab);
      const next = new URLSearchParams(searchParams.toString());
      next.set("tab", normalized);
      router.replace(`${pathname}?${next.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  return (
    <div>
      <PageHeader
        title="Gerenciar planos"
        subtitle="Defina o valor mensal e o total de anúncios permitidos em cada plano do marketplace."
      />

      <Tabs defaultValue="planos" value={activeTab} onValueChange={handleTabChange} className="mt-2">
        <TabsList className="rounded-2xl border border-zinc-200">
          <TabsTrigger value="planos">Planos</TabsTrigger>
          <TabsTrigger value="faturamento">Faturamento</TabsTrigger>
        </TabsList>

        <TabsContent value="planos" className="mt-4 bg-transparent">
          {loadingPlanos ? (
            <div className="rounded-2xl bg-white p-5 text-sm text-zinc-500 ring-1 ring-zinc-200">
              Carregando planos...
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
              {drafts.map((plan) => (
                <PlanCard
                  key={plan.id}
                  plano={{
                    id: plan.id,
                    nome: plan.nome,
                    descricao: plan.descricao,
                    precoMensal: Number(plan.precoInput.replace(",", ".")) || 0,
                    limiteAnuncios: Number(plan.limiteInput) || 0,
                    destaque: plan.nome === "Pro",
                  }}
                  className="h-full"
                  footer={
                    <div className="space-y-3 border-t border-zinc-100 pt-4">
                      <div>
                        <Label htmlFor={`plan-price-${plan.id}`}>Valor mensal (R$)</Label>
                        <Input
                          id={`plan-price-${plan.id}`}
                          type="number"
                          min="0.01"
                          step="0.01"
                          value={plan.precoInput}
                          onChange={(e) =>
                            setDrafts((prev) =>
                              prev.map((item) =>
                                item.id === plan.id ? { ...item, precoInput: e.target.value } : item
                              )
                            )
                          }
                          className="mt-1.5"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`plan-limit-${plan.id}`}>Total de anúncios</Label>
                        <Input
                          id={`plan-limit-${plan.id}`}
                          type="number"
                          min="1"
                          step="1"
                          value={plan.limiteInput}
                          onChange={(e) =>
                            setDrafts((prev) =>
                              prev.map((item) =>
                                item.id === plan.id ? { ...item, limiteInput: e.target.value } : item
                              )
                            )
                          }
                          className="mt-1.5"
                        />
                      </div>
                      <label className="inline-flex items-center gap-2 text-sm text-zinc-700">
                        <input
                          type="checkbox"
                          checked={plan.ativo}
                          onChange={(e) =>
                            setDrafts((prev) =>
                              prev.map((item) =>
                                item.id === plan.id ? { ...item, ativo: e.target.checked } : item
                              )
                            )
                          }
                          className="h-4 w-4 rounded border-zinc-300"
                        />
                        Plano ativo
                      </label>
                    </div>
                  }
                />
              ))}
            </div>
          )}

          <div className="mt-6 flex justify-end">
            <Button type="button" className="rounded-full" onClick={saveChanges} loading={saving} disabled={saving}>
              Salvar planos
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="faturamento" className="mt-4 bg-transparent">
          <section className="rounded-3xl bg-white p-6 ring-1 ring-zinc-200">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto]">
              <div>
                <Label htmlFor="faturamento-vendedor-id">Filtrar por vendedor (UUID)</Label>
                <Input
                  id="faturamento-vendedor-id"
                  value={vendedorIdFiltroInput}
                  onChange={(e) => setVendedorIdFiltroInput(e.target.value)}
                  placeholder="Ex.: 7f4a57f0-cf87-4c48-8e67-11af0d33f66b"
                  className="mt-1.5"
                />
              </div>
              <div className="flex items-end gap-2">
                <Button
                  type="button"
                  className="rounded-full"
                  onClick={() => setVendedorIdFiltroAplicado(vendedorIdFiltroInput.trim())}
                  loading={loadingFaturamento}
                >
                  Aplicar filtro
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  className="rounded-full"
                  onClick={() => {
                    setVendedorIdFiltroInput("");
                    setVendedorIdFiltroAplicado("");
                  }}
                  disabled={loadingFaturamento}
                >
                  Limpar
                </Button>
              </div>
            </div>

            {faturamentoError ? (
              <p className="mt-4 text-sm text-red-600">{faturamentoError}</p>
            ) : loadingFaturamento ? (
              <p className="mt-4 text-sm text-zinc-500">Carregando faturamento...</p>
            ) : faturas.length === 0 ? (
              <p className="mt-4 text-sm text-zinc-500">Nenhuma fatura encontrada para o filtro informado.</p>
            ) : (
              <div className="mt-5 space-y-3">
                {faturas.map((row) => (
                  <div
                    key={row.pagamentoId}
                    className="flex flex-wrap items-center justify-between gap-3 border-t border-zinc-100 pt-3 first:border-t-0 first:pt-0"
                  >
                    <div>
                      <p className="text-sm font-semibold text-zinc-900">{row.referencia}</p>
                      <p className="text-xs text-zinc-500">
                        {planNomeLabel(row.plano)} · Vencimento{" "}
                        {row.dataVencimento ? new Date(row.dataVencimento).toLocaleDateString("pt-BR") : "—"}
                      </p>
                      {row.pagoEm ? (
                        <p className="text-xs text-zinc-500">Pago em {new Date(row.pagoEm).toLocaleString("pt-BR")}</p>
                      ) : null}
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-zinc-900">{formatMoney(Number(row.valor ?? 0))}</p>
                      <p className="text-xs text-zinc-500">{faturamentoStatusLabel(row.status)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </TabsContent>
      </Tabs>
    </div>
  );
}
