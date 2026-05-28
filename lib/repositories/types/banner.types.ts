export type TipoBannerApi = "LEILAO" | "MARKETPLACE";

export type BannerUploadRequest = {
  fileName: string;
  contentType: string;
};

export type BannerUploadResponse = {
  uploadUrl: string;
  objectKey: string;
};

export type BannerCreateRequest = {
  tipo: TipoBannerApi;
  posicao: number;
  textoAlternativo?: string;
  imagem: string;
  ativo?: boolean;
  objectPosition?: string;
};

export type BannerUpdateRequest = {
  tipo?: TipoBannerApi;
  posicao?: number;
  textoAlternativo?: string;
  imagem?: string;
  ativo?: boolean;
  objectPosition?: string | null;
};

export type BannerAdminResponse = {
  id: string;
  tipo: TipoBannerApi;
  posicao: number;
  textoAlternativo?: string | null;
  imagem: string;
  arquivoUrl: string;
  ativo: boolean;
  objectPosition?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type BannerPublicResponse = {
  id: string;
  tipo: TipoBannerApi;
  posicao: number;
  textoAlternativo?: string | null;
  imagem: string;
  objectPosition?: string | null;
};
