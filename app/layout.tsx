import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { GlobalNotices } from "@/components/avisos/global-notices";
import { AuthProvider } from "@/components/providers/auth-provider";
import { ToastProvider } from "@/components/ui/use-toast";
import { NuqsAdapter } from "nuqs/adapters/next/app";

const vendSans = Inter({
  variable: "--font-vend-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal"],
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "NuLances | Leilões e Marketplace de Veículos",
    template: "%s | NuLances",
  },
  description:
    "A NuLances conecta compradores e vendedores em leilões e no marketplace automotivo com informações claras e experiência simples.",
  applicationName: "NuLances",
  keywords: [
    "nulances",
    "leilão de veículos",
    "marketplace de veículos",
    "comprar carro",
    "vender carro",
    "leilões",
    "automóveis",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: siteUrl,
    siteName: "NuLances",
    title: "NuLances | Leilões e Marketplace de Veículos",
    description:
      "Plataforma para leilões e marketplace de veículos com foco em transparência, organização e praticidade.",
  },
  twitter: {
    card: "summary_large_image",
    title: "NuLances | Leilões e Marketplace de Veículos",
    description:
      "Compre e venda veículos na NuLances com experiência moderna para leilões e marketplace.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  category: "automotive",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${vendSans.variable} antialiased`}>
        <NuqsAdapter>
          <ToastProvider>
            <AuthProvider>
              <GlobalNotices />
              {children}
            </AuthProvider>
          </ToastProvider>
        </NuqsAdapter>
      </body>
    </html>
  );
}
