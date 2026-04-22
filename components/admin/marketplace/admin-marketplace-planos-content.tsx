"use client";

import * as React from "react";

import { PlanCard } from "@/components/ui/plan-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/ui/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import {
  MARKETPLACE_PLANOS_UPDATED_EVENT,
  listarPlanosMarketplace,
  salvarPlanosMarketplace,
  type MarketplacePlano,
} from "@/lib/marketplace-planos";

type DraftPlan = MarketplacePlano & {
  precoInput: string;
  limiteInput: string;
};

function toDraft(plan: MarketplacePlano): DraftPlan {
  return {
    ...plan,
    precoInput: String(plan.precoMensal),
    limiteInput: String(plan.limiteAnuncios),
  };
}

const MOCK_FATURAMENTO_RESUMO = {
  receitaMes: 12870,
  assinaturasAtivas: 74,
  ticketsPendentes: 6,
};

const MOCK_FATURAMENTO_LANCAMENTOS = [
  { id: "cob-101", seller: "AutoMax DF", plano: "Pro", valor: 179, status: "Pago", data: "2026-04-09" },
  { id: "cob-102", seller: "Loja Prime Motors", plano: "Premium", valor: 299, status: "Em aberto", data: "2026-04-10" },
  { id: "cob-103", seller: "Francisco Veículos", plano: "Básico", valor: 99, status: "Pago", data: "2026-04-10" },
] as const;

function formatMoney(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 2,
  }).format(value);
}

export function AdminMarketplacePlanosContent() {
  const { toast } = useToast();
  const [drafts, setDrafts] = React.useState<DraftPlan[]>([]);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    const refresh = () => setDrafts(listarPlanosMarketplace().map(toDraft));
    refresh();
    window.addEventListener(MARKETPLACE_PLANOS_UPDATED_EVENT, refresh);
    return () => window.removeEventListener(MARKETPLACE_PLANOS_UPDATED_EVENT, refresh);
  }, []);

  const saveChanges = React.useCallback(() => {
    const nextPlans: MarketplacePlano[] = [];
    for (const plan of drafts) {
      const price = Number(plan.precoInput.replace(",", "."));
      const limit = Number(plan.limiteInput);
      if (!Number.isFinite(price) || price < 0) {
        toast({
          type: "warning",
          title: "Valor inválido",
          description: `Revise o preço do plano ${plan.nome}.`,
        });
        return;
      }
      if (!Number.isFinite(limit) || limit < 0) {
        toast({
          type: "warning",
          title: "Limite inválido",
          description: `Revise o limite de anúncios do plano ${plan.nome}.`,
        });
        return;
      }
      nextPlans.push({
        id: plan.id,
        nome: plan.nome,
        descricao: plan.descricao,
        destaque: plan.destaque,
        precoMensal: Math.round(price),
        limiteAnuncios: Math.round(limit),
      });
    }

    setSaving(true);
    try {
      salvarPlanosMarketplace(nextPlans);
      toast({
        type: "success",
        title: "Planos atualizados",
        description: "Preço e limite de anúncios foram salvos.",
      });
    } finally {
      setSaving(false);
    }
  }, [drafts, toast]);

  return (
    <div>
      <PageHeader
        title="Gerenciar planos"
        subtitle="Defina o valor mensal e o total de anúncios permitidos em cada plano do marketplace."
      />

      <Tabs defaultValue="planos" className="mt-2">
        <TabsList className="rounded-2xl border border-zinc-200">
          <TabsTrigger value="planos">Planos</TabsTrigger>
          <TabsTrigger value="faturamento">Faturamento</TabsTrigger>
        </TabsList>

        <TabsContent value="planos" className="mt-4 bg-transparent">
          <div className="mb-5 rounded-2xl bg-white p-4 text-sm text-zinc-600 ring-1 ring-zinc-200">
            Esta área está mockada por enquanto. As alterações ficam salvas localmente para testes de fluxo.
          </div>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
            {drafts.map((plan) => (
              <PlanCard
                key={plan.id}
                plano={plan}
                className="h-full"
                footer={
                  <div className="space-y-3 border-t border-zinc-100 pt-4">
                    <div>
                      <Label htmlFor={`plan-price-${plan.id}`}>Valor mensal (R$)</Label>
                      <Input
                        id={`plan-price-${plan.id}`}
                        type="number"
                        min="0"
                        step="1"
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
                        min="0"
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
                  </div>
                }
              />
            ))}
          </div>

          <div className="mt-6 flex justify-end">
            <Button type="button" className="rounded-full" onClick={saveChanges} loading={saving} disabled={saving}>
              Salvar planos
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="faturamento" className="mt-4 bg-transparent">
          <section className="rounded-3xl bg-white p-6 ring-1 ring-zinc-200">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-2xl bg-zinc-50/70 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-zinc-500">Receita mensal</p>
                <p className="mt-1 text-xl font-bold text-zinc-950">{formatMoney(MOCK_FATURAMENTO_RESUMO.receitaMes)}</p>
              </div>
              <div className="rounded-2xl bg-zinc-50/70 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-zinc-500">Assinaturas ativas</p>
                <p className="mt-1 text-xl font-bold text-zinc-950">{MOCK_FATURAMENTO_RESUMO.assinaturasAtivas}</p>
              </div>
              <div className="rounded-2xl bg-zinc-50/70 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-zinc-500">Pendências</p>
                <p className="mt-1 text-xl font-bold text-zinc-950">{MOCK_FATURAMENTO_RESUMO.ticketsPendentes}</p>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {MOCK_FATURAMENTO_LANCAMENTOS.map((row) => (
                <div key={row.id} className="flex flex-wrap items-center justify-between gap-3 border-t border-zinc-100 pt-3 first:border-t-0 first:pt-0">
                  <div>
                    <p className="text-sm font-semibold text-zinc-900">{row.seller}</p>
                    <p className="text-xs text-zinc-500">
                      {row.plano} · {new Date(row.data).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-zinc-900">{formatMoney(row.valor)}</p>
                    <p className="text-xs text-zinc-500">{row.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </TabsContent>
      </Tabs>
    </div>
  );
}
