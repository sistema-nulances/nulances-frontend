import { apiFetch } from "@/lib/api/api-fetch";
import type {
  AnuncioStatusResponse,
  AnuncioVendedorListResponse,
  EditarAnuncioRequest,
  AnuncioResponse,
  CriarAnuncioRequest,
  GerarUploadMidiaAnuncioRequest,
  ListarMeusAnunciosRequest,
  SuspenderMeuAnuncioRequest,
  SpringPage,
  UploadMidiaAnuncioResponse,
} from "@/lib/repositories/types/seller-anuncio.types";

export async function gerarUploadMidiaAnuncio(
  body: GerarUploadMidiaAnuncioRequest
): Promise<UploadMidiaAnuncioResponse> {
  return apiFetch<UploadMidiaAnuncioResponse>("/marketplace/anuncios/midias/upload-url", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function criarAnuncioVendedor(body: CriarAnuncioRequest): Promise<AnuncioResponse> {
  return apiFetch<AnuncioResponse>("/marketplace/anuncios", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function listarMeusAnunciosVendedor(
  params?: ListarMeusAnunciosRequest
): Promise<SpringPage<AnuncioVendedorListResponse>> {
  const qs = new URLSearchParams();
  const busca = params?.busca?.trim();
  if (busca) qs.set("busca", busca);
  const status = params?.status?.trim();
  if (status) qs.set("status", status);
  qs.set("page", String(params?.page ?? 0));
  qs.set("size", String(params?.size ?? 60));
  const query = qs.toString();

  return apiFetch<SpringPage<AnuncioVendedorListResponse>>(`/marketplace/anuncios/meus?${query}`, {
    method: "GET",
  });
}

export async function buscarMeuAnuncioPorIdVendedor(id: string): Promise<AnuncioResponse> {
  return apiFetch<AnuncioResponse>(`/marketplace/anuncios/meus/${encodeURIComponent(id)}`, {
    method: "GET",
  });
}

export async function editarParcialMeuAnuncioVendedor(
  id: string,
  body: EditarAnuncioRequest
): Promise<AnuncioResponse> {
  return apiFetch<AnuncioResponse>(`/marketplace/anuncios/meus/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export async function suspenderMeuAnuncioVendedor(
  id: string,
  body?: SuspenderMeuAnuncioRequest
): Promise<AnuncioStatusResponse> {
  return apiFetch<AnuncioStatusResponse>(`/marketplace/anuncios/meus/${encodeURIComponent(id)}/suspender`, {
    method: "PATCH",
    body: JSON.stringify(body ?? {}),
  });
}

export async function excluirMeuAnuncioVendedor(id: string): Promise<void> {
  await apiFetch<void>(`/marketplace/anuncios/meus/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}
