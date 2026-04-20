"use client";

import * as React from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/ui/page-header";
import { Pagination } from "@/components/ui/pagination";
import { Select, type SelectOption } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useToast } from "@/components/ui/use-toast";
import {
  alterarCargoUsuarioAdmin,
  buscarUsuarioAdminPorId,
  editarUsuarioAdminParcial,
  listarUsuariosAdmin,
} from "@/lib/repositories/admin-usuarios-repository";
import type {
  AdminUsuarioResponse,
  AdminUsuarioRoleApi,
} from "@/lib/repositories/types/admin-usuarios.types";
import { ApiError } from "@/lib/repositories/types/auth.types";

type UsersScreenScope = "leilao" | "marketplace";

type UiUser = {
  id: string;
  nome: string;
  email: string;
  role: AdminUsuarioRoleApi;
  cidade: string;
  telefone: string;
};

const PAGE_SIZE = 10;

const ROLE_FILTER_OPTIONS: SelectOption[] = [
  { value: "todos", label: "Todos os perfis" },
  { value: "ADMIN", label: "Administrador" },
  { value: "VENDEDOR", label: "Vendedor" },
  { value: "COMPRADOR", label: "Comum" },
];

function parseApiError(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error) return error.message;
  return "Não foi possível concluir a operação.";
}

function roleLabel(role: string): string {
  const code = String(role).toUpperCase();
  if (code === "ADMIN") return "Administrador";
  if (code === "VENDEDOR") return "Vendedor";
  return "Comum";
}

function roleBadgeVariant(role: string): "purple" | "emerald" | "amber" | "zinc" {
  const code = String(role).toUpperCase();
  if (code === "ADMIN") return "purple";
  if (code === "VENDEDOR") return "emerald";
  return "zinc";
}

function toUiUser(row: {
  id: string;
  nomeCompleto: string;
  email: string;
  role: AdminUsuarioRoleApi;
  cidade?: string | null;
  telefone?: string | null;
}): UiUser {
  return {
    id: row.id,
    nome: row.nomeCompleto,
    email: row.email,
    role: row.role,
    cidade: String(row.cidade ?? "").trim() || "Não informado",
    telefone: String(row.telefone ?? "").trim() || "Não informado",
  };
}

export function AdminUsersManagementPageContent({ scope = "leilao" }: { scope?: UsersScreenScope }) {
  const { toast } = useToast();
  const [users, setUsers] = React.useState<UiUser[]>([]);
  const [detailsById, setDetailsById] = React.useState<Record<string, AdminUsuarioResponse>>({});
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [searchDebounced, setSearchDebounced] = React.useState("");
  const [roleFilter, setRoleFilter] = React.useState("todos");
  const [currentPage, setCurrentPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);

  const [detailUser, setDetailUser] = React.useState<AdminUsuarioResponse | null>(null);
  const [editDraft, setEditDraft] = React.useState<AdminUsuarioResponse | null>(null);

  const [loadingDetailId, setLoadingDetailId] = React.useState<string | null>(null);
  const [savingEdit, setSavingEdit] = React.useState(false);

  React.useEffect(() => {
    const t = window.setTimeout(() => setSearchDebounced(search.trim()), 300);
    return () => window.clearTimeout(t);
  }, [search]);

  const loadPage = React.useCallback(async () => {
    setLoading(true);
    try {
      const page = await listarUsuariosAdmin({
        busca: searchDebounced || undefined,
        page: currentPage - 1,
        size: PAGE_SIZE,
      });
      const mapped = (page.content ?? []).map(toUiUser);
      setUsers(mapped);
      setTotalPages(Math.max(1, page.totalPages || 1));

      // Busca detalhada por usuário para ações de detalhes/edição.
      const detailsResults = await Promise.all(
        mapped.map(async (user) => {
          try {
            const detail = await buscarUsuarioAdminPorId(user.id);
            return { id: user.id, detail };
          } catch {
            return null;
          }
        })
      );

      setDetailsById((prev) => {
        const next = { ...prev };
        for (const result of detailsResults) {
          if (!result) continue;
          next[result.id] = result.detail;
        }
        return next;
      });
    } catch (error) {
      setUsers([]);
      setTotalPages(1);
      toast({
        type: "error",
        title: "Falha ao carregar usuários",
        description: parseApiError(error),
      });
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchDebounced, toast]);

  React.useEffect(() => {
    void loadPage();
  }, [loadPage]);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchDebounced]);

  const filteredUsers = React.useMemo(() => {
    return users.filter((user) => {
      if (roleFilter !== "todos" && String(user.role).toUpperCase() !== roleFilter) return false;
      return true;
    });
  }, [roleFilter, users]);

  const ensureDetail = React.useCallback(
    async (id: string): Promise<AdminUsuarioResponse | null> => {
      const cached = detailsById[id];
      if (cached) return cached;
      try {
        const detail = await buscarUsuarioAdminPorId(id);
        setDetailsById((prev) => ({ ...prev, [id]: detail }));
        return detail;
      } catch (error) {
        toast({
          type: "error",
          title: "Falha ao carregar detalhes",
          description: parseApiError(error),
        });
        return null;
      }
    },
    [detailsById, toast]
  );

  const openDetail = React.useCallback(
    async (id: string) => {
      setLoadingDetailId(id);
      const detail = await ensureDetail(id);
      setLoadingDetailId(null);
      if (detail) setDetailUser(detail);
    },
    [ensureDetail]
  );

  const openEdit = React.useCallback(
    async (id: string) => {
      setLoadingDetailId(id);
      const detail = await ensureDetail(id);
      setLoadingDetailId(null);
      if (detail) setEditDraft(detail);
    },
    [ensureDetail]
  );

  const saveEdit = React.useCallback(async () => {
    if (!editDraft) return;
    const nomeCompleto = editDraft.nomeCompleto.trim();
    const email = editDraft.email.trim();
    if (!nomeCompleto || !email) {
      toast({
        type: "warning",
        title: "Campos obrigatórios",
        description: "Preencha nome e e-mail para salvar.",
      });
      return;
    }

    setSavingEdit(true);
    try {
      const payload = {
        nomeCompleto,
        dataNascimento: editDraft.dataNascimento ?? undefined,
        email,
        cpf: editDraft.cpf?.trim() || undefined,
        telefone: editDraft.telefone?.trim() || undefined,
        fotoPerfil: editDraft.fotoPerfil?.trim() || undefined,
        cep: editDraft.cep?.trim() || undefined,
        logradouro: editDraft.logradouro?.trim() || undefined,
        cidade: editDraft.cidade?.trim() || undefined,
        estado: editDraft.estado?.trim() || undefined,
        emailVerificado: Boolean(editDraft.emailVerificado),
      };

      const current = detailsById[editDraft.id];
      const roleChanged =
        current && String(current.role).toUpperCase() !== String(editDraft.role).toUpperCase();

      let updated = await editarUsuarioAdminParcial(editDraft.id, payload);
      if (roleChanged) {
        updated = await alterarCargoUsuarioAdmin(editDraft.id, { role: editDraft.role });
      }

      setDetailsById((prev) => ({ ...prev, [updated.id]: updated }));
      setUsers((prev) =>
        prev.map((user) =>
          user.id === updated.id
            ? toUiUser({
                id: updated.id,
                nomeCompleto: updated.nomeCompleto,
                email: updated.email,
                role: updated.role,
                cidade: updated.cidade,
                telefone: updated.telefone,
              })
            : user
        )
      );
      setDetailUser((prev) => (prev && prev.id === updated.id ? updated : prev));
      setEditDraft(null);
      toast({
        type: "success",
        title: "Usuário atualizado",
        description: "As alterações foram salvas com sucesso.",
      });
    } catch (error) {
      toast({
        type: "error",
        title: "Falha ao salvar usuário",
        description: parseApiError(error),
      });
    } finally {
      setSavingEdit(false);
    }
  }, [detailsById, editDraft, toast]);

  return (
    <div>
      <PageHeader
        title="Gestão de usuários"
        subtitle={
          scope === "marketplace"
            ? "Gerencie os usuários da plataforma com busca, filtros e ações rápidas."
            : "Acompanhe todos os usuários do sistema e gerencie os cadastros em um só lugar."
        }
      />

      <div className="mb-5 grid grid-cols-1 gap-3 rounded-2xl border border-zinc-200 bg-white p-4 md:grid-cols-3">
        <div className="md:col-span-2">
          <Label htmlFor="users-search">Busca</Label>
          <Input
            id="users-search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome ou e-mail..."
            className="mt-1.5 rounded-2xl"
          />
        </div>
        <div>
          <Label htmlFor="users-role-filter">Perfil</Label>
          <Select
            id="users-role-filter"
            value={roleFilter}
            onValueChange={setRoleFilter}
            options={ROLE_FILTER_OPTIONS}
            className="mt-1.5"
          />
        </div>
      </div>

      <p className="mb-4 text-sm text-zinc-500">
        {loading ? "Carregando usuários..." : `${filteredUsers.length} usuários encontrados nesta página`}
      </p>

      {loading ? (
        <div className="rounded-2xl border border-zinc-200 bg-white px-6 py-14 text-center text-sm text-zinc-600">
          Carregando lista de usuários...
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 px-6 py-14 text-center text-sm text-zinc-600">
          Nenhum usuário encontrado com os filtros atuais.
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {filteredUsers.map((user) => {
            const isLoadingRow = loadingDetailId === user.id;
            return (
              <li key={user.id} className="rounded-2xl border border-zinc-200 bg-white p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="text-base font-semibold text-zinc-900">{user.nome}</p>
                    <p className="text-sm text-zinc-500">{user.email}</p>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <Badge variant={roleBadgeVariant(user.role)} size="sm" className="normal-case">
                    {roleLabel(user.role)}
                  </Badge>
                  <span className="text-xs text-zinc-500">{user.cidade}</span>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    className="rounded-full"
                    onClick={() => void openDetail(user.id)}
                    loading={isLoadingRow}
                    disabled={isLoadingRow}
                  >
                    Ver detalhes
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    className="rounded-full"
                    onClick={() => void openEdit(user.id)}
                    loading={isLoadingRow}
                    disabled={isLoadingRow}
                  >
                    Editar
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} className="mt-6" />

      <Sheet open={detailUser !== null} onClose={() => setDetailUser(null)} side="right">
        <SheetContent className="max-w-[min(100vw-1rem,440px)] !w-full" onClose={() => setDetailUser(null)}>
          <SheetHeader>
            <SheetTitle>Detalhes do usuário</SheetTitle>
            <SheetDescription>Informações completas do cadastro.</SheetDescription>
          </SheetHeader>
          {detailUser ? (
            <div className="mt-5 space-y-3">
              <InfoRow label="Nome" value={detailUser.nomeCompleto} />
              <InfoRow label="E-mail" value={detailUser.email} />
              <InfoRow label="Perfil" value={roleLabel(detailUser.role)} />
              <InfoRow label="Telefone" value={String(detailUser.telefone ?? "").trim() || "Não informado"} />
              <InfoRow label="Cidade" value={String(detailUser.cidade ?? "").trim() || "Não informado"} />
              <InfoRow label="Estado" value={String(detailUser.estado ?? "").trim() || "Não informado"} />
              <InfoRow label="CPF" value={String(detailUser.cpf ?? "").trim() || "Não informado"} />
              <InfoRow label="Criado em" value={detailUser.createdAt ? new Date(detailUser.createdAt).toLocaleString("pt-BR") : "-"} />
            </div>
          ) : null}
        </SheetContent>
      </Sheet>

      <Sheet open={editDraft !== null} onClose={() => setEditDraft(null)} side="right">
        <SheetContent className="max-w-[min(100vw-1rem,440px)] !w-full" onClose={() => setEditDraft(null)}>
          <SheetHeader>
            <SheetTitle>Editar usuário</SheetTitle>
            <SheetDescription>Atualize os dados do usuário.</SheetDescription>
          </SheetHeader>
          {editDraft ? (
            <form
              className="mt-5 space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                void saveEdit();
              }}
            >
              <div>
                <Label htmlFor="edit-user-name">Nome</Label>
                <Input
                  id="edit-user-name"
                  value={editDraft.nomeCompleto}
                  onChange={(e) =>
                    setEditDraft((prev) => (prev ? { ...prev, nomeCompleto: e.target.value } : prev))
                  }
                  className="mt-1.5 rounded-2xl"
                />
              </div>
              <div>
                <Label htmlFor="edit-user-email">E-mail</Label>
                <Input
                  id="edit-user-email"
                  type="email"
                  value={editDraft.email}
                  onChange={(e) =>
                    setEditDraft((prev) => (prev ? { ...prev, email: e.target.value } : prev))
                  }
                  className="mt-1.5 rounded-2xl"
                />
              </div>
              <div>
                <Label htmlFor="edit-user-phone">Telefone</Label>
                <Input
                  id="edit-user-phone"
                  value={editDraft.telefone ?? ""}
                  onChange={(e) =>
                    setEditDraft((prev) => (prev ? { ...prev, telefone: e.target.value } : prev))
                  }
                  className="mt-1.5 rounded-2xl"
                />
              </div>
              <div>
                <Label htmlFor="edit-user-city">Cidade</Label>
                <Input
                  id="edit-user-city"
                  value={editDraft.cidade ?? ""}
                  onChange={(e) =>
                    setEditDraft((prev) => (prev ? { ...prev, cidade: e.target.value } : prev))
                  }
                  className="mt-1.5 rounded-2xl"
                />
              </div>
              <div>
                <Label htmlFor="edit-user-state">Estado</Label>
                <Input
                  id="edit-user-state"
                  value={editDraft.estado ?? ""}
                  onChange={(e) =>
                    setEditDraft((prev) => (prev ? { ...prev, estado: e.target.value } : prev))
                  }
                  className="mt-1.5 rounded-2xl"
                />
              </div>
              <div>
                <Label htmlFor="edit-user-role">Perfil</Label>
                <Select
                  id="edit-user-role"
                  value={String(editDraft.role)}
                  onValueChange={(value) =>
                    setEditDraft((prev) => (prev ? { ...prev, role: value as AdminUsuarioRoleApi } : prev))
                  }
                  options={ROLE_FILTER_OPTIONS.filter((option) => option.value !== "todos")}
                  className="mt-1.5"
                />
              </div>
              <div className="pt-2 flex flex-col gap-2 sm:flex-row sm:justify-end">
                <Button type="button" variant="secondary" className="rounded-full" onClick={() => setEditDraft(null)} disabled={savingEdit}>
                  Cancelar
                </Button>
                <Button type="submit" className="rounded-full" loading={savingEdit} disabled={savingEdit}>
                  Salvar alterações
                </Button>
              </div>
            </form>
          ) : null}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-zinc-50 px-3.5 py-3 ring-1 ring-zinc-100">
      <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-zinc-500">{label}</p>
      <p className="mt-1.5 text-sm font-medium text-zinc-900">{value}</p>
    </div>
  );
}
