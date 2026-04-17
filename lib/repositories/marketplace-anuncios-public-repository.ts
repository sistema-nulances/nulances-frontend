import { apiFetch } from "@/lib/api/api-fetch";
import type { SpringPage } from "@/lib/repositories/types/admin-anuncios.types";
import type {
  AnuncioPublicoDetalheResponse,
  AnuncioPublicoListResponse,
  ListarAnunciosPublicosRequest,
} from "@/lib/repositories/types/marketplace-public.types";

/**
 * Lista anúncios publicados (público). Sem autenticação.
 * `GET /marketplace/anuncios`
 */
export async function listarAnunciosPublicos(
  params?: ListarAnunciosPublicosRequest
): Promise<SpringPage<AnuncioPublicoListResponse>> {
  const qs = new URLSearchParams();
  const busca = params?.busca?.trim();
  if (busca) qs.set("busca", busca);
  qs.set("page", String(params?.page ?? 0));
  qs.set("size", String(params?.size ?? 24));

  const raw = await apiFetch<unknown>(`/marketplace/anuncios?${qs.toString()}`, {
    method: "GET",
    skipAuth: true,
  });

  const body = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const content = Array.isArray(body.content) ? (body.content as AnuncioPublicoListResponse[]) : [];

  return {
    content,
    totalElements: typeof body.totalElements === "number" ? body.totalElements : content.length,
    totalPages: typeof body.totalPages === "number" ? body.totalPages : content.length ? 1 : 0,
    size: typeof body.size === "number" ? body.size : Number(params?.size ?? 24),
    number: typeof body.number === "number" ? body.number : Number(params?.page ?? 0),
  };
}

/**
 * Busca detalhe de um anúncio publicado (público). Sem autenticação.
 * `GET /marketplace/anuncios/{id}`
 */
export async function buscarAnuncioPublicoPorId(id: string): Promise<AnuncioPublicoDetalheResponse> {
  return apiFetch<AnuncioPublicoDetalheResponse>(`/marketplace/anuncios/${encodeURIComponent(id)}`, {
    method: "GET",
    skipAuth: true,
  });
}
