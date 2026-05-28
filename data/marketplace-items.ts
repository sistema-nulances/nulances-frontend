import type { AnuncioCondicao } from "@/data/anuncio-veiculo-api";

export type MarketplaceCategory = string;

/** Aba de categoria na UI (`"todos"` = sem filtro por tipo). */
export type MarketplaceCategoryFilter = MarketplaceCategory | "todos";

export type MarketplaceStatus = "ABERTO" | "EM_BREVE" | "ENCERRADO";

/** Condição do item no marketplace (Novo, Usado, Seminovo — não monta de leilão). */
export type MarketplaceCondicao = AnuncioCondicao;

export type MarketplaceItem = {
  /** Mock numérico ou UUID string vindo da API pública. */
  id: number | string;
  leilaoId: number;
  categoria: MarketplaceCategory;
  status: MarketplaceStatus;
  titulo: string;
  condicao: MarketplaceCondicao;
  marca: string;
  modelo: string;
  ano: string;
  km: string;
  cambio: string;
  combustivel: string;
  local: string;
  preco: string;
  imagem?: string;
};

export const marketplaceItems: MarketplaceItem[] = [
  {
    id: 101,
    leilaoId: 12,
    categoria: "carros",
    status: "ABERTO",
    titulo: "Toyota Corolla Altis 2.0 Hybrid",
    condicao: "Usado",
    marca: "Toyota",
    modelo: "Corolla Altis",
    ano: "2023/2024",
    km: "15.000 km",
    cambio: "Automático",
    combustivel: "Híbrido",
    local: "Brasília - DF",
    preco: "R$ 145.900,00",
    imagem:
      "https://images.unsplash.com/photo-1542362567-b07e54358753?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: 102,
    leilaoId: 2,
    categoria: "carros",
    status: "EM_BREVE",
    titulo: "Honda Civic Touring 1.5 Turbo CVT",
    condicao: "Usado",
    marca: "Honda",
    modelo: "Civic Touring",
    ano: "2021/2021",
    km: "37.900 km",
    cambio: "CVT",
    combustivel: "Flex",
    local: "Goiânia - GO",
    preco: "R$ 89.990,00",
    imagem:
      "https://images.unsplash.com/photo-1545243027-6460a3d95f2d?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: 103,
    leilaoId: 8,
    categoria: "carros",
    status: "ABERTO",
    titulo: "Jeep Compass Longitude 2.0 Flex AT",
    condicao: "Usado",
    marca: "Jeep",
    modelo: "Compass Longitude",
    ano: "2020/2021",
    km: "62.500 km",
    cambio: "Automático",
    combustivel: "Flex",
    local: "Florianópolis - SC",
    preco: "R$ 79.900,00",
    imagem:
      "https://images.unsplash.com/photo-1483392010034-34b8c8b3f2c3?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: 104,
    leilaoId: 5,
    categoria: "carros",
    status: "ABERTO",
    titulo: "Chevrolet Onix LT Turbo",
    condicao: "Usado",
    marca: "Chevrolet",
    modelo: "Onix LT Turbo",
    ano: "2022/2023",
    km: "29.870 km",
    cambio: "Manual",
    combustivel: "Flex",
    local: "São Paulo - SP",
    preco: "R$ 54.900,00",
    imagem:
      "https://images.unsplash.com/photo-1493736294959-6b6e5f1f8e8a?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: 105,
    leilaoId: 13,
    categoria: "carros",
    status: "EM_BREVE",
    titulo: "Volkswagen T-Cross 1.4 TSI",
    condicao: "Usado",
    marca: "Volkswagen",
    modelo: "T-Cross",
    ano: "2021/2022",
    km: "41.200 km",
    cambio: "Automático",
    combustivel: "Flex",
    local: "Campinas - SP",
    preco: "R$ 96.900,00",
    imagem:
      "https://images.unsplash.com/photo-1511910849309-0dff6e3c2d0d?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: 106,
    leilaoId: 10,
    categoria: "carros",
    status: "ABERTO",
    titulo: "Hyundai HB20 Comfort 1.0 Flex",
    condicao: "Usado",
    marca: "Hyundai",
    modelo: "HB20 Comfort",
    ano: "2019/2020",
    km: "45.200 km",
    cambio: "Manual",
    combustivel: "Flex",
    local: "Belo Horizonte - MG",
    preco: "R$ 48.500,00",
    imagem:
      "https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: 107,
    leilaoId: 14,
    categoria: "carros",
    status: "ABERTO",
    titulo: "Fiat Argo Drive 1.3",
    condicao: "Usado",
    marca: "Fiat",
    modelo: "Argo Drive",
    ano: "2020/2021",
    km: "28.400 km",
    cambio: "Manual",
    combustivel: "Flex",
    local: "Curitiba - PR",
    preco: "R$ 56.900,00",
    imagem:
      "https://images.unsplash.com/photo-1496307653780-42ee777d4833?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: 108,
    leilaoId: 7,
    categoria: "carros",
    status: "EM_BREVE",
    titulo: "Ford Ranger XLT 3.2 4x4",
    condicao: "Usado",
    marca: "Ford",
    modelo: "Ranger XLT",
    ano: "2018/2019",
    km: "115.000 km",
    cambio: "Automático",
    combustivel: "Diesel",
    local: "Curitiba - PR",
    preco: "R$ 138.900,00",
    imagem:
      "https://images.unsplash.com/photo-1504215680853-026ed2a45def?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: 109,
    leilaoId: 4,
    categoria: "motos",
    status: "ABERTO",
    titulo: "Yamaha XTZ 250 Lander ABS",
    condicao: "Usado",
    marca: "Yamaha",
    modelo: "XTZ 250 Lander ABS",
    ano: "2023/2024",
    km: "8.140 km",
    cambio: "Manual",
    combustivel: "Flex",
    local: "Campo Grande - MS",
    preco: "R$ 18.990,00",
    imagem:
      "https://images.unsplash.com/photo-1525104888774-92f0d9d8c6a0?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: 110,
    leilaoId: 3,
    categoria: "caminhoes",
    status: "EM_BREVE",
    titulo: "Volkswagen Constellation 24.280",
    condicao: "Usado",
    marca: "Volkswagen",
    modelo: "Constellation 24.280",
    ano: "2019/2020",
    km: "212.440 km",
    cambio: "Manual",
    combustivel: "Diesel",
    local: "Rondonópolis - MT",
    preco: "R$ 199.900,00",
    imagem:
      "https://images.unsplash.com/photo-1517949908119-720368f4be38?auto=format&fit=crop&w=1200&q=80",
  },
];

