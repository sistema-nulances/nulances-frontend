"use client";

import * as React from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/ui/page-header";
import { Select, type SelectOption } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";

type UsersScreenScope = "leilao" | "marketplace";
type UserRole = "Administrador" | "Comitente" | "Leiloeiro" | "Vendedor" | "Comprador";

type ManagedUser = {
  id: string;
  nome: string;
  email: string;
  role: UserRole;
  ativo: boolean;
  cidade: string;
  criadoEm: string;
};

const STATUS_FILTER_OPTIONS: SelectOption[] = [
  { value: "todos", label: "Todos os status" },
  { value: "ativos", label: "Ativos" },
  { value: "inativos", label: "Inativos" },
];

const ROLE_FILTER_OPTIONS: SelectOption[] = [
  { value: "todos", label: "Todos os perfis" },
  { value: "Administrador", label: "Administrador" },
  { value: "Comitente", label: "Comitente" },
  { value: "Leiloeiro", label: "Leiloeiro" },
  { value: "Vendedor", label: "Vendedor" },
  { value: "Comprador", label: "Comprador" },
];

const ROLE_EDIT_OPTIONS: SelectOption[] = ROLE_FILTER_OPTIONS.filter((option) => option.value !== "todos");

const MOCK_USERS: ManagedUser[] = [
  { id: "u-001", nome: "Pietro Menezes", email: "pietro@nulances.com", role: "Administrador", ativo: true, cidade: "São Paulo - SP", criadoEm: "03/02/2026" },
  { id: "u-002", nome: "Allianz Seguros", email: "allianz@seguradora.com", role: "Comitente", ativo: true, cidade: "Curitiba - PR", criadoEm: "11/02/2026" },
  { id: "u-003", nome: "João Leilões", email: "joao@leiloes.com", role: "Leiloeiro", ativo: true, cidade: "Goiânia - GO", criadoEm: "19/02/2026" },
  { id: "u-004", nome: "Maria Vendedora", email: "maria@vendas.com", role: "Vendedor", ativo: false, cidade: "Belo Horizonte - MG", criadoEm: "25/02/2026" },
  { id: "u-005", nome: "Carlos Comprador", email: "carlos@email.com", role: "Comprador", ativo: true, cidade: "Brasília - DF", criadoEm: "03/03/2026" },
  { id: "u-006", nome: "Banco Sul", email: "contato@bancosul.com", role: "Comitente", ativo: true, cidade: "Porto Alegre - RS", criadoEm: "08/03/2026" },
  { id: "u-007", nome: "Fernanda Admin", email: "fernanda@nulances.com", role: "Administrador", ativo: true, cidade: "São Paulo - SP", criadoEm: "12/03/2026" },
  { id: "u-008", nome: "Rafael Motors", email: "rafael@motors.com", role: "Vendedor", ativo: true, cidade: "Campinas - SP", criadoEm: "16/03/2026" },
];

function roleBadgeVariant(role: UserRole): "purple" | "emerald" | "amber" | "zinc" {
  if (role === "Administrador") return "purple";
  if (role === "Comitente" || role === "Leiloeiro") return "amber";
  if (role === "Vendedor") return "emerald";
  return "zinc";
}

export function AdminUsersManagementPageContent({ scope = "leilao" }: { scope?: UsersScreenScope }) {
  const [users, setUsers] = React.useState<ManagedUser[]>(MOCK_USERS);
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("todos");
  const [roleFilter, setRoleFilter] = React.useState("todos");

  const [detailUser, setDetailUser] = React.useState<ManagedUser | null>(null);
  const [editDraft, setEditDraft] = React.useState<ManagedUser | null>(null);

  const filteredUsers = React.useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return users.filter((user) => {
      if (statusFilter === "ativos" && !user.ativo) return false;
      if (statusFilter === "inativos" && user.ativo) return false;
      if (roleFilter !== "todos" && user.role !== roleFilter) return false;
      if (!normalizedSearch) return true;

      const haystack = `${user.nome} ${user.email} ${user.role}`.toLowerCase();
      return haystack.includes(normalizedSearch);
    });
  }, [roleFilter, search, statusFilter, users]);

  const toggleUserStatus = React.useCallback((id: string) => {
    setUsers((prev) => prev.map((user) => (user.id === id ? { ...user, ativo: !user.ativo } : user)));
    setDetailUser((prev) => (prev && prev.id === id ? { ...prev, ativo: !prev.ativo } : prev));
    setEditDraft((prev) => (prev && prev.id === id ? { ...prev, ativo: !prev.ativo } : prev));
  }, []);

  const saveEdit = React.useCallback(() => {
    if (!editDraft) return;
    const cleaned = {
      ...editDraft,
      nome: editDraft.nome.trim(),
      email: editDraft.email.trim(),
      cidade: editDraft.cidade.trim(),
    };
    if (!cleaned.nome || !cleaned.email) return;

    setUsers((prev) => prev.map((user) => (user.id === cleaned.id ? cleaned : user)));
    setDetailUser((prev) => (prev && prev.id === cleaned.id ? cleaned : prev));
    setEditDraft(null);
  }, [editDraft]);

  return (
    <div>
      <PageHeader
        title="Gestão de usuários"
        subtitle={
          scope === "marketplace"
            ? "Tela em demonstração para acompanhar e gerenciar os usuários da plataforma."
            : "Tela em demonstração com visão geral dos usuários da plataforma."
        }
      />

      <div className="mb-5 grid grid-cols-1 gap-3 rounded-2xl border border-zinc-200 bg-white p-4 md:grid-cols-3">
        <div className="md:col-span-2">
          <Label htmlFor="users-search">Busca</Label>
          <Input
            id="users-search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome, e-mail ou perfil..."
            className="mt-1.5 rounded-2xl"
          />
        </div>
        <div>
          <Label htmlFor="users-status-filter">Status</Label>
          <Select
            id="users-status-filter"
            value={statusFilter}
            onValueChange={setStatusFilter}
            options={STATUS_FILTER_OPTIONS}
            className="mt-1.5"
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
        {filteredUsers.length} {filteredUsers.length === 1 ? "usuário encontrado" : "usuários encontrados"}
      </p>

      {filteredUsers.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 px-6 py-14 text-center text-sm text-zinc-600">
          Nenhum usuário encontrado com os filtros atuais.
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {filteredUsers.map((user) => (
            <li key={user.id} className="rounded-2xl border border-zinc-200 bg-white p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-base font-semibold text-zinc-900">{user.nome}</p>
                  <p className="text-sm text-zinc-500">{user.email}</p>
                </div>
                <Badge variant={user.ativo ? "emerald" : "zinc"} size="sm" className="normal-case">
                  {user.ativo ? "Ativo" : "Inativo"}
                </Badge>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Badge variant={roleBadgeVariant(user.role)} size="sm" className="normal-case">
                  {user.role}
                </Badge>
                <span className="text-xs text-zinc-500">{user.cidade}</span>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <Button type="button" size="sm" variant="secondary" className="rounded-full" onClick={() => setDetailUser(user)}>
                  Ver detalhes
                </Button>
                <Button type="button" size="sm" variant="secondary" className="rounded-full" onClick={() => setEditDraft(user)}>
                  Editar
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={user.ativo ? "ghost" : "default"}
                  className="rounded-full"
                  onClick={() => toggleUserStatus(user.id)}
                >
                  {user.ativo ? "Inativar" : "Ativar"}
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Sheet open={detailUser !== null} onClose={() => setDetailUser(null)} side="right">
        <SheetContent className="max-w-[min(100vw-1rem,420px)] !w-full" onClose={() => setDetailUser(null)}>
          <SheetHeader>
            <SheetTitle>Detalhes do usuário</SheetTitle>
            <SheetDescription>Visualização rápida dos dados do cadastro.</SheetDescription>
          </SheetHeader>
          {detailUser ? (
            <div className="mt-5 space-y-3">
              <InfoRow label="Nome" value={detailUser.nome} />
              <InfoRow label="E-mail" value={detailUser.email} />
              <InfoRow label="Perfil" value={detailUser.role} />
              <InfoRow label="Status" value={detailUser.ativo ? "Ativo" : "Inativo"} />
              <InfoRow label="Cidade" value={detailUser.cidade} />
              <InfoRow label="Criado em" value={detailUser.criadoEm} />
            </div>
          ) : null}
        </SheetContent>
      </Sheet>

      <Sheet open={editDraft !== null} onClose={() => setEditDraft(null)} side="right">
        <SheetContent className="max-w-[min(100vw-1rem,420px)] !w-full" onClose={() => setEditDraft(null)}>
          <SheetHeader>
            <SheetTitle>Editar usuário</SheetTitle>
            <SheetDescription>Tela em demonstração para edição de cadastro.</SheetDescription>
          </SheetHeader>
          {editDraft ? (
            <form
              className="mt-5 space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                saveEdit();
              }}
            >
              <div>
                <Label htmlFor="edit-user-name">Nome</Label>
                <Input
                  id="edit-user-name"
                  value={editDraft.nome}
                  onChange={(e) => setEditDraft((prev) => (prev ? { ...prev, nome: e.target.value } : prev))}
                  className="mt-1.5 rounded-2xl"
                />
              </div>
              <div>
                <Label htmlFor="edit-user-email">E-mail</Label>
                <Input
                  id="edit-user-email"
                  type="email"
                  value={editDraft.email}
                  onChange={(e) => setEditDraft((prev) => (prev ? { ...prev, email: e.target.value } : prev))}
                  className="mt-1.5 rounded-2xl"
                />
              </div>
              <div>
                <Label htmlFor="edit-user-role">Perfil</Label>
                <Select
                  id="edit-user-role"
                  value={editDraft.role}
                  onValueChange={(value) =>
                    setEditDraft((prev) => (prev ? { ...prev, role: value as UserRole } : prev))
                  }
                  options={ROLE_EDIT_OPTIONS}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="edit-user-city">Cidade</Label>
                <Input
                  id="edit-user-city"
                  value={editDraft.cidade}
                  onChange={(e) => setEditDraft((prev) => (prev ? { ...prev, cidade: e.target.value } : prev))}
                  className="mt-1.5 rounded-2xl"
                />
              </div>
              <div className="flex items-center gap-2.5 rounded-2xl bg-zinc-50 px-3 py-3 ring-1 ring-zinc-100">
                <input
                  id="edit-user-active"
                  type="checkbox"
                  checked={editDraft.ativo}
                  onChange={(e) => setEditDraft((prev) => (prev ? { ...prev, ativo: e.target.checked } : prev))}
                  className="h-4 w-4 rounded border-zinc-300 text-[var(--nulance-purple)] focus:ring-[var(--ring)]"
                />
                <Label htmlFor="edit-user-active" className="mb-0 cursor-pointer text-zinc-800">
                  Ativo na plataforma
                </Label>
              </div>
              <div className="pt-2 flex flex-col gap-2 sm:flex-row sm:justify-end">
                <Button type="button" variant="secondary" className="rounded-full" onClick={() => setEditDraft(null)}>
                  Cancelar
                </Button>
                <Button type="submit" className="rounded-full">
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
