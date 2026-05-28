import { apiFetch } from "@/lib/api/api-fetch";
import type {
  AdminMarketplaceSolicitacaoPendenteDetalheResponse,
  AdminMarketplaceVendedorListItemResponse,
  RecusarSolicitacaoVendedorRequest,
  StatusContaMarketplaceAdminApi,
} from "@/lib/repositories/types/admin-marketplace-vendedores.types";
import type {
  AssinaturaPlanoAtualResponse,
  PlanoAnuncioResponse,
} from "@/lib/repositories/types/marketplace-planos.types";

export async function listarAdminMarketplaceVendedores(params?: {
  status?: StatusContaMarketplaceAdminApi;
  search?: string;
}): Promise<AdminMarketplaceVendedorListItemResponse[]> {
  const qs = new URLSearchParams();
  const status = params?.status?.trim() || "TODOS";
  qs.set("status", status);
  const search = params?.search?.trim();
  if (search) qs.set("search", search);
  const query = qs.toString();
  const path =
    query.length > 0 ? `/admin/marketplace/vendedores?${query}` : `/admin/marketplace/vendedores`;
  return apiFetch<AdminMarketplaceVendedorListItemResponse[]>(path, { method: "GET" });
}

export async function buscarDetalhePendenteAdminMarketplaceVendedor(
  solicitacaoId: string,
  token?: string | null
): Promise<AdminMarketplaceSolicitacaoPendenteDetalheResponse> {
  return apiFetch<AdminMarketplaceSolicitacaoPendenteDetalheResponse>(
    `/admin/marketplace/vendedores/pendentes/${encodeURIComponent(solicitacaoId)}`,
    {
      method: "GET",
      token: token ?? undefined,
    }
  );
}

export async function aprovarSolicitacaoPendenteAdminMarketplaceVendedor(
  solicitacaoId: string,
  token?: string | null
): Promise<void> {
  await apiFetch<unknown>(
    `/admin/marketplace/vendedores/pendentes/${encodeURIComponent(solicitacaoId)}/aprovar`,
    {
      method: "PATCH",
      token: token ?? undefined,
    }
  );
}

export async function recusarSolicitacaoPendenteAdminMarketplaceVendedor(
  solicitacaoId: string,
  body: RecusarSolicitacaoVendedorRequest,
  token?: string | null
): Promise<void> {
  await apiFetch<unknown>(
    `/admin/marketplace/vendedores/pendentes/${encodeURIComponent(solicitacaoId)}/recusar`,
    {
      method: "PATCH",
      body: JSON.stringify(body),
      token: token ?? undefined,
    }
  );
}

export async function revogarCargoVendedorAdminMarketplace(
  usuarioId: string,
  token?: string | null
): Promise<void> {
  await apiFetch<unknown>(`/admin/marketplace/vendedores/${encodeURIComponent(usuarioId)}/revogar`, {
    method: "PATCH",
    token: token ?? undefined,
  });
}

export async function buscarAssinaturaVendedorAdmin(
  usuarioId: string
): Promise<AssinaturaPlanoAtualResponse | null> {
  return apiFetch<AssinaturaPlanoAtualResponse | null>(
    `/admin/marketplace/vendedores/${encodeURIComponent(usuarioId)}/assinatura`,
    { method: "GET" }
  );
}

export async function atribuirPlanoVendedorAdmin(
  usuarioId: string,
  body: { planoId: string }
): Promise<AssinaturaPlanoAtualResponse> {
  return apiFetch<AssinaturaPlanoAtualResponse>(
    `/admin/marketplace/vendedores/${encodeURIComponent(usuarioId)}/assinatura`,
    {
      method: "PATCH",
      body: JSON.stringify(body),
    }
  );
}

