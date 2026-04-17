import { apiFetch } from "@/lib/api/api-fetch";
import { extractAccessTokenFromLoginBody } from "@/lib/auth-token-utils";
import type {
  AlterarSenhaRequest,
  AtualizarPerfilRequest,
  ConfirmarEmailRequest,
  DisponibilidadeCadastroResponse,
  ForgotPasswordRequest,
  GerarUploadFotoPerfilRequest,
  LoginRequest,
  LoginResponse,
  MeResponse,
  ResetPasswordRequest,
  RegisterRequest,
  UploadFotoPerfilResponse,
  VerificarCodigoRecuperacaoRequest,
} from "@/lib/repositories/types/auth.types";

export async function login(body: LoginRequest): Promise<{ token: string; raw: LoginResponse }> {
  const raw = await apiFetch<LoginResponse>("/auth/login", {
    method: "POST",
    skipAuth: true,
    body: JSON.stringify(body),
  });
  const token = extractAccessTokenFromLoginBody(raw);
  if (!token) {
    throw new Error("Resposta de login sem token. Verifique o contrato da API.");
  }
  return { token, raw };
}

export async function register(body: RegisterRequest): Promise<void> {
  await apiFetch<unknown>("/auth/register", {
    method: "POST",
    skipAuth: true,
    body: JSON.stringify(body),
  });
}

/** `GET /auth/disponibilidade?email=&cpf=&telefone=` — parâmetros opcionais. */
export async function verificarDisponibilidadeCadastro(params: {
  email?: string;
  cpfSomenteDigitos?: string;
  telefoneSomenteDigitos?: string;
}): Promise<DisponibilidadeCadastroResponse> {
  const sp = new URLSearchParams();
  const em = params.email?.trim().toLowerCase();
  if (em) sp.set("email", em);
  const cpf = params.cpfSomenteDigitos?.replace(/\D/g, "") ?? "";
  if (cpf.length === 11) sp.set("cpf", cpf);
  const telefone = params.telefoneSomenteDigitos?.replace(/\D/g, "") ?? "";
  if (telefone.length >= 10) sp.set("telefone", telefone);
  const q = sp.toString();
  const path = q ? `/auth/disponibilidade?${q}` : "/auth/disponibilidade";
  return apiFetch<DisponibilidadeCadastroResponse>(path, {
    method: "GET",
    skipAuth: true,
  });
}

export async function confirmarEmail(body: ConfirmarEmailRequest): Promise<void> {
  await apiFetch<unknown>("/auth/confirmar-email", {
    method: "POST",
    skipAuth: true,
    body: JSON.stringify(body),
  });
}

export async function forgotPassword(body: ForgotPasswordRequest): Promise<void> {
  await apiFetch<unknown>("/auth/forgot-password", {
    method: "POST",
    skipAuth: true,
    body: JSON.stringify(body),
  });
}

export async function verificarCodigoRecuperacao(body: VerificarCodigoRecuperacaoRequest): Promise<void> {
  await apiFetch<unknown>("/auth/verificar-codigo-recuperacao", {
    method: "POST",
    skipAuth: true,
    body: JSON.stringify(body),
  });
}

export async function resetPassword(body: ResetPasswordRequest): Promise<void> {
  await apiFetch<unknown>("/auth/reset-password", {
    method: "POST",
    skipAuth: true,
    body: JSON.stringify(body),
  });
}

export async function fetchMe(token?: string | null): Promise<MeResponse> {
  return apiFetch<MeResponse>("/auth/me", {
    method: "GET",
    token: token ?? undefined,
  });
}

export async function atualizarPerfil(
  body: AtualizarPerfilRequest,
  token?: string | null
): Promise<void> {
  await apiFetch<unknown>("/auth/me/perfil", {
    method: "PUT",
    body: JSON.stringify(body),
    token: token ?? undefined,
  });
}

/** Troca senha do usuário autenticado (`Authorization: Bearer` via cookie ou `token`). */
export async function atualizarSenha(body: AlterarSenhaRequest, token?: string | null): Promise<void> {
  await apiFetch<unknown>("/auth/me/senha", {
    method: "PATCH",
    body: JSON.stringify(body),
    token: token ?? undefined,
  });
}

function mimeFromImage(file: File): string {
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
    throw new Error(`Falha ao enviar foto para o armazenamento (${res.status}).`);
  }
}

/** Gera URL pré-assinada para foto de perfil do usuário autenticado. */
export async function gerarUploadUrlFotoPerfilAutenticado(
  body: GerarUploadFotoPerfilRequest,
  token?: string | null
): Promise<UploadFotoPerfilResponse> {
  return apiFetch<UploadFotoPerfilResponse>("/auth/me/foto-perfil/upload-url", {
    method: "POST",
    body: JSON.stringify(body),
    token: token ?? undefined,
  });
}

/**
 * Fluxo completo da foto: solicita URL assinada, envia arquivo ao R2 e retorna `objectKey`.
 * A confirmação final é feita ao chamar `atualizarPerfil({ fotoPerfil: objectKey })`.
 */
export async function enviarFotoPerfilAutenticado(file: File, token?: string | null): Promise<string> {
  const contentType = mimeFromImage(file);
  const nomeArquivo =
    file.name && file.name.includes(".") ? file.name : `foto-perfil-${Date.now()}.jpg`;
  const gen = await gerarUploadUrlFotoPerfilAutenticado({ contentType, nomeArquivo }, token);
  await putPresignedUpload(gen.uploadUrl, file, contentType);
  return gen.objectKey;
}
