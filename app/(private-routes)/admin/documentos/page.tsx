"use client";

import * as React from "react";
import {
  CheckmarkCircle02Icon,
  HourglassIcon,
  UserGroupIcon,
  CancelCircleIcon,
} from "@hugeicons/core-free-icons";

import { AdminMetricTile } from "@/components/admin/dashboard/admin-metric-tile";
import { KycReviewModal } from "@/components/admin/documentos/kyc-review-modal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { Pagination } from "@/components/ui/pagination";
import { useToast } from "@/components/ui/use-toast";
import { type UsuarioDocumentosKyc, kycDocumentosCompletos } from "@/data/usuarios-documentos-kyc";
import { getAuthTokenFromDocument } from "@/lib/auth-cookies";
import { buildKycStats, filterUsuariosKyc, type KycTabFilter } from "@/lib/admin-documentos-kyc";
import { cn } from "@/lib/cn";
import {
  atualizarStatusDocumentoValidacaoAdmin,
  listarDocumentosValidacaoAdmin,
  type AdminDocumentoValidacaoPatchStatus,
  type AdminDocumentoValidacaoResponse,
  type AdminDocumentoValidacaoStatus,
} from "@/lib/repositories/documentos-validacao-repository";
import { ApiError } from "@/lib/repositories/types/auth.types";

const PAGE_SIZE = 8;

const TABS: { id: KycTabFilter; label: string }[] = [
  { id: "todos", label: "Todos" },
  { id: "aprovado", label: "Aprovados" },
  { id: "pendente", label: "Pendentes" },
  { id: "recusado", label: "Recusados" },
];

function docParBadge(frente: boolean, verso: boolean) {
  if (frente && verso) {
    return (
      <Badge variant="emerald" size="sm" className="normal-case tracking-normal">
        Frente + verso
      </Badge>
    );
  }
  const falta: string[] = [];
  if (!frente) falta.push("frente");
  if (!verso) falta.push("verso");
  return (
    <Badge variant="amber" size="sm" className="normal-case tracking-normal" title={`Falta: ${falta.join(" e ")}`}>
      Incompleto
    </Badge>
  );
}

function statusBadge(status: UsuarioDocumentosKyc["status"]) {
  if (status === "aprovado") return <Badge variant="emerald" size="sm">Aprovado</Badge>;
  if (status === "pendente") return <Badge variant="amber" size="sm">Pendente</Badge>;
  return <Badge variant="red" size="sm">Recusado</Badge>;
}

function formatCpf(cpfRaw: unknown): string {
  const d = String(cpfRaw ?? "").replace(/\D/g, "");
  if (d.length !== 11) return "***.***.***-**";
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
}

function formatDateTime(value: unknown): string {
  const s = String(value ?? "");
  if (!s) return "—";
  const dt = new Date(s);
  if (Number.isNaN(dt.getTime())) return s;
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(dt);
}

function mapStatus(raw: unknown): UsuarioDocumentosKyc["status"] {
  const s = String(raw ?? "").toUpperCase();
  if (s === "APROVADO") return "aprovado";
  if (s === "RECUSADO" || s === "REJEITADO") return "recusado";
  return "pendente";
}

function statusFromDocs(docs: AdminDocumentoValidacaoResponse[]): UsuarioDocumentosKyc["status"] {
  const statuses = docs.map((d) => mapStatus(d.status));
  if (statuses.some((s) => s === "pendente")) return "pendente";
  if (statuses.some((s) => s === "recusado")) return "recusado";
  return "aprovado";
}

function statusFromTipos(docs: AdminDocumentoValidacaoResponse[], tipos: string[]): UsuarioDocumentosKyc["status"] | undefined {
  const selected = docs.filter((d) => tipos.some((t) => isTipo(d, t)));
  if (selected.length === 0) return undefined;
  const statuses = selected.map((d) => mapStatus(d.status));
  if (statuses.some((s) => s === "pendente")) return "pendente";
  if (statuses.some((s) => s === "recusado")) return "recusado";
  return "aprovado";
}

function isTipo(d: AdminDocumentoValidacaoResponse, tipo: string): boolean {
  return String(d.tipo ?? "").toUpperCase() === tipo;
}

function urlByTipo(docs: AdminDocumentoValidacaoResponse[], tipo: string): string | undefined {
  return docs.find((d) => isTipo(d, tipo))?.arquivoUrl;
}

function idByTipo(docs: AdminDocumentoValidacaoResponse[], tipo: string): string | undefined {
  const id = docs.find((d) => isTipo(d, tipo))?.id;
  return typeof id === "string" ? id : undefined;
}

function groupByUser(rows: AdminDocumentoValidacaoResponse[]): UsuarioDocumentosKyc[] {
  const map = new Map<string, AdminDocumentoValidacaoResponse[]>();
  for (const row of rows) {
    const k = String(row.usuarioId ?? row.email ?? row.id ?? Math.random());
    if (!map.has(k)) map.set(k, []);
    map.get(k)!.push(row);
  }

  const out: UsuarioDocumentosKyc[] = [];
  map.forEach((docs, key) => {
    const first = docs[0];
    const createdSorted = docs.map((d) => d.createdAt).filter(Boolean).sort();
    const updatedSorted = docs.map((d) => d.updatedAt).filter(Boolean).sort();

    out.push({
      id: key,
      nome: String(first?.nomeCompleto ?? "Usuário"),
      email: String(first?.email ?? "—"),
      telefone: "—",
      cpfMascarado: formatCpf(first?.cpf),
      dataNascimento: "—",
      cidade: "—",
      uf: "—",
      rgFrenteEnviado: docs.some((d) => isTipo(d, "RG_FRENTE")),
      rgFrenteId: idByTipo(docs, "RG_FRENTE"),
      rgFrenteUrl: urlByTipo(docs, "RG_FRENTE"),
      rgVersoEnviado: docs.some((d) => isTipo(d, "RG_VERSO")),
      rgVersoId: idByTipo(docs, "RG_VERSO"),
      rgVersoUrl: urlByTipo(docs, "RG_VERSO"),
      // Bloco CNH (mapeado de CNH_FRENTE/CNH_VERSO).
      cpfFrenteEnviado: docs.some((d) => isTipo(d, "CNH_FRENTE")),
      cpfFrenteId: idByTipo(docs, "CNH_FRENTE"),
      cpfFrenteUrl: urlByTipo(docs, "CNH_FRENTE"),
      cpfVersoEnviado: docs.some((d) => isTipo(d, "CNH_VERSO")),
      cpfVersoId: idByTipo(docs, "CNH_VERSO"),
      cpfVersoUrl: urlByTipo(docs, "CNH_VERSO"),
      rgStatus: statusFromTipos(docs, ["RG_FRENTE", "RG_VERSO"]),
      cnhStatus: statusFromTipos(docs, ["CNH_FRENTE", "CNH_VERSO"]),
      status: statusFromDocs(docs),
      enviadoEm: formatDateTime(createdSorted[0]),
      atualizadoEm: formatDateTime(updatedSorted[updatedSorted.length - 1]),
      motivoRecusa: undefined,
    });
  });

  return out.sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
}

export default function AdminDocumentosPage() {
  const { toast } = useToast();
  const [rows, setRows] = React.useState<UsuarioDocumentosKyc[]>([]);
  const [tab, setTab] = React.useState<KycTabFilter>("todos");
  const [search, setSearch] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [isLoading, setIsLoading] = React.useState(false);
  const [reviewUser, setReviewUser] = React.useState<UsuarioDocumentosKyc | null>(null);

  const loadRows = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const token = getAuthTokenFromDocument();
      const statuses: AdminDocumentoValidacaoStatus[] = ["PENDENTE", "APROVADO", "RECUSADO"];
      const chunks = await Promise.all(statuses.map((s) => listarDocumentosValidacaoAdmin(s, token)));
      const merged = new Map<string, AdminDocumentoValidacaoResponse>();
      for (const list of chunks) {
        for (const doc of list) {
          const id = String(doc.id ?? "");
          if (!id) continue;
          merged.set(id, doc);
        }
      }
      setRows(groupByUser([...merged.values()]));
    } catch (err) {
      toast({
        type: "error",
        title: "Falha ao buscar documentos",
        description: err instanceof ApiError ? err.message : "Nao foi possivel carregar os documentos.",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  React.useEffect(() => {
    void loadRows();
  }, [loadRows]);

  const stats = React.useMemo(() => buildKycStats(rows), [rows]);
  const filtered = React.useMemo(() => filterUsuariosKyc(rows, tab, search), [rows, tab, search]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  React.useEffect(() => {
    setPage((p) => Math.min(Math.max(1, p), totalPages));
  }, [totalPages]);

  React.useEffect(() => {
    setPage(1);
  }, [tab, search]);

  const paginated = React.useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  const reviewUserLive = React.useMemo(() => {
    if (!reviewUser) return null;
    return rows.find((r) => r.id === reviewUser.id) ?? reviewUser;
  }, [reviewUser, rows]);

  const handleUpdateGrupo = React.useCallback(
    async (userId: string, grupo: "rg" | "cnh", status: AdminDocumentoValidacaoPatchStatus) => {
      const user = rows.find((r) => r.id === userId);
      if (!user) return;
      const ids = (grupo === "rg"
        ? [user.rgFrenteId, user.rgVersoId]
        : [user.cpfFrenteId, user.cpfVersoId]
      ).filter((v): v is string => Boolean(v));

      if (ids.length === 0) {
        toast({
          type: "warning",
          title: "Sem documentos neste grupo",
          description: `Nao ha arquivos de ${grupo.toUpperCase()} para atualizar.`,
        });
        return;
      }

      try {
        const token = getAuthTokenFromDocument();
        await Promise.all(ids.map((id) => atualizarStatusDocumentoValidacaoAdmin(id, status, token)));
        await loadRows();
        toast({
          type: "success",
          title: status === "APROVADO" ? "Grupo aprovado" : "Grupo recusado",
          description: `${grupo.toUpperCase()} de ${user.nome} atualizado com sucesso.`,
        });
      } catch (err) {
        toast({
          type: "error",
          title: "Falha ao atualizar status",
          description: err instanceof ApiError ? err.message : "Nao foi possivel atualizar os documentos.",
        });
      }
    },
    [rows, loadRows, toast]
  );

  return (
    <>
      <PageHeader
        title="Documentos de usuários"
        subtitle="Quem vai dar lances precisa ter RG e CNH enviados e aprovados. Use Ver para abrir os arquivos e decidir."
      />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdminMetricTile label="Aprovados" value={stats.aprovado} icon={CheckmarkCircle02Icon} accent="emerald" hint="Podem dar lances" />
        <AdminMetricTile label="Pendentes" value={stats.pendente} icon={HourglassIcon} accent="amber" hint="Aguardando análise" />
        <AdminMetricTile label="Recusados" value={stats.recusado} icon={CancelCircleIcon} accent="red" hint="Precisam reenviar" />
        <AdminMetricTile label="Total na base" value={stats.total} icon={UserGroupIcon} accent="purple" />
      </div>

      <section className="rounded-3xl border border-zinc-200 bg-white">
        <div className="flex flex-col gap-4 border-b border-zinc-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <div className="flex items-center gap-3">
            <div>
              <h2 className="text-[15px] font-bold text-zinc-900">Verificação RG + CNH</h2>
              <p className="text-sm text-zinc-500">Lista por status. Busque por nome ou e-mail.</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 border-b border-zinc-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filtrar por status">
            {TABS.map((t) => {
              const active = tab === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setTab(t.id)}
                  className={cn(
                    "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                    active ? "bg-[var(--nulance-purple)] text-white" : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
                  )}
                >
                  {t.label}
                </button>
              );
            })}
          </div>
          <div className="w-full min-w-0 sm:max-w-xs">
            <Input
              type="search"
              placeholder="Buscar nome ou e-mail…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Buscar usuário"
              className="rounded-2xl"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="px-5 py-12 text-center text-zinc-500 sm:px-8">Carregando documentos...</div>
        ) : paginated.length === 0 ? (
          <div className="px-5 py-12 text-center text-zinc-500 sm:px-8">Nenhum usuário neste filtro.</div>
        ) : (
          <div className="overflow-x-auto md:block">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-100 text-[11px] font-semibold uppercase tracking-[0.08em] text-zinc-500">
                  <th className="px-5 py-3 sm:px-8">Usuário</th>
                  <th className="px-2 py-3">E-mail</th>
                  <th className="px-2 py-3">RG</th>
                  <th className="px-2 py-3">CNH</th>
                  <th className="px-2 py-3">Status</th>
                  <th className="px-2 py-3">Atualizado</th>
                  <th className="px-5 py-3 text-right sm:px-8">
                    <span className="sr-only">Abrir análise</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((r) => {
                  const docsCompletos = kycDocumentosCompletos(r);
                  return (
                    <tr key={r.id} className="border-b border-zinc-100/80 last:border-b-0">
                      <td className="px-5 py-4 align-top sm:px-8">
                        <p className="font-semibold text-zinc-900">{r.nome}</p>
                        <p className="mt-0.5 text-xs text-zinc-500">{r.cpfMascarado}</p>
                        {r.status === "pendente" && !docsCompletos ? (
                          <p className="mt-2 text-xs text-amber-800">
                            Aguardando envio de RG e/ou CNH para aprovação.
                          </p>
                        ) : null}
                        {r.status === "recusado" && r.motivoRecusa ? (
                          <p className="mt-2 max-w-[280px] text-xs leading-relaxed text-red-800">
                            <span className="font-medium">Motivo: </span>
                            {r.motivoRecusa}
                          </p>
                        ) : null}
                      </td>
                      <td className="max-w-[200px] px-2 py-4 align-top break-all text-zinc-600">
                        {r.email}
                      </td>
                      <td className="px-2 py-4 align-top">{docParBadge(r.rgFrenteEnviado, r.rgVersoEnviado)}</td>
                      <td className="px-2 py-4 align-top">{docParBadge(r.cpfFrenteEnviado, r.cpfVersoEnviado)}</td>
                      <td className="px-2 py-4 align-top">{statusBadge(r.status)}</td>
                      <td className="px-2 py-4 align-top text-zinc-500">{r.atualizadoEm}</td>
                      <td className="px-5 py-4 text-right align-top sm:px-8">
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          className="rounded-full"
                          aria-label={`Ver documentos de ${r.nome}`}
                          onClick={() => setReviewUser(r)}
                        >
                          Ver
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} className="px-5 pb-6 sm:px-8" />
      </section>

      <KycReviewModal
        open={reviewUser !== null}
        onOpenChange={(open) => {
          if (!open) setReviewUser(null);
        }}
        usuario={reviewUserLive}
        onAprovarGrupo={(id, grupo) => void handleUpdateGrupo(id, grupo, "APROVADO")}
        onRecusarGrupo={(id, grupo) => void handleUpdateGrupo(id, grupo, "RECUSADO")}
      />
    </>
  );
}
