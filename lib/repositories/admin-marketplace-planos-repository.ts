import { apiFetch } from "@/lib/api/api-fetch";
import type {
  AtualizarPlanoMarketplaceRequest,
  FaturaPlanoResponse,
  PlanoAnuncioResponse,
} from "@/lib/repositories/types/marketplace-planos.types";

export async function listarPlanosAdminMarketplace(): Promise<PlanoAnuncioResponse[]> {
  return apiFetch<PlanoAnuncioResponse[]>("/admin/marketplace/planos", { method: "GET" });
}

export async function atualizarPlanoAdminMarketplace(
  planoId: string,
  body: AtualizarPlanoMarketplaceRequest
): Promise<PlanoAnuncioResponse> {
  return apiFetch<PlanoAnuncioResponse>(`/admin/marketplace/planos/${encodeURIComponent(planoId)}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export async function listarFaturamentoAdminMarketplace(params?: {
  vendedorId?: string;
}): Promise<FaturaPlanoResponse[]> {
  const qs = new URLSearchParams();
  const vendedorId = params?.vendedorId?.trim();
  if (vendedorId) qs.set("vendedorId", vendedorId);
  const suffix = qs.toString();
  return apiFetch<FaturaPlanoResponse[]>(`/admin/marketplace/faturamento${suffix ? `?${suffix}` : ""}`, {
    method: "GET",
  });
}
