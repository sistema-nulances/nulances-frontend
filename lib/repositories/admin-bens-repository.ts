import { apiFetch } from "@/lib/api/api-fetch";
import { mimeFromFile } from "@/lib/repositories/documentos-validacao-repository";
import type {
  BemMidiaResponse,
  BemResumoResponse,
  BemResponse,
  ConfirmarUploadBemMidiaRequest,
  CriarBemRequest,
  EditarBemRequest,
  GerarUploadBemMidiaRequest,
  SpringPage,
  UploadBemMidiaResponse,
} from "@/lib/repositories/types/bem.types";

export type ListarBensParams = {
  busca?: string;
  status?: string;
  page?: number;
  size?: number;
  sort?: string;
};

async function putPresignedUpload(uploadUrl: string, file: File, contentType: string): Promise<void> {
  const res = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": contentType },
    body: file,
  });
  if (!res.ok) {
    throw new Error(`Falha ao enviar arquivo para o armazenamento (${res.status}).`);
  }
}

function qs(params: ListarBensParams): string {
  const sp = new URLSearchParams();
  const page = params.page ?? 0;
  const size = params.size ?? 20;
  sp.set("page", String(page));
  sp.set("size", String(size));
  if (params.busca?.trim()) sp.set("busca", params.busca.trim());
  if (params.status?.trim()) sp.set("status", params.status.trim());
  if (params.sort) sp.set("sort", params.sort);
  const q = sp.toString();
  return q ? `?${q}` : "";
}

export async function listarBensAdmin(params: ListarBensParams = {}): Promise<SpringPage<BemResumoResponse>> {
  return apiFetch<SpringPage<BemResumoResponse>>(`/admin/bens${qs(params)}`, { method: "GET" });
}

export async function buscarBemAdmin(id: string): Promise<BemResponse> {
  return apiFetch<BemResponse>(`/admin/bens/${encodeURIComponent(id)}`, { method: "GET" });
}

export async function criarBemAdmin(body: CriarBemRequest): Promise<BemResponse> {
  return apiFetch<BemResponse>("/admin/bens", { method: "POST", body: JSON.stringify(body) });
}

export async function editarBemAdmin(id: string, body: EditarBemRequest): Promise<BemResponse> {
  return apiFetch<BemResponse>(`/admin/bens/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

export async function excluirBemAdmin(id: string): Promise<void> {
  await apiFetch<unknown>(`/admin/bens/${encodeURIComponent(id)}`, { method: "DELETE" });
}

export async function retirarBemDoLoteAdmin(id: string): Promise<BemResponse> {
  return apiFetch<BemResponse>(`/admin/bens/${encodeURIComponent(id)}/retirar-lote`, { method: "PATCH" });
}

export async function gerarUploadUrlBemMidia(
  bemId: string,
  body: GerarUploadBemMidiaRequest
): Promise<UploadBemMidiaResponse> {
  return apiFetch<UploadBemMidiaResponse>(
    `/admin/bens/${encodeURIComponent(bemId)}/midias/upload-url`,
    { method: "POST", body: JSON.stringify(body) }
  );
}

export async function confirmarUploadBemMidia(
  bemId: string,
  body: ConfirmarUploadBemMidiaRequest
): Promise<BemMidiaResponse> {
  return apiFetch<BemMidiaResponse>(`/admin/bens/${encodeURIComponent(bemId)}/midias`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function excluirBemMidiaAdmin(bemId: string, midiaId: string): Promise<void> {
  await apiFetch<unknown>(`/admin/bens/${encodeURIComponent(bemId)}/midias/${encodeURIComponent(midiaId)}`, {
    method: "DELETE",
  });
}

/** Valores do enum `TipoMidiaBem` no backend (FOTO/IMAGEM para imagens, VIDEO para vídeo). */
export const BEM_MIDIA_TIPO_FOTO = "IMAGEM";
export const BEM_MIDIA_TIPO_FOTO_ALT = "IMAGEM";

export const BEM_MIDIA_TIPO_VIDEO = "VIDEO";

export function isMidiaVideoTipo(tipo: string | null | undefined): boolean {
  return (tipo ?? "").toUpperCase() === BEM_MIDIA_TIPO_VIDEO;
}

export function isMidiaFotoTipo(tipo: string | null | undefined): boolean {
  const t = (tipo ?? "").toUpperCase();
  return t === BEM_MIDIA_TIPO_FOTO || t === BEM_MIDIA_TIPO_FOTO_ALT;
}

export async function enviarArquivoBemMidia(
  bemId: string,
  file: File,
  kind: "image" | "video",
  ordem: number
): Promise<BemMidiaResponse> {
  const contentType = file.type || (kind === "image" ? "image/jpeg" : "video/mp4");
  const nomeArquivo =
    file.name && file.name.includes(".")
      ? file.name
      : kind === "image"
        ? "foto.jpg"
        : "video.mp4";
  const tipo = kind === "image" ? BEM_MIDIA_TIPO_FOTO : BEM_MIDIA_TIPO_VIDEO; // alinhar ao enum Java (FOTO / VIDEO)

  const gen = await gerarUploadUrlBemMidia(bemId, { contentType, nomeArquivo, tipo });
  await putPresignedUpload(gen.uploadUrl, file, contentType);
  return confirmarUploadBemMidia(bemId, { objectKey: gen.objectKey, tipo, ordem });
}

export function resolverUrlMidiaBem(m: BemMidiaResponse): string {
  const u = (m.arquivoUrl ?? m.url)?.trim();
  if (u) return u;
  const base = process.env.NEXT_PUBLIC_STORAGE_PUBLIC_URL?.replace(/\/$/, "");
  const key = m.arquivo?.replace(/^\//, "");
  if (base && key) return `${base}/${key}`;
  return "";
}
