export type LeiloeiroAdminSeed = {
  id: string;
  nome: string;
  /** Registro profissional (ex.: CREF / junta comercial) */
  registro: string;
  documento: string;
  email: string;
  telefone: string;
  localPrincipal: string;
};

export const LEILOEIROS_ADMIN_SEED: LeiloeiroAdminSeed[] = [
  {
    id: "lei-ana",
    nome: "Ana Paula Ferreira",
    registro: "SP-88421-J",
    documento: "123.456.789-01",
    email: "ana.ferreira@leiloes.com.br",
    telefone: "(11) 98877-6655",
    localPrincipal: "São Paulo - SP",
  },
  {
    id: "lei-carlos",
    nome: "Carlos Mendes Oliveira",
    registro: "RJ-55201-J",
    documento: "987.654.321-00",
    email: "cmendes@leiloeiro.br",
    telefone: "(21) 99765-4321",
    localPrincipal: "Rio de Janeiro - RJ",
  },
  {
    id: "lei-juliana",
    nome: "Juliana Costa",
    registro: "MG-44102-J",
    documento: "456.789.123-45",
    email: "juliana.costa@auction.com",
    telefone: "(31) 98844-2211",
    localPrincipal: "Belo Horizonte - MG",
  },
  {
    id: "lei-roberto",
    nome: "Roberto Almeida",
    registro: "DF-22088-J",
    documento: "321.654.987-90",
    email: "r.almeida@leiloesdf.com",
    telefone: "(61) 98112-3344",
    localPrincipal: "Brasília - DF",
  },
  {
    id: "lei-patricia",
    nome: "Patrícia Nunes",
    registro: "RS-77330-J",
    documento: "111.222.333-44",
    email: "patricia.nunes@leiloesrs.com.br",
    telefone: "(51) 99123-7788",
    localPrincipal: "Porto Alegre - RS",
  },
];
