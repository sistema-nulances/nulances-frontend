/** Status da verificação de documentos (RG + CPF) para habilitar lances. */
export type KycStatusUsuario = "pendente" | "aprovado" | "recusado";

export type UsuarioDocumentosKyc = {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  cpfMascarado: string;
  dataNascimento: string;
  cidade: string;
  uf: string;
  /** RG — imagem da frente. */
  rgFrenteEnviado: boolean;
  rgFrenteId?: string;
  rgFrenteUrl?: string;
  /** RG — imagem do verso. */
  rgVersoEnviado: boolean;
  rgVersoId?: string;
  rgVersoUrl?: string;
  /** CPF (documento) — frente. */
  cpfFrenteEnviado: boolean;
  cpfFrenteId?: string;
  cpfFrenteUrl?: string;
  /** CPF (documento) — verso. */
  cpfVersoEnviado: boolean;
  cpfVersoId?: string;
  cpfVersoUrl?: string;
  rgStatus?: KycStatusUsuario;
  cnhStatus?: KycStatusUsuario;
  status: KycStatusUsuario;
  enviadoEm: string;
  atualizadoEm: string;
  motivoRecusa?: string;
};

/** Todos os arquivos obrigatórios enviados (RG e CPF, frente e verso). */
export function kycDocumentosCompletos(u: UsuarioDocumentosKyc): boolean {
  return (
    u.rgFrenteEnviado &&
    u.rgVersoEnviado &&
    u.cpfFrenteEnviado &&
    u.cpfVersoEnviado
  );
}

export const USUARIOS_DOCUMENTOS_KYC_SEED: UsuarioDocumentosKyc[] = [
  {
    id: "kyc-001",
    nome: "Mariana Souza Lima",
    email: "mariana.souza@email.com",
    telefone: "(65) 99912-4401",
    cpfMascarado: "***.456.789-**",
    dataNascimento: "14/03/1988",
    cidade: "Cuiabá",
    uf: "MT",
    rgFrenteEnviado: true,
    rgVersoEnviado: true,
    cpfFrenteEnviado: true,
    cpfVersoEnviado: true,
    status: "pendente",
    enviadoEm: "Hoje, 08:42",
    atualizadoEm: "Hoje, 08:42",
  },
  {
    id: "kyc-002",
    nome: "Ricardo Alves",
    email: "ricardo.alves@outlook.com",
    telefone: "(11) 98765-2210",
    cpfMascarado: "***.123.000-**",
    dataNascimento: "02/11/1975",
    cidade: "São Paulo",
    uf: "SP",
    rgFrenteEnviado: true,
    rgVersoEnviado: true,
    cpfFrenteEnviado: true,
    cpfVersoEnviado: true,
    status: "aprovado",
    enviadoEm: "Ontem, 14:20",
    atualizadoEm: "Ontem, 16:05",
  },
  {
    id: "kyc-003",
    nome: "Fernanda Costa",
    email: "fe.costa@gmail.com",
    telefone: "(21) 97654-8899",
    cpfMascarado: "***.987.654-**",
    dataNascimento: "30/01/1992",
    cidade: "Rio de Janeiro",
    uf: "RJ",
    rgFrenteEnviado: true,
    rgVersoEnviado: true,
    cpfFrenteEnviado: true,
    cpfVersoEnviado: true,
    status: "pendente",
    enviadoEm: "Hoje, 11:03",
    atualizadoEm: "Hoje, 11:03",
  },
  {
    id: "kyc-004",
    nome: "Lucas Martins",
    email: "lucas.m@empresa.com.br",
    telefone: "(11) 98877-6655",
    cpfMascarado: "***.111.222-**",
    dataNascimento: "22/07/1991",
    cidade: "São Paulo",
    uf: "SP",
    rgFrenteEnviado: true,
    rgVersoEnviado: true,
    cpfFrenteEnviado: false,
    cpfVersoEnviado: false,
    status: "pendente",
    enviadoEm: "Há 2 dias",
    atualizadoEm: "Há 2 dias",
  },
  {
    id: "kyc-005",
    nome: "Patrícia Nunes",
    email: "patricia.nunes@icloud.com",
    telefone: "(62) 99123-7788",
    cpfMascarado: "***.333.444-**",
    dataNascimento: "09/06/1984",
    cidade: "Goiânia",
    uf: "GO",
    rgFrenteEnviado: true,
    rgVersoEnviado: true,
    cpfFrenteEnviado: true,
    cpfVersoEnviado: true,
    status: "recusado",
    enviadoEm: "10/03/2025",
    atualizadoEm: "11/03/2025",
    motivoRecusa: "Imagem do RG ilegível; enviar foto nítida frente e verso.",
  },
  {
    id: "kyc-006",
    nome: "Eduardo Gomes",
    email: "eduardo.gomes@uol.com.br",
    telefone: "(11) 94567-1122",
    cpfMascarado: "***.555.666-**",
    dataNascimento: "18/12/1980",
    cidade: "Osasco",
    uf: "SP",
    rgFrenteEnviado: true,
    rgVersoEnviado: true,
    cpfFrenteEnviado: true,
    cpfVersoEnviado: true,
    status: "aprovado",
    enviadoEm: "05/03/2025",
    atualizadoEm: "06/03/2025",
  },
  {
    id: "kyc-007",
    nome: "Camila Ribeiro",
    email: "camila.r@yahoo.com.br",
    telefone: "(85) 98800-3344",
    cpfMascarado: "***.777.888-**",
    dataNascimento: "05/04/1995",
    cidade: "Fortaleza",
    uf: "CE",
    rgFrenteEnviado: true,
    rgVersoEnviado: true,
    cpfFrenteEnviado: true,
    cpfVersoEnviado: true,
    status: "pendente",
    enviadoEm: "Há 1 hora",
    atualizadoEm: "Há 1 hora",
  },
  {
    id: "kyc-008",
    nome: "Bruno Henrique Dias",
    email: "bruno.dias@live.com",
    telefone: "(21) 97777-8899",
    cpfMascarado: "***.999.000-**",
    dataNascimento: "11/09/1987",
    cidade: "Niterói",
    uf: "RJ",
    rgFrenteEnviado: true,
    rgVersoEnviado: true,
    cpfFrenteEnviado: true,
    cpfVersoEnviado: true,
    status: "recusado",
    enviadoEm: "08/03/2025",
    atualizadoEm: "09/03/2025",
    motivoRecusa: "CPF não confere com o titular informado no cadastro.",
  },
  {
    id: "kyc-009",
    nome: "Amanda Freitas",
    email: "amanda.f@proton.me",
    telefone: "(61) 99234-5566",
    cpfMascarado: "***.246.135-**",
    dataNascimento: "27/02/1990",
    cidade: "Brasília",
    uf: "DF",
    rgFrenteEnviado: true,
    rgVersoEnviado: true,
    cpfFrenteEnviado: true,
    cpfVersoEnviado: true,
    status: "aprovado",
    enviadoEm: "01/03/2025",
    atualizadoEm: "02/03/2025",
  },
];
