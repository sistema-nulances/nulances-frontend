import { apiFetch } from "@/lib/api/api-fetch";
import { getApiErrorMessage } from "@/lib/api/error-body";
import { ApiError } from "@/lib/repositories/types/auth.types";
import type {
  GerarUploadDocumentoVendedorRequest,
  SolicitacaoVendedorResponse,
  SolicitarAcessoVendedorRequest,
  TipoDocumentoSolicitacaoVendedorApi,
  UploadDocumentoVendedorResponse,
} from "@/lib/repositories/types/solicitacao-vendedor.types";

function mimeFromFile(file: File): string {
  if (file.type && file.type.trim().length > 0) return file.type;
  const name = file.name.toLowerCase();
  if (name.endsWith(".jpg") || name.endsWith(".jpeg")) return "image/jpeg";
  if (name.endsWith(".png")) return "image/png";
  if (name.endsWith(".webp")) return "image/webp";
  if (name.endsWith(".pdf")) return "application/pdf";
  return "application/octet-stream";
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

export async function gerarUploadUrlDocumentoVendedor(
  body: GerarUploadDocumentoVendedorRequest,
  token?: string | null
): Promise<UploadDocumentoVendedorResponse> {
  return apiFetch<UploadDocumentoVendedorResponse>("/marketplace/vendedor/documentos/upload-url", {
    method: "POST",
    body: JSON.stringify(body),
    token: token ?? undefined,
  });
}

export async function enviarArquivoDocumentoSolicitacaoVendedor(
  file: File,
  tipoDocumento: TipoDocumentoSolicitacaoVendedorApi,
  token?: string | null
): Promise<string> {
  const contentType = mimeFromFile(file);
  const nomeArquivo =
    file.name && file.name.includes(".")
      ? file.name
      : `${tipoDocumento.toLowerCase()}-${Date.now()}`;
  const generated = await gerarUploadUrlDocumentoVendedor(
    { contentType, nomeArquivo, tipoDocumento },
    token
  );
  await putPresignedUpload(generated.uploadUrl, file, contentType);
  return generated.objectKey;
}

export async function solicitarAcessoVendedor(
  body: SolicitarAcessoVendedorRequest,
  token?: string | null
): Promise<SolicitacaoVendedorResponse> {
  return apiFetch<SolicitacaoVendedorResponse>("/marketplace/vendedor/solicitar", {
    method: "POST",
    body: JSON.stringify(body),
    token: token ?? undefined,
  });
}

export async function buscarMinhaSolicitacaoVendedor(
  token?: string | null
): Promise<SolicitacaoVendedorResponse> {
  return apiFetch<SolicitacaoVendedorResponse>("/marketplace/vendedor/minha-solicitacao", {
    method: "GET",
    token: token ?? undefined,
  });
}

export async function buscarMinhaSolicitacaoVendedorSafe(
  token?: string | null
): Promise<SolicitacaoVendedorResponse | null> {
  try {
    return await buscarMinhaSolicitacaoVendedor(token);
  } catch (error) {
    if (!(error instanceof ApiError)) throw error;
    const message = (getApiErrorMessage(error.body) ?? error.message ?? "").toLowerCase();
    const notFoundByMessage =
      message.includes("solicita") && (message.includes("não encontrada") || message.includes("nao encontrada"));
    if (error.status === 404 || error.status === 400 || notFoundByMessage) {
      return null;
    }
    throw error;
  }
}
