"use client";

import * as React from "react";
import {
  AuctionIcon,
  CheckmarkCircle02Icon,
  LegalHammerIcon,
  ShoppingBag01Icon,
  ViewIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  MagnifyingGlassIcon,
  PencilSquareIcon,
  PlusIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { BemAdminSheet, type BemAdminSaveMeta } from "@/components/admin/bens/bem-admin-sheet";
import { BemMarcaLogo } from "@/components/admin/bens/bem-marca-logo";
import { useBensCatalog } from "@/components/admin/bens/bens-catalog-context";
import { AdminMetricTile } from "@/components/admin/dashboard/admin-metric-tile";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, type SelectOption } from "@/components/ui/select";
import { PageHeader } from "@/components/ui/page-header";
import { Pagination } from "@/components/ui/pagination";
import { useToast } from "@/components/ui/use-toast";
import { labelTipoVeiculoApi } from "@/data/bem-veiculo-api";
import { LOTES_ADMIN_SEED } from "@/data/lotes-admin";
import type { LoteBemItem } from "@/data/lotes-admin";
import {
  bemDetalheParaLoteItem,
  bemResumoParaLoteItem,
  loteItemParaCriarBemRequestFromItem,
  loteItemParaEditarBemRequestFromItem,
} from "@/lib/bem-api-mapper";
import {
  categoriasFromItems,
  filterBensAdmin,
  novoBemDraft,
  type BemCategoriaFilter,
} from "@/lib/admin-bens";
import { cn } from "@/lib/cn";
import {
  enviarArquivoBemMidia,
  excluirBemAdmin,
  excluirBemMidiaAdmin,
  listarBensAdmin,
  criarBemAdmin,
  editarBemAdmin,
  retirarBemDoLoteAdmin,
  buscarBemAdmin,
} from "@/lib/repositories/admin-bens-repository";
import type { BemResumoResponse, SpringPage } from "@/lib/repositories/types/bem.types";
import { ApiError } from "@/lib/repositories/types/auth.types";

const PAGE_SIZE = 9;
const LOTE_CTX_KEY = "nulance-admin-lote-context";

type LoteFilterState =
  | { kind: "none" }
  | { kind: "scoped"; banner: { codigo: string; titulo: string }; itemIds: string[] }
  | { kind: "unknown" };

type BemCardStatus = "DISPONIVEL" | "EM_UM_LOTE" | "LOTE_EM_ANDAMENTO" | "ARREMATADO";

type BemCardStatusMeta = {
  id: BemCardStatus;
  label: string;
  className: string;
};

const BEM_STATUS_META: Record<BemCardStatus, BemCardStatusMeta> = {
  DISPONIVEL: {
    id: "DISPONIVEL",
    label: "Disponível",
    className: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  },
  EM_UM_LOTE: {
    id: "EM_UM_LOTE",
    label: "Em um lote",
    className: "bg-blue-50 text-blue-700 ring-blue-200",
  },
  LOTE_EM_ANDAMENTO: {
    id: "LOTE_EM_ANDAMENTO",
    label: "Lote em andamento no leilão",
    className: "bg-amber-50 text-amber-700 ring-amber-200",
  },
  ARREMATADO: {
    id: "ARREMATADO",
    label: "Arrematado",
    className: "bg-zinc-100 text-zinc-700 ring-zinc-200",
  },
};

type BemSituacaoFilter = "todos" | "disponiveis" | "em_andamentos" | "arrematados";

const OPT_SITUACAO: SelectOption[] = [
  { value: "todos", label: "Todas as situações" },
  { value: "disponiveis", label: "Disponíveis" },
  { value: "em_andamentos", label: "Em andamentos" },
  { value: "arrematados", label: "Arrematados" },
];

function isPersistedBemId(id: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
}

function situacaoParaStatusApi(f: BemSituacaoFilter): string | undefined {
  if (f === "disponiveis") return "DISPONIVEL";
  if (f === "em_andamentos") return "EM_LOTE";
  if (f === "arrematados") return "ARREMATADO";
  return undefined;
}

function statusMetaFromApi(status?: string | null): BemCardStatusMeta {
  const s = (status ?? "DISPONIVEL").toUpperCase();
  if (s === "DISPONIVEL") return BEM_STATUS_META.DISPONIVEL;
  if (s === "EM_LOTE") return BEM_STATUS_META.EM_UM_LOTE;
  if (s === "EM_LEILAO") return BEM_STATUS_META.LOTE_EM_ANDAMENTO;
  if (s === "ARREMATADO" || s === "VENDIDO") return BEM_STATUS_META.ARREMATADO;
  return BEM_STATUS_META.DISPONIVEL;
}

const PREVIEW_POOL = [
  "https://images.unsplash.com/photo-1542362567-b07e54358753?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1494976688153-c3ce8c4e1f90?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=1200&q=80",
];

function hashSeed(input: string) {
  let h = 0;
  for (let i = 0; i < input.length; i++) h = (h * 31 + input.charCodeAt(i)) >>> 0;
  return h;
}

function previewImagesForBem(bemId: string, count = 3): string[] {
  const start = hashSeed(bemId) % PREVIEW_POOL.length;
  return Array.from({ length: count }, (_, idx) => PREVIEW_POOL[(start + idx) % PREVIEW_POOL.length]);
}

function BemPhotoPreview({ bemId, fotoUrls }: { bemId: string; fotoUrls?: string[] }) {
  const fallback = React.useMemo(() => previewImagesForBem(bemId, 3), [bemId]);
  const photos = React.useMemo(() => {
    const own = (fotoUrls ?? []).filter(Boolean);
    return own.length > 0 ? own : fallback;
  }, [bemId, fotoUrls, fallback]);
  const [active, setActive] = React.useState(0);

  React.useEffect(() => {
    setActive(0);
  }, [photos.join("|")]);

  React.useEffect(() => {
    const id = window.setInterval(() => {
      setActive((p) => (p + 1) % photos.length);
    }, 2500);
    return () => window.clearInterval(id);
  }, [photos.length]);

  return (
    <div className="relative h-36 w-full overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-100">
      {photos.map((src, idx) => {
        const fade = cn(
          "object-cover transition-opacity duration-700",
          idx === active ? "opacity-100" : "pointer-events-none opacity-0"
        );
        return (
          // eslint-disable-next-line @next/next/no-img-element -- URLs blob, storage e Unsplash no admin
          <img
            key={`${bemId}-${idx}`}
            src={src}
            alt=""
            className={cn("absolute inset-0 h-full w-full", fade)}
          />
        );
      })}
      <div className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-1.5 bg-gradient-to-t from-black/35 to-transparent pb-2 pt-6">
        {photos.map((_, idx) => (
          <span
            key={idx}
            className={cn("h-1.5 w-1.5 rounded-full bg-white/55", idx === active && "w-4 bg-white")}
          />
        ))}
      </div>
    </div>
  );
}

export function BensItensPageContent() {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const loteId = searchParams.get("lote");
  const { items: catalogItems, setItems, refreshFromApi } = useBensCatalog();

  const [search, setSearch] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [categoriaTab, setCategoriaTab] = React.useState<BemCategoriaFilter>("todos");
  const [situacaoFilter, setSituacaoFilter] = React.useState<BemSituacaoFilter>("todos");
  const [page, setPage] = React.useState(1);
  const [loteFilter, setLoteFilter] = React.useState<LoteFilterState>({ kind: "none" });
  const [listState, setListState] = React.useState<SpringPage<BemResumoResponse> | null>(null);
  const [listLoading, setListLoading] = React.useState(true);
  const [metrics, setMetrics] = React.useState({
    cadastrados: 0,
    disponiveis: 0,
    emAndamento: 0,
    arrematados: 0,
  });

  const [sheet, setSheet] = React.useState<
    { mode: "view" | "create" | "edit"; bem: LoteBemItem } | null
  >(null);

  const [sheetDetail, setSheetDetail] = React.useState<LoteBemItem | null>(null);

  const [deleteTarget, setDeleteTarget] = React.useState<LoteBemItem | null>(null);
  const [removeFromLoteTarget, setRemoveFromLoteTarget] = React.useState<LoteBemItem | null>(null);
  const [lotesCatalogo, setLotesCatalogo] = React.useState(() => LOTES_ADMIN_SEED);

  React.useEffect(() => {
    const t = window.setTimeout(() => setDebouncedSearch(search), 350);
    return () => window.clearTimeout(t);
  }, [search]);

  const statusApi = situacaoParaStatusApi(situacaoFilter);

  const loadList = React.useCallback(async () => {
    setListLoading(true);
    try {
      const p = await listarBensAdmin({
        page: page - 1,
        size: PAGE_SIZE,
        busca: debouncedSearch.trim() || undefined,
        status: statusApi,
      });
      setListState(p);
    } catch (e) {
      setListState({ content: [], totalElements: 0, totalPages: 0, size: PAGE_SIZE, number: 0 });
      toast({
        type: "error",
        title: "Não foi possível carregar os bens",
        description: e instanceof ApiError ? e.message : "Tente novamente.",
      });
    } finally {
      setListLoading(false);
    }
  }, [page, debouncedSearch, statusApi, toast]);

  React.useEffect(() => {
    void loadList();
  }, [loadList]);

  React.useEffect(() => {
    let cancelled = false;
    const count = async (status?: string) => {
      try {
        const p = await listarBensAdmin({ page: 0, size: 1, status });
        return p.totalElements;
      } catch {
        return 0;
      }
    };
    void (async () => {
      const [cadastrados, disponiveis, emLote, arrematados] = await Promise.all([
        count(),
        count("DISPONIVEL"),
        count("EM_LOTE"),
        count("ARREMATADO"),
      ]);
      if (!cancelled) {
        setMetrics({
          cadastrados,
          disponiveis,
          emAndamento: emLote,
          arrematados,
        });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  React.useEffect(() => {
    if (!loteId) {
      setLoteFilter({ kind: "none" });
      return;
    }
    const seed = lotesCatalogo.find((l) => l.id === loteId);
    if (seed) {
      setLoteFilter({
        kind: "scoped",
        banner: { codigo: seed.codigo, titulo: seed.titulo },
        itemIds: seed.itens.map((i) => i.id),
      });
      return;
    }
    try {
      const raw = sessionStorage.getItem(LOTE_CTX_KEY);
      if (raw) {
        const p = JSON.parse(raw) as {
          id: string;
          codigo: string;
          titulo: string;
          itemIds: string[];
        };
        if (p.id === loteId) {
          setLoteFilter({
            kind: "scoped",
            banner: { codigo: p.codigo, titulo: p.titulo },
            itemIds: p.itemIds,
          });
          return;
        }
      }
    } catch {
      /* ignore */
    }
    setLoteFilter({ kind: "unknown" });
  }, [loteId, lotesCatalogo]);

  const pageRows = React.useMemo(
    () => (listState?.content ?? []).map((r) => bemResumoParaLoteItem(r)),
    [listState]
  );

  const baseCatalog = React.useMemo(() => {
    if (loteFilter.kind !== "scoped") return pageRows;
    const m = new Map(catalogItems.map((b) => [b.id, b]));
    return loteFilter.itemIds
      .map((id) => m.get(id))
      .filter((x): x is LoteBemItem => x != null);
  }, [catalogItems, loteFilter, pageRows]);

  const categorias = React.useMemo(() => categoriasFromItems(baseCatalog), [baseCatalog]);

  const statusByBemId = React.useMemo(() => {
    const map = new Map<string, BemCardStatusMeta>();
    for (const lote of lotesCatalogo) {
      const status: BemCardStatus =
        lote.status === "encerrado"
          ? "ARREMATADO"
          : lote.status === "em_leilao"
            ? "LOTE_EM_ANDAMENTO"
            : "EM_UM_LOTE";
      for (const bem of lote.itens) {
        map.set(bem.id, BEM_STATUS_META[status]);
      }
    }
    return map;
  }, [lotesCatalogo]);

  const resolveStatus = React.useCallback(
    (bem: LoteBemItem) => {
      if (bem.statusBem) return statusMetaFromApi(bem.statusBem);
      return statusByBemId.get(bem.id) ?? BEM_STATUS_META.DISPONIVEL;
    },
    [statusByBemId]
  );

  const optTipoBem = React.useMemo<SelectOption[]>(
    () => [
      { value: "todos", label: "Todos os tipos" },
      ...categorias.map((c) => ({ value: c, label: c })),
    ],
    [categorias]
  );

  const filtered = React.useMemo(
    () => filterBensAdmin(baseCatalog, "", categoriaTab),
    [baseCatalog, categoriaTab]
  );

  const totalPages = Math.max(1, listState?.totalPages ?? 1);
  const totalElementsApi = listState?.totalElements ?? 0;

  React.useEffect(() => {
    setPage((p) => Math.min(Math.max(1, p), totalPages));
  }, [totalPages]);

  React.useEffect(() => {
    setPage(1);
  }, [debouncedSearch, categoriaTab, situacaoFilter, loteId, loteFilter.kind]);

  const paginated = filtered;

  const rangeStart =
    totalElementsApi === 0 || paginated.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const rangeEnd =
    paginated.length === 0 ? 0 : (page - 1) * PAGE_SIZE + paginated.length;

  const bemStatusCounts = metrics;

  React.useEffect(() => {
    if (!sheet || sheet.mode === "create") {
      setSheetDetail(null);
      return;
    }
    const id = sheet.bem.id;
    if (!isPersistedBemId(id)) {
      setSheetDetail(sheet.bem);
      return;
    }
    let cancelled = false;
    void (async () => {
      try {
        const raw = await buscarBemAdmin(id);
        if (!cancelled) setSheetDetail(bemDetalheParaLoteItem(raw));
      } catch {
        if (!cancelled) setSheetDetail(sheet.bem);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [sheet?.bem.id, sheet?.mode]);

  const handleSave = React.useCallback(
    async (next: LoteBemItem, meta: BemAdminSaveMeta) => {
      const persisted = isPersistedBemId(next.id);
      const st = resolveStatus(next);
      if (persisted && st.id !== "DISPONIVEL") {
        toast({
          type: "warning",
          title: "Não foi possível salvar",
          description: "Só é possível editar o bem quando o status na API for Disponível.",
        });
        throw new Error("blocked");
      }
      try {
        if (!persisted) {
          const body = loteItemParaCriarBemRequestFromItem(next);
          const created = await criarBemAdmin(body);
          const bemId = created.id;
          for (let i = 0; i < meta.novosArquivos.length; i += 1) {
            const u = meta.novosArquivos[i];
            await enviarArquivoBemMidia(bemId, u.file, u.kind, i);
          }
          await refreshFromApi();
          await loadList();
          toast({
            type: "success",
            title: "Bem cadastrado",
            description: `"${next.nome}" foi registrado na API.`,
          });
          return;
        }

        await editarBemAdmin(next.id, loteItemParaEditarBemRequestFromItem(next));
        for (const mid of meta.midiasRemovidasIds) {
          await excluirBemMidiaAdmin(next.id, mid);
        }
        for (let i = 0; i < meta.novosArquivos.length; i += 1) {
          const u = meta.novosArquivos[i];
          await enviarArquivoBemMidia(next.id, u.file, u.kind, i);
        }
        await refreshFromApi();
        await loadList();
        toast({
          type: "success",
          title: "Bem atualizado",
          description: `"${next.nome}" foi salvo.`,
        });
      } catch (e) {
        toast({
          type: "error",
          title: "Falha ao salvar",
          description: e instanceof ApiError ? e.message : "Tente novamente.",
        });
        throw e;
      }
    },
    [loadList, refreshFromApi, resolveStatus, toast]
  );

  const handleConfirmDelete = React.useCallback(async () => {
    if (!deleteTarget) return;
    const row = deleteTarget;
    if (isPersistedBemId(row.id)) {
      try {
        await excluirBemAdmin(row.id);
        await refreshFromApi();
        await loadList();
      } catch (e) {
        toast({
          type: "error",
          title: "Não foi possível excluir",
          description: e instanceof ApiError ? e.message : "Tente novamente.",
        });
        return;
      }
    } else {
      setItems((prev) => prev.filter((b) => b.id !== row.id));
    }
    setSheet((s) => (s?.bem.id === row.id ? null : s));
    setDeleteTarget(null);
    toast({
      type: "success",
      title: "Bem excluído",
      description: `"${row.nome}" foi removido do catálogo.`,
    });
  }, [deleteTarget, loadList, refreshFromApi, setItems, toast]);

  const handleConfirmRemoveFromLote = React.useCallback(async () => {
    const bem = removeFromLoteTarget;
    if (!bem) return;

    if (isPersistedBemId(bem.id)) {
      try {
        await retirarBemDoLoteAdmin(bem.id);
        await refreshFromApi();
        await loadList();
      } catch (e) {
        setRemoveFromLoteTarget(null);
        toast({
          type: "error",
          title: "Não foi possível remover",
          description: e instanceof ApiError ? e.message : "Verifique se o bem está EM_LOTE na API.",
        });
        return;
      }
      setSheet((s) => (s?.bem.id === bem.id ? null : s));
      setRemoveFromLoteTarget(null);
      toast({
        type: "success",
        title: "Bem removido do lote",
        description: `"${bem.nome}" voltou para disponível.`,
      });
      return;
    }

    const alvo = lotesCatalogo.find(
      (lote) => lote.status === "disponivel" && lote.itens.some((item) => item.id === bem.id)
    );
    if (!alvo) {
      setRemoveFromLoteTarget(null);
      toast({
        type: "warning",
        title: "Não foi possível remover",
        description: "Este bem não está em um lote disponível para remoção.",
      });
      return;
    }

    setLotesCatalogo((prev) =>
      prev.map((lote) =>
        lote.id === alvo.id ? { ...lote, itens: lote.itens.filter((item) => item.id !== bem.id) } : lote
      )
    );
    setLoteFilter((prev) => {
      if (prev.kind !== "scoped") return prev;
      if (prev.banner.codigo !== alvo.codigo) return prev;
      return { ...prev, itemIds: prev.itemIds.filter((id) => id !== bem.id) };
    });
    setSheet((s) => (s?.bem.id === bem.id ? null : s));
    setRemoveFromLoteTarget(null);
    toast({
      type: "success",
      title: "Bem removido do lote",
      description: `"${bem.nome}" foi removido de ${alvo.codigo}.`,
    });
  }, [lotesCatalogo, loadList, refreshFromApi, removeFromLoteTarget, toast]);

  const openCreate = React.useCallback(() => {
    setSheet({ mode: "create", bem: novoBemDraft(catalogItems) });
  }, [catalogItems]);

  const sheetBemLive = React.useMemo(() => {
    if (!sheet) return null;
    if (sheet.mode === "create") return sheet.bem;
    return sheetDetail ?? catalogItems.find((b) => b.id === sheet.bem.id) ?? sheet.bem;
  }, [catalogItems, sheet, sheetDetail]);

  return (
    <>
      <PageHeader
        title="Bens / Itens"
        subtitle="Gerencie os bens com praticidade: cadastre, edite, remova e organize as mídias em um só lugar. O catálogo completo também é usado na seleção de lotes."
        action={
          <Button type="button" size="md" className="rounded-full" onClick={openCreate}>
            <PlusIcon className="h-4 w-4" aria-hidden />
            Novo bem
          </Button>
        }
      />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdminMetricTile
          label="Bens cadastrados"
          value={bemStatusCounts.cadastrados}
          icon={ShoppingBag01Icon}
          accent="purple"
        />
        <AdminMetricTile
          label="Arrematados"
          value={bemStatusCounts.arrematados}
          icon={LegalHammerIcon}
          accent="zinc"
        />
        <AdminMetricTile
          label="Em andamentos"
          value={bemStatusCounts.emAndamento}
          icon={AuctionIcon}
          accent="amber"
        />
        <AdminMetricTile
          label="Disponíveis"
          value={bemStatusCounts.disponiveis}
          icon={CheckmarkCircle02Icon}
          accent="emerald"
        />
      </div>

      {loteFilter.kind === "scoped" ? (
        <div className="mb-6 rounded-2xl border border-nulance-purple/20 bg-nulance-purple/5 px-4 py-3 text-sm text-zinc-800">
          <p className="font-semibold text-zinc-900">Contexto do lote</p>
          <p className="mt-1 text-zinc-700">
            {loteFilter.banner.codigo} — {loteFilter.banner.titulo}
          </p>
          <p className="mt-2 text-xs text-zinc-600">
            Mostrando apenas os bens deste lote.{" "}
            <Link
              href="/admin/bens-itens"
              className="font-medium text-[var(--nulance-purple)] underline-offset-2 hover:underline"
            >
              Ver catálogo completo
            </Link>
            .
          </p>
        </div>
      ) : null}

      {loteFilter.kind === "unknown" && loteId ? (
        <p className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          Não foi possível localizar este lote.{" "}
          <Link href="/admin/bens-itens" className="font-medium underline underline-offset-2">
            Ver catálogo geral
          </Link>
          .
        </p>
      ) : null}

      {!loteId ? (
        <p className="mb-4 text-sm text-zinc-600">
          Busque por nome, categoria ou ID. No detalhe de um lote, use{" "}
          <strong className="font-medium text-zinc-800">Visualizar</strong> para filtrar os bens daquele
          lote.
        </p>
      ) : null}

      <div className="mb-4 flex flex-col gap-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:gap-4">
          <div className="w-full min-w-0 lg:max-w-[220px]">
            <Label htmlFor="bem-filtro-situacao" className="text-zinc-700">
              Situação
            </Label>
            <Select
              id="bem-filtro-situacao"
              value={situacaoFilter}
              onValueChange={(v) => setSituacaoFilter(v as BemSituacaoFilter)}
              options={OPT_SITUACAO}
              placeholder="Situação"
              aria-label="Filtrar por situação do bem"
              className="mt-1.5"
            />
          </div>
          <div className="w-full min-w-0 lg:max-w-[240px]">
            <Label htmlFor="bem-filtro-tipo" className="text-zinc-700">
              Tipo de bem
            </Label>
            <Select
              id="bem-filtro-tipo"
              value={categorias.includes(categoriaTab) || categoriaTab === "todos" ? categoriaTab : "todos"}
              onValueChange={(v) => setCategoriaTab(v as BemCategoriaFilter)}
              options={optTipoBem}
              placeholder="Tipo de bem"
              aria-label="Filtrar por tipo de bem"
              className="mt-1.5"
            />
          </div>
          <div className="relative w-full min-w-0 flex-1 lg:max-w-md">
            <MagnifyingGlassIcon
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400"
              aria-hidden
            />
            <Input
              type="search"
              placeholder="Buscar por nome, marca, tipo, descrição…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Buscar bens"
              className="rounded-2xl pl-10"
            />
          </div>
        </div>
      </div>

      {listLoading ? (
        <div className="rounded-3xl border border-zinc-200 bg-white px-6 py-16 text-center text-zinc-500">
          Carregando bens…
        </div>
      ) : paginated.length === 0 ? (
        <div className="rounded-3xl border border-zinc-200 bg-white px-6 py-16 text-center text-zinc-500">
          Nenhum bem neste filtro.
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {paginated.map((bem) => {
            const status = resolveStatus(bem);
            const podeRemoverDoLote = status.id === "EM_UM_LOTE";
            const podeEditar = status.id === "DISPONIVEL";
            return (
            <li key={bem.id}>
              <article
                className={cn(
                  "flex h-full flex-col rounded-[22px] border border-zinc-300 bg-white p-5 transition-colors",
                  "hover:border-[var(--nulance-purple)]/45"
                )}
              >
                <BemPhotoPreview bemId={bem.id} fotoUrls={bem.fotoUrls} />
                <div className="mt-4 flex items-start gap-3">
                  <BemMarcaLogo nome={bem.nome} marca={bem.marca} />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold leading-snug text-zinc-900">{bem.nome}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1",
                          status.className
                        )}
                      >
                        {status.label}
                      </span>
                      {bem.categoria ?? bem.tipoVeiculo ? (
                        <Badge variant="zinc" size="sm" className="normal-case tracking-normal">
                          {bem.categoria ?? labelTipoVeiculoApi(bem.tipoVeiculo) ?? bem.tipoVeiculo}
                        </Badge>
                      ) : null}
                    </div>
                    {bem.descricao ? (
                      <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-zinc-600">
                        {bem.descricao}
                      </p>
                    ) : null}
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="rounded-full"
                    onClick={() => setSheet({ mode: "view", bem })}
                  >
                    <HugeiconsIcon icon={ViewIcon} className="h-4 w-4" aria-hidden />
                    Detalhes
                  </Button>
                  <Button
                    type="button"
                    variant="default"
                    size="sm"
                    className="rounded-full"
                    disabled={!podeEditar}
                    title={
                      podeEditar
                        ? "Editar bem"
                        : "Só é possível editar bens com status Disponível na API."
                    }
                    onClick={() => setSheet({ mode: "edit", bem })}
                  >
                    <PencilSquareIcon className="h-4 w-4" aria-hidden />
                    Editar
                  </Button>
                  {podeRemoverDoLote ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="rounded-full text-amber-700 hover:bg-amber-50 hover:text-amber-800"
                      onClick={() => setRemoveFromLoteTarget(bem)}
                    >
                      <TrashIcon className="h-4 w-4" aria-hidden />
                      Remover do lote
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="rounded-full text-red-700 hover:bg-red-50 hover:text-red-800"
                      onClick={() => setDeleteTarget(bem)}
                      title="Excluir bem permanentemente"
                    >
                      <TrashIcon className="h-4 w-4" aria-hidden />
                      Excluir
                    </Button>
                  )}
                </div>
              </article>
            </li>
          )})}
        </ul>
      )}

      {paginated.length > 0 && totalElementsApi > 0 ? (
        <p className="mt-8 text-center text-xs text-zinc-500">
          Itens {rangeStart}–{rangeEnd} nesta página · {totalElementsApi} no total (API, com filtros de
          situação e busca)
        </p>
      ) : null}

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
        className="mt-6"
      />

      {sheet ? (
        <BemAdminSheet
          open
          onClose={() => setSheet(null)}
          mode={sheet.mode}
          bem={sheetBemLive}
          onSave={handleSave}
          onRequestEdit={
            sheet.mode === "view" && resolveStatus(sheet.bem).id === "DISPONIVEL"
              ? () => setSheet({ mode: "edit", bem: sheet.bem })
              : undefined
          }
          onDelete={
            sheet.mode === "view"
              ? (id) => {
                  const b = catalogItems.find((x) => x.id === id) ?? sheet?.bem;
                  if (b) setDeleteTarget(b);
                }
              : undefined
          }
        />
      ) : null}

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title="Excluir bem?"
        description={
          deleteTarget ? (
            <>
              <span className="font-medium text-zinc-800">{deleteTarget.nome}</span> será removido do
              catálogo. Esta ação chama DELETE /admin/bens na API quando o bem já está persistido.
            </>
          ) : null
        }
        cancelLabel="Cancelar"
        confirmLabel="Excluir"
        confirmVariant="destructive"
        onConfirm={handleConfirmDelete}
      />
      <ConfirmDialog
        open={removeFromLoteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setRemoveFromLoteTarget(null);
        }}
        title="Remover bem do lote?"
        description={
          removeFromLoteTarget ? (
            <>
              <span className="font-medium text-zinc-800">{removeFromLoteTarget.nome}</span> será
              removido do lote disponível e voltará para status <strong>Disponível</strong>.
            </>
          ) : null
        }
        cancelLabel="Cancelar"
        confirmLabel="Remover do lote"
        confirmVariant="warning"
        onConfirm={handleConfirmRemoveFromLote}
      />
    </>
  );
}
