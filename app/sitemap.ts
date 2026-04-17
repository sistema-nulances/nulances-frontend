import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

const routes = [
  "",
  "/marketplace",
  "/auth",
  "/auth/register",
  "/auth/forgot-password",
  "/central-de-ajuda",
  "/como-comprar",
  "/como-vender",
  "/fale-conosco",
  "/politica-de-privacidade",
  "/termos-e-condicoes-de-uso",
  "/codigo-de-defesa-do-consumidor",
  "/solicitar-vendedor",
  "/profile",
  "/profile/documents",
  "/profile/lances",
  "/profile/ganhos",
  "/dashboard",
  "/painel-vendedor",
  "/painel-vendedor/meus-anuncios",
  "/admin",
  "/admin/dashboard",
  "/admin/marketplace/dashboard",
  "/admin/marketplace/anuncios",
].map((path) => `${siteUrl}${path}`);

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return routes.map((url) => ({
    url,
    lastModified: now,
    changeFrequency: "daily",
    priority: url === siteUrl ? 1 : 0.7,
  }));
}

