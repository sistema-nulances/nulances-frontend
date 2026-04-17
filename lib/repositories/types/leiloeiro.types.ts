export type CriarLeiloeiroRequest = {
  nome: string;
  registroProfissional: string;
  cpf: string;
  email: string;
  telefone?: string | null;
  local?: string | null;
};

export type EditarLeiloeiroRequest = {
  nome?: string;
  registroProfissional?: string;
  cpf?: string;
  email?: string;
  telefone?: string | null;
  local?: string | null;
  ativoPlataforma?: boolean;
};

export type LeiloeiroResponse = {
  id: string;
  nome: string;
  registroProfissional: string;
  cpf: string;
  email: string;
  telefone?: string | null;
  ativoPlataforma: boolean;
  local?: string | null;
  totalLeiloes?: number | null;
  createdAt?: string;
  updatedAt?: string;
};

export type LeiloeiroListResponse = {
  id: string;
  nome: string;
  ativoPlataforma: boolean;
  registroProfissional: string;
  cpf: string;
  email: string;
  telefone?: string | null;
  local?: string | null;
  totalLeiloes?: number | null;
};

export type LeiloeiroStatsResponse = {
  totalLeiloeiros: number;
  totalLeiloeirosAtivosPlataforma: number;
  totalLeiloeirosInativosPlataforma: number;
  totalLeiloeirosComLeilaoVinculado: number;
};

/** `GET /admin/leiloeiros/disponibilidade` — alinhado a `LeiloeiroDisponibilidadeResponse` no backend. */
export type LeiloeiroDisponibilidadeResponse = {
  registroDisponivel: boolean;
  cpfDisponivel: boolean;
  emailDisponivel: boolean;
  mensagemRegistro: string | null;
  mensagemCpf: string | null;
  mensagemEmail: string | null;
};
