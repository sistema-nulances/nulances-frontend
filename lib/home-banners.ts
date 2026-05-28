/** Medida recomendada para exportar a arte dos banners (tela admin). */
export const HOME_BANNER_IDEAL = {
  widthPx: 1600,
  heightPx: 463,
  aspectRatioLabel: "1600:463",
} as const;

export const HOME_BANNERS_STORAGE_KEY = "nulance-home-banners-v1";

export const HOME_BANNERS_UPDATED_EVENT = "nulance:home-banners";

export const MARKETPLACE_BANNERS_STORAGE_KEY = "nulance-marketplace-banners-v1";

export const MARKETPLACE_BANNERS_UPDATED_EVENT = "nulance:marketplace-banners";

export type HomeBannerSlide = {
  id: number;
  image: string;
  alt: string;
  objectPosition?: string;
};

export const DEFAULT_HOME_BANNERS: HomeBannerSlide[] = [
  { id: 1, image: "/BANNER-MOCK1.png", alt: "Banner principal NuLances 1" },
  { id: 2, image: "/BANNER-MOCK2.png", alt: "Banner principal NuLances 2" },
];

export const DEFAULT_MARKETPLACE_BANNERS: HomeBannerSlide[] = [
  { id: 1, image: "/BANNER-MOCK1.png", alt: "Banner marketplace 1" },
  { id: 2, image: "/BANNER-MOCK2.png", alt: "Banner marketplace 2" },
];

function isSlide(v: unknown): v is HomeBannerSlide {
  if (!v || typeof v !== "object") return false;
  const o = v as Record<string, unknown>;
  return typeof o.image === "string" && typeof o.alt === "string";
}

export function parseStoredHomeBanners(raw: string | null): HomeBannerSlide[] | null {
  if (!raw) return null;
  try {
    const p = JSON.parse(raw) as { slides?: unknown };
    if (!Array.isArray(p.slides) || p.slides.length === 0) return null;
    const slides = p.slides.filter(isSlide);
    if (slides.length === 0) return null;
    return slides.map((s, i) => ({
      ...s,
      id: typeof s.id === "number" && Number.isFinite(s.id) ? s.id : i + 1,
    }));
  } catch {
    return null;
  }
}

export function loadHomeBannersFromStorage(): HomeBannerSlide[] {
  if (typeof window === "undefined") return [];
  const parsed = parseStoredHomeBanners(localStorage.getItem(HOME_BANNERS_STORAGE_KEY));
  return parsed ?? [];
}

export function saveHomeBannersToStorage(slides: HomeBannerSlide[]): void {
  localStorage.setItem(HOME_BANNERS_STORAGE_KEY, JSON.stringify({ slides }));
  window.dispatchEvent(new Event(HOME_BANNERS_UPDATED_EVENT));
}

export function loadMarketplaceBannersFromStorage(): HomeBannerSlide[] {
  if (typeof window === "undefined") return [];
  const parsed = parseStoredHomeBanners(localStorage.getItem(MARKETPLACE_BANNERS_STORAGE_KEY));
  return parsed ?? [];
}

export function saveMarketplaceBannersToStorage(slides: HomeBannerSlide[]): void {
  localStorage.setItem(MARKETPLACE_BANNERS_STORAGE_KEY, JSON.stringify({ slides }));
  window.dispatchEvent(new Event(MARKETPLACE_BANNERS_UPDATED_EVENT));
}
