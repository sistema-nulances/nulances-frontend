import { apiFetch } from "@/lib/api/api-fetch";
import type {
  ConfirmarUploadDocumentoValidacaoRequest,
  DocumentoValidacaoResponse,
  GerarUploadDocumentoValidacaoRequest,
  UploadDocumentoValidacaoResponse,
} from "@/lib/repositories/types/auth.types";

export type AdminDocumentoValidacaoStatus = "PENDENTE" | "APROVADO" | "RECUSADO";
export type AdminDocumentoValidacaoPatchStatus = "APROVADO" | "RECUSADO";

export type AdminDocumentoValidacaoResponse = DocumentoValidacaoResponse & {
  usuarioId?: string;
  nomeCompleto?: string;
  email?: string;
  cpf?: string;
};

function mimeFromFile(file: File): string {
  if (file.type && file.type.startsWith("image/")) return file.type;
  const n = file.name.toLowerCase();
  if (n.endsWith(".jpg") || n.endsWith(".jpeg")) return "image/jpeg";
  if (n.endsWith(".png")) return "image/png";
  if (n.endsWith(".webp")) return "image/webp";
  return "image/jpeg";
}

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

/** Gera URL assinada (requer Bearer). */
export async function gerarUrlUploadDocumentoValidacao(
  body: GerarUploadDocumentoValidacaoRequest,
  token?: string | null
): Promise<UploadDocumentoValidacaoResponse> {
  return apiFetch<UploadDocumentoValidacaoResponse>("/documentos-validacao/upload-url", {
    method: "POST",
    body: JSON.stringify(body),
    token: token ?? undefined,
  });
}

/** Registra o upload após PUT no R2 (requer Bearer). */
export async function confirmarUploadDocumentoValidacao(
  body: ConfirmarUploadDocumentoValidacaoRequest,
  token?: string | null
): Promise<DocumentoValidacaoResponse> {
  return apiFetch<DocumentoValidacaoResponse>("/documentos-validacao", {
    method: "POST",
    body: JSON.stringify(body),
    token: token ?? undefined,
  });
}

export async function listarMeusDocumentosValidacao(token?: string | null): Promise<DocumentoValidacaoResponse[]> {
  return apiFetch<DocumentoValidacaoResponse[]>("/documentos-validacao/me", {
    method: "GET",
    token: token ?? undefined,
  });
}

/** Admin: lista documentos de validação com filtro opcional por status. */
export async function listarDocumentosValidacaoAdmin(
  status?: AdminDocumentoValidacaoStatus,
  token?: string | null
): Promise<AdminDocumentoValidacaoResponse[]> {
  const qs = new URLSearchParams();
  if (status) qs.set("status", status);
  const query = qs.toString();
  const path = query ? `/admin/documentos-validacao?${query}` : "/admin/documentos-validacao";
  return apiFetch<AdminDocumentoValidacaoResponse[]>(path, {
    method: "GET",
    token: token ?? undefined,
  });
}

/** Admin: atualiza status de um documento específico. */
export async function atualizarStatusDocumentoValidacaoAdmin(
  documentoId: string,
  status: AdminDocumentoValidacaoPatchStatus,
  token?: string | null
): Promise<AdminDocumentoValidacaoResponse> {
  return apiFetch<AdminDocumentoValidacaoResponse>(`/admin/documentos-validacao/${encodeURIComponent(documentoId)}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
    token: token ?? undefined,
  });
}

/**
 * Fluxo completo: URL pré-assinada → PUT do arquivo → confirmar com objectKey.
 */
export async function enviarArquivoDocumentoValidacao(
  file: File,
  tipo: string,
  token?: string | null
): Promise<DocumentoValidacaoResponse> {
  const contentType = mimeFromFile(file);
  const nomeArquivo =
    file.name && file.name.includes(".") ? file.name : `${tipo.toLowerCase()}.jpg`;

  const gen = await gerarUrlUploadDocumentoValidacao(
    { contentType, nomeArquivo, tipo },
    token
  );
  await putPresignedUpload(gen.uploadUrl, file, contentType);
  return confirmarUploadDocumentoValidacao({ objectKey: gen.objectKey, tipo }, token);
}

export { mimeFromFile };
