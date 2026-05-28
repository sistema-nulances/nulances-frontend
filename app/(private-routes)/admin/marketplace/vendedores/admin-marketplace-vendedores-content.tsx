"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import { WhatsappIcon } from "@hugeicons/core-free-icons";
import {
  CheckCircleIcon,
  ClipboardDocumentListIcon,
  EnvelopeIcon,
  EyeIcon,
  MapPinIcon,
  MegaphoneIcon,
  NoSymbolIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  ConfirmDialog,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/ui/page-header";
import { useToast } from "@/components/ui/use-toast";
import { VendedorAnalisarPerfilSheet } from "@/components/admin/marketplace/vendedor-analisar-perfil-sheet";
import { VendedorPlanoAdminSection } from "@/components/admin/marketplace/vendedor-plano-admin-section";
import { Select, type SelectOption } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { formatDashboardDateTime } from "@/lib/format-dashboard-datetime";
import {
  type MarketplaceVendedorAdmin,
  type VendedorContaStatus,
  type VendedorFiltroStatus,
} from "@/lib/marketplace-vendedores-admin";
import {
  aprovarSolicitacaoPendenteAdminMarketplaceVendedor,
  buscarDetalhePendenteAdminMarketplaceVendedor,
  listarAdminMarketplaceVendedores,
  recusarSolicitacaoPendenteAdminMarketplaceVendedor,
  revogarCargoVendedorAdminMarketplace,
} from "@/lib/repositories/admin-marketplace-vendedores-repository";
import { getApiErrorMessage } from "@/lib/api/error-body";
import { ApiError } from "@/lib/repositories/types/auth.types";
import type {
  AdminMarketplaceSolicitacaoPendenteDetalheResponse,
  AdminMarketplaceVendedorListItemResponse,
  RecusarSolicitacaoVendedorRequest,
  StatusContaMarketplaceAdminApi,
} from "@/lib/repositories/types/admin-marketplace-vendedores.types";
import { cn } from "@/lib/cn";
import { digitsOnly, formatCpfOuCnpjExibicao, formatPhoneBr } from "@/lib/formatters";

function getActionErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return getApiErrorMessage(error.body) ?? error.message;
  }
  if (error instanceof Error) return error.message;
  return "Não foi possível concluir a ação no momento.";
}

function getWhatsappHref(phone: string): string | null {
  const d = digitsOnly(phone);
  if (d.length < 10) return null;
  const number = d.length <= 11 ? `55${d}` : d;
  return `https://wa.me/${number}`;
}

const FILTRO_STATUS: SelectOption[] = [
  { value: "todos", label: "Todos" },
  { value: "ativo", label: "Ativos" },
  { value: "pendente_verificacao", label: "Pedidos pendentes" },
];

function mapFiltroStatusToApi(status: VendedorFiltroStatus): StatusContaMarketplaceAdminApi {
  if (status === "ativo") return "ATIVO";
  if (status === "pendente_verificacao") return "PENDENTE";
  return "TODOS";
}

function mapApiStatusToLocal(statusConta?: string | null): VendedorContaStatus {
  const raw = String(statusConta ?? "").toUpperCase();
  if (raw.includes("PEND")) return "pendente_verificacao";
  if (raw.includes("INAT")) return "inativo";
  return "ativo";
}

function mapApiVendedorToRow(item: AdminMarketplaceVendedorListItemResponse): MarketplaceVendedorAdmin {
  const status = mapApiStatusToLocal(item.statusConta);
  const nome = item.nomeExibicao?.trim() || "Sem nome";
  const id = item.id ?? item.usuarioId ?? `tmp-${nome.toLowerCase().replace(/\s+/g, "-")}`;
  const cidade = item.cidade?.trim() || "—";
  const estado = item.estado?.trim() || "—";
  // "Vendedor desde" deve refletir a data de aprovação.
  const cadastroEm =
    status === "pendente_verificacao"
      ? (item.dataSolicitacao ?? "")
      : (item.dataAprovacao ?? "");

  const row: MarketplaceVendedorAdmin = {
    id,
    usuarioId: item.usuarioId ?? undefined,
    nome,
    fotoPerfil: item.fotoPerfilUrl?.trim() || item.fotoPerfil?.trim() || undefined,
    email: item.email?.trim() || "—",
    telefone: formatPhoneBr(item.telefone?.trim() || "") || "—",
    cidadeUf: `${cidade} - ${estado}`,
    documento: formatCpfOuCnpjExibicao(item.cpfOuCnpj?.trim() || "") || "—",
    status,
    cadastroEm,
    anunciosTotal: Number(item.totalAnuncios ?? 0),
    anunciosPublicados: Number(item.totalPublicados ?? 0),
  };
  return row;
}

function statusBadge(status: VendedorContaStatus) {
  if (status === "pendente_verificacao") {
    return (
      <Badge variant="amber" size="sm" className="normal-case tracking-normal">
        Pedido pendente
      </Badge>
    );
  }
  if (status === "inativo") {
    return (
      <Badge variant="zinc" size="sm" className="normal-case tracking-normal">
        Inativo
      </Badge>
    );
  }
  return (
    <Badge variant="emerald" size="sm" className="normal-case tracking-normal">
      Ativo
    </Badge>
  );
}

function iniciais(nome: string): string {
  const parts = nome.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]!.charAt(0)}${parts[parts.length - 1]!.charAt(0)}`.toUpperCase();
}

export function AdminMarketplaceVendedoresContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const vendedorParam = searchParams.get("vendedor")?.trim();
  const { toast } = useToast();

  const [rows, setRows] = React.useState<MarketplaceVendedorAdmin[]>([]);
  const [loadingRows, setLoadingRows] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [filtroStatus, setFiltroStatus] = React.useState<VendedorFiltroStatus>("todos");
  const [detail, setDetail] = React.useState<MarketplaceVendedorAdmin | null>(null);
  const [detailApi, setDetailApi] = React.useState<AdminMarketplaceSolicitacaoPendenteDetalheResponse | null>(null);
  const [confirmRevogar, setConfirmRevogar] = React.useState<MarketplaceVendedorAdmin | null>(null);
  const [recusarTarget, setRecusarTarget] = React.useState<MarketplaceVendedorAdmin | null>(null);
  const [recusarObservacao, setRecusarObservacao] = React.useState("");
  const [acaoEmAndamentoId, setAcaoEmAndamentoId] = React.useState<string | null>(null);
  const [analisePerfil, setAnalisePerfil] = React.useState<MarketplaceVendedorAdmin | null>(null);
  const [analiseDetalhe, setAnaliseDetalhe] =
    React.useState<AdminMarketplaceSolicitacaoPendenteDetalheResponse | null>(null);
  const [analiseLoading, setAnaliseLoading] = React.useState(false);

  const closeDetail = React.useCallback(() => {
    setDetail(null);
    setDetailApi(null);
    if (searchParams.get("vendedor")) {
      router.replace(pathname, { scroll: false });
    }
  }, [pathname, router, searchParams]);

  React.useEffect(() => {
    if (!vendedorParam) return;
    const found = rows.find((v) => String(v.id) === vendedorParam || v.nome === vendedorParam);
    if (found) setDetail(found);
  }, [vendedorParam, rows]);

  React.useEffect(() => {
    if (!detail || detail.status !== "pendente_verificacao") {
      setDetailApi(null);
      return;
    }
    const solicitacaoId = String(detail.id).trim();
    if (!solicitacaoId) {
      setDetailApi(null);
      return;
    }
    let cancelled = false;
    void (async () => {
      try {
        const data = await buscarDetalhePendenteAdminMarketplaceVendedor(solicitacaoId);
        if (!cancelled) setDetailApi(data);
      } catch {
        if (!cancelled) setDetailApi(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [detail]);

  React.useEffect(() => {
    let cancelled = false;
    setLoadingRows(true);
    const timer = window.setTimeout(() => {
      void (async () => {
        try {
          const data = await listarAdminMarketplaceVendedores({
            status: mapFiltroStatusToApi(filtroStatus),
            search,
          });
          if (cancelled) return;
          setRows(data.map(mapApiVendedorToRow));
        } catch (error) {
          if (cancelled) return;
          setRows([]);
          toast({
            type: "error",
            title: "Falha ao carregar vendedores",
            description:
              error instanceof Error ? error.message : "Não foi possível consultar os vendedores no momento.",
          });
        } finally {
          if (!cancelled) setLoadingRows(false);
        }
      })();
    }, 300);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [filtroStatus, search, toast]);

  const refetchVendedores = React.useCallback(async () => {
    const data = await listarAdminMarketplaceVendedores({
      status: mapFiltroStatusToApi(filtroStatus),
      search,
    });
    const mapped = data.map(mapApiVendedorToRow);
    setRows(mapped);
    return mapped;
  }, [filtroStatus, search]);

  const filtered = rows;
  const detailFotoPerfil =
    detailApi?.fotoPerfilUrl?.trim() ||
    detailApi?.fotoPerfil?.trim() ||
    detail?.fotoPerfil?.trim() ||
    "/NuLanceADMIN.png";
  const detailNome = detailApi?.nomeExibicao?.trim() || detail?.nome || "—";
  const detailEmail = detailApi?.email?.trim() || detail?.email || "—";
  const detailDocumento = detailApi?.cpfOuCnpj?.trim() || detail?.documento || "—";
  const detailCidadeUf =
    detailApi?.cidade?.trim() && detailApi?.estado?.trim()
      ? `${detailApi.cidade.trim()} - ${detailApi.estado.trim()}`
      : detail?.cidadeUf || "—";
  const detailTelefone = formatPhoneBr(detailApi?.telefone ?? detail?.telefone ?? "") || "—";

  const anunciosComFiltroHref = (nome: string) =>
    `/admin/marketplace/anuncios?q=${encodeURIComponent(nome)}`;

  const abrirAnalisePerfil = React.useCallback(
    async (v: MarketplaceVendedorAdmin) => {
      if (v.status !== "pendente_verificacao") return;
      const solicitacaoId = String(v.id).trim();
      if (!solicitacaoId) {
        toast({
          type: "error",
          title: "Solicitação inválida",
          description: "Não foi possível identificar a solicitação pendente.",
        });
        return;
      }
      setAnalisePerfil(v);
      setAnaliseDetalhe(null);
      setAnaliseLoading(true);
      try {
        const detalhe = await buscarDetalhePendenteAdminMarketplaceVendedor(solicitacaoId);
        setAnaliseDetalhe(detalhe);
      } catch (error) {
        setAnalisePerfil(null);
        setAnaliseDetalhe(null);
        toast({
          type: "error",
          title: "Falha ao carregar perfil",
          description:
            error instanceof Error
              ? error.message
              : "Não foi possível buscar o detalhe da solicitação pendente.",
        });
      } finally {
        setAnaliseLoading(false);
      }
    },
    [toast]
  );

  const aceitarComoVendedor = React.useCallback(
    async (v: MarketplaceVendedorAdmin) => {
      const solicitacaoId = String(v.id).trim();
      if (!solicitacaoId) {
        toast({
          type: "error",
          title: "Solicitação inválida",
          description: "Não foi possível identificar a solicitação pendente.",
        });
        return;
      }
      setAcaoEmAndamentoId(solicitacaoId);
      try {
        await aprovarSolicitacaoPendenteAdminMarketplaceVendedor(solicitacaoId);
        const rowsAtualizadas = await refetchVendedores();
        const rowAtualizada = rowsAtualizadas.find((x) => String(x.id) === String(v.id)) ?? null;
        setDetail((d) => (d && d.id === v.id ? rowAtualizada : d));
        setAnalisePerfil((a) => (a && a.id === v.id ? null : a));
        setAnaliseDetalhe((a) => (a && String(a.solicitacaoId ?? "") === solicitacaoId ? null : a));
        toast({
          type: "success",
          title: "Vendedor aceito",
          description: `${v.nome} foi aprovado com sucesso.`,
        });
      } catch (error) {
        toast({
          type: "error",
          title: "Falha ao aprovar",
          description: getActionErrorMessage(error),
        });
      } finally {
        setAcaoEmAndamentoId(null);
      }
    },
    [refetchVendedores, toast]
  );

  const abrirRecusa = React.useCallback((v: MarketplaceVendedorAdmin) => {
    setRecusarTarget(v);
    setRecusarObservacao("");
  }, []);

  const fecharRecusa = React.useCallback(() => {
    setRecusarTarget(null);
    setRecusarObservacao("");
  }, []);

  const recusarSolicitacao = React.useCallback(async () => {
    if (!recusarTarget) return;

    const solicitacaoId = String(recusarTarget.id).trim();
    const observacao = recusarObservacao.trim();

    if (!solicitacaoId) {
      toast({
        type: "error",
        title: "Solicitação inválida",
        description: "Não foi possível identificar a solicitação pendente.",
      });
      return;
    }

    if (!observacao) {
      toast({
        type: "error",
        title: "Observação obrigatória",
        description: "Informe a observação para recusar a solicitação.",
      });
      return;
    }

    setAcaoEmAndamentoId(solicitacaoId);
    try {
      const payload: RecusarSolicitacaoVendedorRequest = { observacao };
      await recusarSolicitacaoPendenteAdminMarketplaceVendedor(solicitacaoId, payload);
      const rowsAtualizadas = await refetchVendedores();
      const nome = recusarTarget.nome;
      fecharRecusa();
      const rowAtualizada = rowsAtualizadas.find((x) => String(x.id) === String(recusarTarget.id)) ?? null;
      setDetail((d) => (d && d.id === recusarTarget.id ? rowAtualizada : d));
      setAnalisePerfil((a) => (a && a.id === recusarTarget.id ? null : a));
      setAnaliseDetalhe((a) => (a && String(a.solicitacaoId ?? "") === solicitacaoId ? null : a));
      toast({
        type: "success",
        title: "Solicitação recusada",
        description: `A solicitação de ${nome} foi recusada.`,
      });
    } catch (error) {
      toast({
        type: "error",
        title: "Falha ao recusar",
        description: getActionErrorMessage(error),
      });
    } finally {
      setAcaoEmAndamentoId(null);
    }
  }, [fecharRecusa, recusarObservacao, recusarTarget, refetchVendedores, toast]);

  const revogarCargoVendedor = React.useCallback(
    async (v: MarketplaceVendedorAdmin) => {
      const usuarioId = String(v.usuarioId ?? "").trim();
      if (!usuarioId) {
        toast({
          type: "error",
          title: "Usuário inválido",
          description: "Não foi possível identificar o usuário para revogar o cargo.",
        });
        return;
      }

      setAcaoEmAndamentoId(usuarioId);
      try {
        await revogarCargoVendedorAdminMarketplace(usuarioId);
        const rowsAtualizadas = await refetchVendedores();
        const rowAtualizada = rowsAtualizadas.find((x) => String(x.id) === String(v.id)) ?? null;
        setDetail((d) => (d && d.id === v.id ? rowAtualizada : d));
        setAnalisePerfil((a) => (a && a.id === v.id ? null : a));
        setAnaliseDetalhe((a) => (a && String(a.solicitacaoId ?? "") === String(v.id) ? null : a));
        toast({
          type: "success",
          title: "Cargo revogado",
          description: `${v.nome} não possui mais o perfil de vendedor.`,
        });
      } catch (error) {
        toast({
          type: "error",
          title: "Falha ao revogar",
          description: getActionErrorMessage(error),
        });
      } finally {
        setAcaoEmAndamentoId(null);
      }
    },
    [refetchVendedores, toast]
  );

  return (
    <div>
      <PageHeader
        title="Vendedores"
        subtitle="Acompanhe contas ativas e solicitações pendentes de vendedor no marketplace."
      />

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-6">
        <div className="w-full shrink-0 sm:w-auto sm:min-w-[220px] sm:max-w-xs">
          <Label htmlFor="vendedores-status" className="text-zinc-700">
            Status da conta
          </Label>
          <Select
            id="vendedores-status"
            value={filtroStatus}
            onValueChange={(v) => setFiltroStatus(v as VendedorFiltroStatus)}
            options={FILTRO_STATUS}
            placeholder="Filtrar"
            aria-label="Filtrar por status"
            className="mt-1.5"
          />
        </div>
        <div className="min-w-0 w-full flex-1">
          <Label htmlFor="vendedores-busca" className="text-zinc-700">
            Buscar
          </Label>
          <Input
            id="vendedores-busca"
            type="search"
            placeholder="Nome, e-mail, cidade, telefone ou ID…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="mt-1.5 w-full rounded-2xl"
          />
        </div>
      </div>

      {loadingRows ? (
        <p className="rounded-2xl border border-zinc-200 bg-zinc-50/80 px-6 py-12 text-center text-sm text-zinc-600">
          Carregando vendedores...
        </p>
      ) : filtered.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50/80 px-6 py-12 text-center text-sm text-zinc-600">
          Nenhum vendedor encontrado com os filtros atuais.
        </p>
      ) : (
        <ul className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {filtered.map((v) => (
            <li
              key={v.id}
              className="flex flex-col rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm shadow-black/[0.03]"
            >
              <div className="flex gap-4">
                <div
                  className={cn(
                    "flex h-[5.5rem] w-[5.5rem] shrink-0 items-center justify-center overflow-hidden rounded-full text-xl font-bold tracking-tight",
                    "bg-[var(--nulance-purple)]/12 text-[var(--nulance-purple)] ring-4 ring-[var(--nulance-purple)]/10"
                  )}
                  aria-hidden
                >
                  {v.fotoPerfil ? (
                    <Avatar src={v.fotoPerfil} alt={v.nome} className="h-full w-full" />
                  ) : (
                    iniciais(v.nome)
                  )}
                </div>
                <div className="min-w-0 flex-1 pt-0.5">
                  <h2 className="line-clamp-2 text-[15px] font-semibold leading-snug text-zinc-900">{v.nome}</h2>
                  <p className="mt-1 flex items-center gap-1 text-xs text-zinc-500">
                    <MapPinIcon className="h-3.5 w-3.5 shrink-0" aria-hidden />
                    {v.cidadeUf}
                  </p>
                  <p className="mt-2 text-xs text-zinc-600">
                    {v.status === "pendente_verificacao" ? (
                      <>
                        <span className="font-medium text-zinc-500">Pedido enviado em </span>
                        <time dateTime={v.cadastroEm || undefined} className="font-semibold text-zinc-800">
                          {v.cadastroEm ? formatDashboardDateTime(v.cadastroEm) : "—"}
                        </time>
                      </>
                    ) : (
                      <>
                        <span className="font-medium text-zinc-500">Vendedor desde </span>
                        <time dateTime={v.cadastroEm || undefined} className="font-semibold text-zinc-800">
                          {v.cadastroEm ? formatDashboardDateTime(v.cadastroEm) : "—"}
                        </time>
                      </>
                    )}
                  </p>
                </div>
              </div>

              <div className="mt-3 space-y-1.5 text-sm">
                <p className="flex items-center gap-2 text-zinc-600">
                  <EnvelopeIcon className="h-4 w-4 shrink-0 text-zinc-400" aria-hidden />
                  <span className="truncate">{v.email}</span>
                </p>
                <p className="flex items-center gap-2 text-zinc-600">
                  <HugeiconsIcon
                    icon={WhatsappIcon}
                    size={16}
                    className="shrink-0 text-[#25D366]"
                    aria-hidden
                  />
                  {getWhatsappHref(v.telefone) ? (
                    <a
                      href={getWhatsappHref(v.telefone) || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-[#25D366] underline underline-offset-2 hover:opacity-85"
                    >
                      {v.telefone}
                    </a>
                  ) : (
                    <span className="font-medium text-[#25D366] underline underline-offset-2">{v.telefone}</span>
                  )}
                </p>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2">{statusBadge(v.status)}</div>

              <div className="mt-3 flex gap-4 border-t border-zinc-100 pt-3 text-sm">
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-wide text-zinc-400">Anúncios</p>
                  <p className="font-semibold text-zinc-900">{v.anunciosTotal}</p>
                </div>
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-wide text-zinc-400">Publicados</p>
                  <p className="font-semibold text-zinc-900">{v.anunciosPublicados}</p>
                </div>
              </div>

              <div className="mt-auto flex flex-col gap-2 border-t border-zinc-100 pt-3">
                {v.status === "pendente_verificacao" ? (
                  <>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="w-full rounded-full border-[var(--nulance-purple)]/35 text-[var(--nulance-purple)] hover:bg-[var(--nulance-purple)]/8"
                      onClick={() => void abrirAnalisePerfil(v)}
                    >
                      <ClipboardDocumentListIcon className="mr-2 h-4 w-4" aria-hidden />
                      Analisar perfil
                    </Button>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        type="button"
                        variant="default"
                        size="sm"
                        className="rounded-full border-0 bg-emerald-600 text-white hover:bg-emerald-700 hover:opacity-100"
                        disabled={acaoEmAndamentoId === String(v.id)}
                        onClick={() => void aceitarComoVendedor(v)}
                      >
                        <CheckCircleIcon className="mr-1.5 h-4 w-4" aria-hidden />
                        Aceitar
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        className="rounded-full text-red-700 hover:bg-red-50 hover:text-red-800"
                        disabled={acaoEmAndamentoId === String(v.id)}
                        onClick={() => abrirRecusa(v)}
                      >
                        <XMarkIcon className="mr-1.5 h-4 w-4" aria-hidden />
                        Recusar
                      </Button>
                    </div>
                  </>
                ) : null}
                {v.status === "ativo" ? (
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="w-full rounded-full text-red-700 hover:bg-red-50 hover:text-red-800"
                    disabled={acaoEmAndamentoId === String(v.usuarioId ?? "")}
                    onClick={() => setConfirmRevogar(v)}
                  >
                    <NoSymbolIcon className="mr-2 h-4 w-4" aria-hidden />
                    Revogar cargo de vendedor
                  </Button>
                ) : null}
                <Button
                  type="button"
                  variant="default"
                  size="sm"
                  className="w-full rounded-full"
                  onClick={() => setDetail(v)}
                >
                  <EyeIcon className="mr-2 h-4 w-4" aria-hidden />
                  Ver detalhes
                </Button>
                <Link
                  href={anunciosComFiltroHref(v.nome)}
                  className={cn(
                    "inline-flex h-8 w-full items-center justify-center gap-2 rounded-full px-3 text-sm font-medium",
                    "bg-zinc-100 text-zinc-900 transition-colors hover:bg-zinc-200"
                  )}
                >
                  <MegaphoneIcon className="h-4 w-4" aria-hidden />
                  Ver anúncios
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Sheet open={!!detail} onClose={closeDetail}>
        <SheetContent className="max-w-[min(100vw-1rem,520px)] w-full overflow-y-auto" onClose={closeDetail}>
          {detail ? (
            <>
              <SheetHeader className="text-left">
                <div className="flex flex-col gap-4 pr-8 sm:flex-row sm:items-start">
                  <div
                    className={cn(
                      "mx-auto flex h-[7.25rem] w-[7.25rem] shrink-0 items-center justify-center rounded-full text-3xl font-bold tracking-tight sm:mx-0",
                      "bg-[var(--nulance-purple)]/12 text-[var(--nulance-purple)] ring-[6px] ring-[var(--nulance-purple)]/10"
                    )}
                    aria-hidden
                  >
                    <Avatar src={detailFotoPerfil} alt={detail.nome} className="h-full w-full" />
                  </div>
                  <div className="min-w-0 flex-1 text-center sm:text-left">
                    <SheetTitle className="leading-snug">{detailNome}</SheetTitle>
                    <SheetDescription className="mt-1">{detailCidadeUf}</SheetDescription>
                    <p className="mt-2 text-sm text-zinc-600">
                      {detail.status === "pendente_verificacao" ? (
                        <>
                          <span className="text-zinc-500">Pedido de cadastro como vendedor em </span>
                          <time dateTime={detail.cadastroEm || undefined} className="font-semibold text-zinc-900">
                            {detail.cadastroEm ? formatDashboardDateTime(detail.cadastroEm) : "—"}
                          </time>
                        </>
                      ) : (
                        <>
                          <span className="text-zinc-500">Vendedor na NuLances desde </span>
                          <time dateTime={detail.cadastroEm || undefined} className="font-semibold text-zinc-900">
                            {detail.cadastroEm ? formatDashboardDateTime(detail.cadastroEm) : "—"}
                          </time>
                        </>
                      )}
                    </p>
                  </div>
                </div>
              </SheetHeader>

              <div className="mt-6 space-y-5 px-2 pb-4">
                <div className="flex flex-wrap gap-2">{statusBadge(detail.status)}</div>

                <dl className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <dt className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">E-mail</dt>
                    <dd className="mt-1 flex items-center gap-2 text-zinc-900">
                      <EnvelopeIcon className="h-4 w-4 shrink-0 text-zinc-400" aria-hidden />
                      <a href={`mailto:${detailEmail}`} className="text-[var(--nulance-purple)] underline">
                        {detailEmail}
                      </a>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">Telefone</dt>
                    <dd className="mt-1 flex items-center gap-2 text-zinc-900">
                      <HugeiconsIcon
                        icon={WhatsappIcon}
                        size={16}
                        className="shrink-0 text-[#25D366]"
                        aria-hidden
                      />
                      {getWhatsappHref(detailTelefone) ? (
                        <a
                          href={getWhatsappHref(detailTelefone) || "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-[#25D366] underline underline-offset-2 hover:opacity-85"
                        >
                          {detailTelefone}
                        </a>
                      ) : (
                        <span className="font-medium text-[#25D366] underline underline-offset-2">
                          {detailTelefone}
                        </span>
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">Local</dt>
                    <dd className="mt-1 flex items-center gap-2 text-zinc-900">
                      <MapPinIcon className="h-4 w-4 shrink-0 text-zinc-400" aria-hidden />
                      {detailCidadeUf}
                    </dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
                      CPF / CNPJ (referência)
                    </dt>
                    <dd className="mt-1 font-mono text-sm text-zinc-900">{detailDocumento}</dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
                      {detail.status === "pendente_verificacao" ? "Pedido enviado em" : "Vendedor desde"}
                    </dt>
                    <dd className="mt-1">
                      <time
                        dateTime={detail.cadastroEm || undefined}
                        className="text-base font-semibold text-zinc-900"
                      >
                        {detail.cadastroEm ? formatDashboardDateTime(detail.cadastroEm) : "—"}
                      </time>
                      <p className="mt-1 text-xs text-zinc-500">
                        {detail.status === "pendente_verificacao"
                          ? "Aguardando decisão do administrador."
                          : "Data de cadastro como vendedor na plataforma."}
                      </p>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">Anúncios</dt>
                    <dd className="mt-1 text-zinc-900">
                      {detail.anunciosTotal} total · {detail.anunciosPublicados} publicados
                    </dd>
                  </div>
                </dl>

                {detail.status === "ativo" && detail.usuarioId ? (
                  <VendedorPlanoAdminSection usuarioId={String(detail.usuarioId)} />
                ) : null}

                {detail.status === "pendente_verificacao" ? (
                  <div className="space-y-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full rounded-full border-[var(--nulance-purple)]/35 text-[var(--nulance-purple)] hover:bg-[var(--nulance-purple)]/8"
                      onClick={() => {
                        void abrirAnalisePerfil(detail);
                        closeDetail();
                      }}
                    >
                      <ClipboardDocumentListIcon className="mr-2 h-4 w-4" aria-hidden />
                      Analisar perfil e documentos
                    </Button>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      <Button
                        type="button"
                        className="rounded-full border-0 bg-emerald-600 text-white hover:bg-emerald-700 hover:opacity-100"
                        disabled={acaoEmAndamentoId === String(detail.id)}
                        onClick={() => void aceitarComoVendedor(detail)}
                      >
                        <CheckCircleIcon className="mr-2 h-4 w-4" aria-hidden />
                        Aceitar como vendedor
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        className="rounded-full text-red-700 hover:bg-red-50 hover:text-red-800"
                        disabled={acaoEmAndamentoId === String(detail.id)}
                        onClick={() => abrirRecusa(detail)}
                      >
                        <XMarkIcon className="mr-2 h-4 w-4" aria-hidden />
                        Recusar solicitação
                      </Button>
                    </div>
                  </div>
                ) : null}
                {detail.status === "ativo" ? (
                  <Button
                    type="button"
                    variant="secondary"
                    className="w-full rounded-full text-red-700 hover:bg-red-50 hover:text-red-800 sm:w-auto"
                    disabled={acaoEmAndamentoId === String(detail.usuarioId ?? "")}
                    onClick={() => setConfirmRevogar(detail)}
                  >
                    <NoSymbolIcon className="mr-2 h-4 w-4" aria-hidden />
                    Revogar cargo de vendedor
                  </Button>
                ) : null}

                <div className="flex flex-col gap-2 border-t border-zinc-100 pt-4 sm:flex-row sm:flex-wrap">
                  <Link
                    href={anunciosComFiltroHref(detail.nome)}
                    className={cn(
                      "inline-flex h-10 items-center justify-center gap-2 rounded-full px-4 text-sm font-medium text-white transition-opacity hover:opacity-95",
                      "bg-[var(--nulance-purple)]"
                    )}
                  >
                    <MegaphoneIcon className="h-4 w-4" aria-hidden />
                    Abrir anúncios deste vendedor
                  </Link>
                </div>
              </div>
            </>
          ) : null}
        </SheetContent>
      </Sheet>

      <VendedorAnalisarPerfilSheet
        open={!!analisePerfil}
        vendedor={analisePerfil}
        detalhe={analiseDetalhe}
        loading={analiseLoading}
        onClose={() => {
          setAnalisePerfil(null);
          setAnaliseDetalhe(null);
          setAnaliseLoading(false);
        }}
        onAceitar={() => {
          if (analisePerfil) void aceitarComoVendedor(analisePerfil);
        }}
        onPedirRecusa={() => {
          if (analisePerfil) {
            abrirRecusa(analisePerfil);
            setAnalisePerfil(null);
            setAnaliseDetalhe(null);
          }
        }}
      />

      <Dialog open={!!recusarTarget} onOpenChange={(open) => !open && fecharRecusa()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Recusar solicitação</DialogTitle>
            <DialogDescription>
              {recusarTarget ? (
                <>
                  Informe a observação da recusa para{" "}
                  <strong className="font-medium text-zinc-800">{recusarTarget.nome}</strong>.
                </>
              ) : (
                "Informe a observação da recusa."
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-1 space-y-2">
            <Label htmlFor="recusar-observacao" className="text-zinc-700">
              Observação (obrigatória)
            </Label>
            <textarea
              id="recusar-observacao"
              rows={4}
              value={recusarObservacao}
              onChange={(e) => setRecusarObservacao(e.target.value)}
              placeholder="Ex.: documentação incompleta, dados divergentes, etc."
              className={cn(
                "w-full rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nulance-purple)]/35"
              )}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="secondary" className="rounded-full" onClick={fecharRecusa}>
              Cancelar
            </Button>
            <Button
              type="button"
              className="rounded-full bg-red-600 text-white hover:opacity-95"
              disabled={acaoEmAndamentoId === String(recusarTarget?.id ?? "")}
              onClick={() => void recusarSolicitacao()}
            >
              Recusar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!confirmRevogar}
        onOpenChange={(o) => !o && setConfirmRevogar(null)}
        title="Revogar cargo de vendedor?"
        description={
          confirmRevogar ? (
            <>
              <strong className="font-medium text-zinc-800">{confirmRevogar.nome}</strong> deixará de ter o
              perfil de vendedor ativo.
            </>
          ) : null
        }
        confirmLabel="Revogar"
        confirmVariant="destructive"
        onConfirm={() => {
          if (!confirmRevogar) return;
          void revogarCargoVendedor(confirmRevogar);
          setConfirmRevogar(null);
        }}
      />
    </div>
  );
}
