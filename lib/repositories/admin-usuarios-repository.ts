import { apiFetch } from "@/lib/api/api-fetch";
import type {
  AdminUsuarioListResponse,
  AdminUsuarioResponse,
  AdminUsuarioRoleUpdateRequest,
  AdminUsuarioUpdateRequest,
  SpringPage,
} from "@/lib/repositories/types/admin-usuarios.types";

export async function listarUsuariosAdmin(params?: {
  busca?: string;
  page?: number;
  size?: number;
}): Promise<SpringPage<AdminUsuarioListResponse>> {
  const sp = new URLSearchParams();
  const busca = params?.busca?.trim();
  if (busca) sp.set("busca", busca);
  if (params?.page != null) sp.set("page", String(Math.max(0, Math.floor(params.page))));
  if (params?.size != null) sp.set("size", String(Math.max(1, Math.floor(params.size))));
  const q = sp.toString();
  return apiFetch<SpringPage<AdminUsuarioListResponse>>(`/admin/usuarios${q ? `?${q}` : ""}`, {
    method: "GET",
  });
}

export async function buscarUsuarioAdminPorId(id: string): Promise<AdminUsuarioResponse> {
  return apiFetch<AdminUsuarioResponse>(`/admin/usuarios/${encodeURIComponent(id)}`, {
    method: "GET",
  });
}

export async function editarUsuarioAdminParcial(
  id: string,
  body: AdminUsuarioUpdateRequest
): Promise<AdminUsuarioResponse> {
  return apiFetch<AdminUsuarioResponse>(`/admin/usuarios/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export async function alterarCargoUsuarioAdmin(
  id: string,
  body: AdminUsuarioRoleUpdateRequest
): Promise<AdminUsuarioResponse> {
  return apiFetch<AdminUsuarioResponse>(`/admin/usuarios/${encodeURIComponent(id)}/cargo`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}
