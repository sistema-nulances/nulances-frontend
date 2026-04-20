export type AdminUsuarioRoleApi =
  | "ADMIN"
  | "VENDEDOR"
  | "COMPRADOR"
  | (string & {});

export type AdminUsuarioListResponse = {
  id: string;
  nomeCompleto: string;
  email: string;
  cidade?: string | null;
  role: AdminUsuarioRoleApi;
  telefone?: string | null;
};

export type AdminUsuarioResponse = {
  id: string;
  nomeCompleto: string;
  dataNascimento?: string | null;
  email: string;
  cpf?: string | null;
  telefone?: string | null;
  fotoPerfil?: string | null;
  cep?: string | null;
  logradouro?: string | null;
  cidade?: string | null;
  estado?: string | null;
  emailVerificado?: boolean | null;
  emailVerificadoEm?: string | null;
  role: AdminUsuarioRoleApi;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export type AdminUsuarioUpdateRequest = {
  nomeCompleto?: string;
  dataNascimento?: string | null;
  email?: string;
  cpf?: string;
  telefone?: string;
  fotoPerfil?: string;
  cep?: string;
  logradouro?: string;
  cidade?: string;
  estado?: string;
  emailVerificado?: boolean;
};

export type AdminUsuarioRoleUpdateRequest = {
  role: AdminUsuarioRoleApi;
};

export type SpringPage<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
};
