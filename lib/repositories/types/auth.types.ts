/**
 * Alinhado ao enum `UserRole` do backend (ajuste se os nomes divergirem).
 */
export type AppUserRole = "ADMIN" | "VENDEDOR" | "COMPRADOR" | (string & {});

/** Alinhado a `StatusDocumentoValidacao` no backend. */
export type StatusDocumentoValidacao = "PENDENTE" | "APROVADO" | "REJEITADO" | (string & {});

/** Alinhado a `DocumentoValidacaoResponse` e `GET /documentos-validacao/me`. */
export type DocumentoValidacaoResponse = {
  id?: string;
  tipo?: string;
  arquivo?: string;
  arquivoUrl?: string;
  status?: StatusDocumentoValidacao;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
};

export type DocumentoVendedorResponse = {
  id?: string;
  tipo?: string;
  status?: string;
  [key: string]: unknown;
};

/** Resposta de `GET /auth/me` — espelha `MeResponse` Java. */
export type MeResponse = {
  id: string;
  nomeCompleto: string;
  email: string;
  telefone: string;
  fotoPerfil: string;
  cpf: string;
  cep: string;
  logradouro: string;
  cidade: string;
  estado: string;
  emailVerificado: boolean;
  emailVerificadoEm: string | null;
  role: AppUserRole;
  createdAt: string;
  updatedAt: string;
  documentosValidacao: DocumentoValidacaoResponse[];
  documentosVendedor: DocumentoVendedorResponse[];
};

export type LoginRequest = {
  email: string;
  senha: string;
};

export type RegisterRequest = {
  nomeCompleto: string;
  cpf: string;
  dataNascimento: string;
  email: string;
  senha: string;
};

/** Resposta de `GET /auth/disponibilidade` — alinhada a `DisponibilidadeCadastroResponse` no backend. */
export type DisponibilidadeCadastroResponse = {
  emailDisponivel: boolean;
  cpfDisponivel: boolean;
  telefoneDisponivel?: boolean;
  mensagemEmail: string | null;
  mensagemCpf: string | null;
  mensagemTelefone?: string | null;
};

export type ConfirmarEmailRequest = {
  email: string;
  codigo: string;
};

export type ReenviarCodigoRequest = {
  email: string;
};

export type ForgotPasswordRequest = {
  email: string;
};

export type VerificarCodigoRecuperacaoRequest = {
  email: string;
  codigo: string;
};

export type ResetPasswordRequest = {
  email: string;
  codigo: string;
  novaSenha: string;
  confirmarNovaSenha: string;
};

/** Corpo de `PATCH /auth/me/perfil` — alinhado a `AtualizarPerfilRequest` no backend. */
export type AtualizarPerfilRequest = {
  telefone?: string;
  fotoPerfil?: string;
  cep?: string;
  logradouro?: string;
  cidade?: string;
  estado?: string;
};

/** Corpo de `PATCH /auth/me/senha`. */
export type AlterarSenhaRequest = {
  senhaAtual: string;
  novaSenha: string;
  confirmarNovaSenha: string;
};

/** `POST /auth/me/foto-perfil/upload-url` */
export type GerarUploadFotoPerfilRequest = {
  contentType: string;
  nomeArquivo: string;
};

/** Corpo típico de login Spring — aceita variações de nome do campo token. */
export type LoginResponse = {
  accessToken?: string;
  token?: string;
  access_token?: string;
  tipo?: string;
  tokenType?: string;
  /** Segundos até expirar o access token (ex.: `LoginResponse.expiresIn` no backend). */
  expiresIn?: number;
  refreshToken?: string;
  [key: string]: unknown;
};

/** `POST /documentos-validacao/upload-url` */
export type GerarUploadDocumentoValidacaoRequest = {
  contentType: string;
  nomeArquivo: string;
  /** Nome do enum `TipoDocumentoValidacao` (ex.: RG_FRENTE). */
  tipo: string;
};

export type UploadDocumentoValidacaoResponse = {
  objectKey: string;
  uploadUrl: string;
  expiresInSeconds: number;
};

export type UploadFotoPerfilResponse = {
  objectKey: string;
  uploadUrl: string;
  expiresInSeconds: number;
};

/** `POST /documentos-validacao` */
export type ConfirmarUploadDocumentoValidacaoRequest = {
  objectKey: string;
  tipo: string;
};

export class ApiError extends Error {
  readonly status: number;
  readonly body?: unknown;

  constructor(message: string, status: number, body?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}
