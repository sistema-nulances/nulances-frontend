import { apiFetch } from "@/lib/api/api-fetch";
import type {
  BannerAdminResponse,
  BannerCreateRequest,
  BannerPublicResponse,
  BannerUpdateRequest,
  BannerUploadRequest,
  BannerUploadResponse,
} from "@/lib/repositories/types/banner.types";

export async function gerarUploadUrlBannerAdmin(body: BannerUploadRequest): Promise<BannerUploadResponse> {
  return apiFetch<BannerUploadResponse>("/admin/banners/upload-url", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function criarBannerAdmin(body: BannerCreateRequest): Promise<BannerAdminResponse> {
  return apiFetch<BannerAdminResponse>("/admin/banners", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function listarBannersAdmin(): Promise<BannerAdminResponse[]> {
  return apiFetch<BannerAdminResponse[]>("/admin/banners", { method: "GET" });
}

export async function editarBannerAdmin(id: string, body: BannerUpdateRequest): Promise<BannerAdminResponse> {
  return apiFetch<BannerAdminResponse>(`/admin/banners/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

export async function excluirBannerAdmin(id: string): Promise<void> {
  await apiFetch<unknown>(`/admin/banners/${encodeURIComponent(id)}`, { method: "DELETE" });
}

export async function listarBannersPublicosPorTipo(tipo: "LEILAO" | "MARKETPLACE"): Promise<BannerPublicResponse[]> {
  return apiFetch<BannerPublicResponse[]>(`/banners?tipo=${encodeURIComponent(tipo)}`, {
    method: "GET",
    skipAuth: true,
  });
}
