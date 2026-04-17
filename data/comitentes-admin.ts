export type ComitenteAdminTipo = "Banco" | "Seguradora" | "Empresa" | "Pessoa Física";

export type ComitenteAdminSeed = {
  id: string;
  nome: string;
  tipo: ComitenteAdminTipo;
  /** CNPJ / doc ilustrativo */
  documento: string;
  localPrincipal: string;
};

export const COMITENTES_ADMIN_SEED: ComitenteAdminSeed[] = [
  {
    id: "cmt-santander",
    nome: "Banco Santander",
    tipo: "Banco",
    documento: "90.400.888/0001-42",
    localPrincipal: "São Paulo - SP",
  },
  {
    id: "cmt-porto",
    nome: "Porto Seguro",
    tipo: "Seguradora",
    documento: "61.198.164/0001-60",
    localPrincipal: "São Paulo - SP",
  },
  {
    id: "cmt-bradesco",
    nome: "Banco Bradesco",
    tipo: "Banco",
    documento: "60.746.948/0001-12",
    localPrincipal: "Osasco - SP",
  },
  {
    id: "cmt-allianz",
    nome: "Allianz Seguros",
    tipo: "Seguradora",
    documento: "61.614.196/0001-67",
    localPrincipal: "São Paulo - SP",
  },
  {
    id: "cmt-nufinance",
    nome: "NuFinance Arrendamento Mercantil Ltda.",
    tipo: "Empresa",
    documento: "12.345.678/0001-90",
    localPrincipal: "Brasília - DF",
  },
  {
    id: "cmt-silva",
    nome: "Carlos Eduardo Silva",
    tipo: "Pessoa Física",
    documento: "123.456.789-00",
    localPrincipal: "Belo Horizonte - MG",
  },
];
