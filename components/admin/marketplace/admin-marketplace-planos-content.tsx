"use client";

import * as React from "react";

import { PlanCard } from "@/components/ui/plan-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/ui/page-header";
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
    </div>
  );
}
