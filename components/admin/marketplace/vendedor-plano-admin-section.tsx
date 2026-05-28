"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, type SelectOption } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { getApiErrorMessage } from "@/lib/api/error-body";
import { formatCurrencyBRL } from "@/lib/formatters";
import {
  atribuirPlanoVendedorAdmin,
  buscarAssinaturaVendedorAdmin,
} from "@/lib/repositories/admin-marketplace-vendedores-repository";
import { listarPlanosAdminMarketplace } from "@/lib/repositories/admin-marketplace-planos-repository";
import { ApiError } from "@/lib/repositories/types/auth.types";
import type {
  AssinaturaPlanoAtualResponse,
  PlanoAnuncioResponse,
} from "@/lib/repositories/types/marketplace-planos.types";

function planoOptionLabel(p: PlanoAnuncioResponse): string {
  const limite = p.ilimitado ? "ilimitado" : `${p.totalAnuncios} anúncios`;
  const valor = Number(p.valorMensal) > 0 ? formatCurrencyBRL(Number(p.valorMensal)) : "grátis";
  const inativo = p.ativo ? "" : " · inativo";
  return `${p.nome} (${limite}, ${valor})${inativo}`;
}

function statusAssinaturaLabel(status?: string | null): string {
  const s = String(status ?? "").toUpperCase();
  if (s === "ATIVA") return "Ativa";
  if (s === "PENDENTE_PAGAMENTO") return "Aguardando pagamento";
  if (s === "INADIMPLENTE") return "Inadimplente";
  if (s === "CANCELADA") return "Cancelada";
  return status?.trim() || "Sem assinatura";
}

type Props = {
  usuarioId: string;
};

export function VendedorPlanoAdminSection({ usuarioId }: Props) {
  const { toast } = useToast();
  const [planos, setPlanos] = React.useState<PlanoAnuncioResponse[]>([]);
  const [assinatura, setAssinatura] = React.useState<AssinaturaPlanoAtualResponse | null>(null);
  const [planoSelecionado, setPlanoSelecionado] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);

  const carregar = React.useCallback(async () => {
    setLoading(true);
    try {
      const [listaPlanos, assinaturaAtual] = await Promise.all([
        listarPlanosAdminMarketplace(),
        buscarAssinaturaVendedorAdmin(usuarioId),
      ]);
      setPlanos(listaPlanos);
      setAssinatura(assinaturaAtual);
      const planoAtualId = assinaturaAtual?.plano?.id ?? "";
      setPlanoSelecionado(planoAtualId);
    } catch (error) {
      setPlanos([]);
      setAssinatura(null);
      toast({
        type: "error",
        title: "Falha ao carregar plano",
        description:
          error instanceof ApiError
            ? getApiErrorMessage(error.body) ?? error.message
            : error instanceof Error
              ? error.message
              : "Não foi possível consultar a assinatura do vendedor.",
      });
    } finally {
      setLoading(false);
    }
  }, [toast, usuarioId]);

  React.useEffect(() => {
    void carregar();
  }, [carregar]);

  const planoOptions: SelectOption[] = React.useMemo(
    () =>
      planos.map((p) => ({
        value: p.id,
        label: planoOptionLabel(p),
      })),
    [planos]
  );

  const handleAplicar = async () => {
    if (!planoSelecionado) {
      toast({
        type: "warning",
        title: "Selecione um plano",
        description: "Escolha o plano que deseja atribuir ao vendedor.",
      });
      return;
    }

    setSaving(true);
    try {
      const atualizada = await atribuirPlanoVendedorAdmin(usuarioId, { planoId: planoSelecionado });
      setAssinatura(atualizada);
      toast({
        type: "success",
        title: "Plano atualizado",
        description: "A assinatura foi ativada sem cobrança ao vendedor.",
      });
    } catch (error) {
      toast({
        type: "error",
        title: "Falha ao alterar plano",
        description:
          error instanceof ApiError
            ? getApiErrorMessage(error.body) ?? error.message
            : error instanceof Error
              ? error.message
              : "Não foi possível aplicar o plano.",
      });
    } finally {
      setSaving(false);
    }
  };

  const planoAtual = assinatura?.plano;
  const disponiveis =
    assinatura?.anunciosDisponiveis == null
      ? planoAtual?.ilimitado
        ? "Ilimitados"
        : "—"
      : String(assinatura.anunciosDisponiveis);

  return (
    <section className="rounded-2xl border border-zinc-200 bg-zinc-50/80 p-4">
      <h3 className="text-sm font-semibold text-zinc-900">Plano de anúncios</h3>
      <p className="mt-1 text-xs text-zinc-500">
        Altere o plano do vendedor sem passar pelo checkout — a assinatura fica ativa na hora.
      </p>

      {loading ? (
        <p className="mt-3 text-sm text-zinc-500">Carregando assinatura…</p>
      ) : (
        <>
          <dl className="mt-3 grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">Plano atual</dt>
              <dd className="mt-0.5 font-medium text-zinc-900">{planoAtual?.nome ?? "Nenhum"}</dd>
            </div>
            <div>
              <dt className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">Status</dt>
              <dd className="mt-0.5 font-medium text-zinc-900">{statusAssinaturaLabel(assinatura?.status)}</dd>
            </div>
            <div>
              <dt className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">Anúncios disponíveis</dt>
              <dd className="mt-0.5 font-medium text-zinc-900">{disponiveis}</dd>
            </div>
          </dl>

          <div className="mt-4 space-y-2">
            <Label htmlFor="admin-vendedor-plano">Novo plano</Label>
            <Select
              id="admin-vendedor-plano"
              value={planoSelecionado}
              onValueChange={setPlanoSelecionado}
              options={planoOptions}
              placeholder="Selecione o plano"
            />
            <Button
              type="button"
              className="w-full rounded-full sm:w-auto"
              loading={saving}
              disabled={saving || !planoSelecionado}
              onClick={() => void handleAplicar()}
            >
              Aplicar plano sem cobrança
            </Button>
          </div>
        </>
      )}
    </section>
  );
}
