"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Search01Icon,
  UserIcon,
  ArrowReloadHorizontalIcon,
  ShoppingBag01Icon,
  SaleTag02Icon,
  Menu02FreeIcons,
  AuctionIcon,
  Award02Icon,
  Logout01Icon,
  ArrowDown01Icon,
  Alert02Icon,
  Shield02Icon,
} from "@hugeicons/core-free-icons";

import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar } from "@/components/ui/avatar";
import { Tooltip } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuItemContent,
  DropdownMenuItemIcon,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/cn";
import {
  SELLER_REQUESTS_STORAGE_KEY,
  SELLER_REQUESTS_UPDATED_EVENT,
  loadSellerRequest,
} from "@/lib/seller-request";
import { useAuth } from "@/components/providers/auth-provider";
import { getAuthTokenFromDocument } from "@/lib/auth-cookies";
import { Skeleton } from "@/components/ui/skeleton";

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const isMarketplace = pathname?.startsWith("/marketplace");
  const {
    user: me,
    primeiroNome,
    isAuthenticated,
    isAdmin,
    isVendedor,
    status,
    logout,
    precisaAtencaoCadastro,
  } = useAuth();

  function handleToggleMarketplace() {
    router.push(isMarketplace ? "/" : "/marketplace");
  }

  function handleGoToComoComprar() {
    router.push("/como-comprar");
  }

  function handleGoToComoVender() {
    router.push("/como-vender");
  }

  function handleGoToAuth() {
    router.push("/auth");
  }

  function handleGoToSellerPanel() {
    router.push("/painel-vendedor/meus-anuncios");
  }

  function handleRequestSellerAccess() {
    router.push("/solicitar-vendedor");
  }

  function handleSellerAction() {
    if (!isAuthenticated) {
      router.push("/auth");
      return;
    }
    if (isVendedor) {
      handleGoToSellerPanel();
      return;
    }
    handleRequestSellerAccess();
  }

  function handleLogout() {
    logout();
    router.push("/");
    router.refresh();
  }

  const isLoggedIn = isAuthenticated;
  const authBootstrapping = status === "loading" && Boolean(getAuthTokenFromDocument());
  const [requestStatus, setRequestStatus] = React.useState<"pendente" | "aprovado" | "recusado" | null>(null);

  React.useEffect(() => {
    const refreshSellerStatus = () => {
      const uid = me?.id?.trim();
      if (!uid) {
        setRequestStatus(null);
        return;
      }
      const req = loadSellerRequest(uid);
      setRequestStatus(req?.status ?? null);
    };
    const onStorage = (e: StorageEvent) => {
      if (e.key === SELLER_REQUESTS_STORAGE_KEY) refreshSellerStatus();
    };

    refreshSellerStatus();
    window.addEventListener(SELLER_REQUESTS_UPDATED_EVENT, refreshSellerStatus);
    window.addEventListener("storage", onStorage);

    return () => {
      window.removeEventListener(SELLER_REQUESTS_UPDATED_EVENT, refreshSellerStatus);
      window.removeEventListener("storage", onStorage);
    };
  }, [me?.id]);

  const sellerCtaLabel = isVendedor
    ? "Painel do Vendedor"
    : !isAuthenticated
      ? "Entrar para vender"
      : requestStatus === "pendente"
        ? "Solicitação em análise"
        : requestStatus === "recusado"
          ? "Reenviar solicitação"
          : "Solicitar Vendedor";
  const sellerCtaDescription = isVendedor
    ? "Gerencie seus anúncios no marketplace"
    : !isAuthenticated
      ? "Faça login para acessar o painel ou solicitar cadastro"
      : requestStatus === "pendente"
        ? "Acompanhe o andamento da sua solicitação"
        : requestStatus === "recusado"
          ? "Atualize seus dados e envie novamente"
          : "Peça acesso para anunciar no marketplace";
  const user = {
    name: primeiroNome,
    avatar: me?.fotoPerfil || "/NuLanceADMIN.png",
    pendingDocs: precisaAtencaoCadastro,
    isSeller: isVendedor,
    isAdmin,
  };
  const [quickSearchOpen, setQuickSearchOpen] = React.useState(false);
  const [quickSearchQuery, setQuickSearchQuery] = React.useState("");
  const quickSearchInputRef = React.useRef<HTMLInputElement | null>(null);

  const quickSearchItems = React.useMemo(
    () => {
      const items: {
        id: string;
        title: string;
        description: string;
        href: string;
        keywords: string;
      }[] = [
      {
        id: "home",
        title: "Leilões",
        description: "Página inicial de leilões",
        href: "/",
        keywords: "inicio home leiloes leilão",
      },
      {
        id: "marketplace",
        title: "Marketplace",
        description: "Comprar e descobrir veículos",
        href: "/marketplace",
        keywords: "marketplace comprar carro moto caminhão",
      },
      {
        id: "how-buy",
        title: "Como Comprar",
        description: "Guia de compra na NuLances",
        href: "/como-comprar",
        keywords: "guia como comprar ajuda",
      },
      {
        id: "how-sell",
        title: "Como Vender",
        description: "Guia de venda na NuLances",
        href: "/como-vender",
        keywords: "guia como vender ajuda",
      },
      {
        id: "help",
        title: "Central de Ajuda",
        description: "FAQ e dúvidas frequentes",
        href: "/central-de-ajuda",
        keywords: "faq suporte ajuda",
      },
      {
        id: "contact",
        title: "Fale Conosco",
        description: "Entre em contato com a equipe",
        href: "/fale-conosco",
        keywords: "contato suporte atendimento",
      },
      {
        id: "profile",
        title: "Meu Perfil",
        description: "Dados e preferências da conta",
        href: "/profile",
        keywords: "perfil conta usuario",
      },
      {
        id: "bids",
        title: "Meus Lances",
        description: "Acompanhar lances ativos",
        href: "/profile/lances",
        keywords: "lances leilao",
      },
      {
        id: "wins",
        title: "Leilões Ganhos",
        description: "Itens arrematados",
        href: "/profile/ganhos",
        keywords: "ganhos arremates",
      },
      {
        id: "seller-request",
        title: "Solicitar Vendedor",
        description: "Pedir acesso para anunciar",
        href: "/solicitar-vendedor",
        keywords: "vendedor solicitação anunciar",
      },
      {
        id: "seller-panel",
        title: "Painel do Vendedor",
        description: "Gerenciar anúncios do vendedor",
        href: "/painel-vendedor/meus-anuncios",
        keywords: "painel vendedor anuncios",
      },
      {
        id: "admin-marketplace",
        title: "Admin Marketplace",
        description: "Gestão administrativa do marketplace",
        href: "/admin/marketplace/dashboard",
        keywords: "admin marketplace dashboard",
      },
      {
        id: "admin-leilao",
        title: "Admin Leilões",
        description: "Gestão administrativa de leilões",
        href: "/admin/dashboard",
        keywords: "admin leilao dashboard",
      },
      {
        id: "privacy",
        title: "Política de Privacidade",
        description: "Termos de privacidade da plataforma",
        href: "/politica-de-privacidade",
        keywords: "privacidade politica",
      },
      {
        id: "terms",
        title: "Termos de Uso",
        description: "Condições de uso da plataforma",
        href: "/termos-e-condicoes-de-uso",
        keywords: "termos uso condicoes",
      },
    ];
      if (isVendedor) {
        return items.filter((item) => item.id !== "seller-request");
      }
      return items;
    },
    [isVendedor]
  );

  const quickSearchResults = React.useMemo(() => {
    const q = quickSearchQuery.trim().toLowerCase();
    if (!q) return quickSearchItems.slice(0, 8);
    return quickSearchItems
      .filter((item) => {
        const haystack = `${item.title} ${item.description} ${item.keywords}`.toLowerCase();
        return haystack.includes(q);
      })
      .slice(0, 12);
  }, [quickSearchItems, quickSearchQuery]);

  const goToQuickResult = React.useCallback(
    (href: string) => {
      router.push(href);
      setQuickSearchOpen(false);
      setQuickSearchQuery("");
    },
    [router]
  );

  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setQuickSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  React.useEffect(() => {
    if (!quickSearchOpen) return;
    const t = window.setTimeout(() => quickSearchInputRef.current?.focus(), 0);
    return () => window.clearTimeout(t);
  }, [quickSearchOpen]);

  const accountMenuContent = (
    <DropdownMenuContent className="w-75 p-0 right-0" align="end">
      <div className="rounded-[18px] bg-[linear-gradient(180deg,#fafafa_0%,#ffffff_100%)] p-1">
        {user.pendingDocs && (
          <>
            <DropdownMenuItem onClick={() => router.push("/profile/documents")} className="group bg-amber-50 hover:bg-amber-100/60 mb-2">
              <DropdownMenuItemIcon className="text-amber-600 bg-amber-100 border-amber-200 group-hover:bg-amber-200">
                <HugeiconsIcon icon={Alert02Icon} size={20} color="currentColor" strokeWidth={1.8} />
              </DropdownMenuItemIcon>
              <DropdownMenuItemContent 
                title="Envie seus documentos" 
                description="Finalize seu cadastro para dar lances" 
              />
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}

        <DropdownMenuLabel>Sua Conta</DropdownMenuLabel>

        {isMarketplace ? (
          <>
            <DropdownMenuItem
              onClick={handleSellerAction}
              className={cn(
                "group",
                isVendedor ? "hover:bg-zinc-100" : "hover:bg-[rgba(99,20,108,0.06)]"
              )}
            >
              <DropdownMenuItemIcon
                className={cn(
                  isVendedor
                    ? "text-zinc-700 bg-zinc-100 border-zinc-200"
                    : "text-[var(--nulance-purple)] bg-[var(--nulance-purple)]/10 border-[var(--nulance-purple)]/20"
                )}
              >
                <HugeiconsIcon icon={SaleTag02Icon} size={20} color="currentColor" strokeWidth={1.8} />
              </DropdownMenuItemIcon>
              <DropdownMenuItemContent
                title={sellerCtaLabel}
                description={sellerCtaDescription}
              />
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        ) : null}
        
        {user.isAdmin && (
          <>
            <DropdownMenuItem
              onClick={() => router.push("/admin/dashboard")}
              className="group hover:bg-[rgba(99,20,108,0.06)]"
            >
              <DropdownMenuItemIcon
                className="text-[var(--nulance-purple)] bg-[var(--nulance-purple)]/10 border-[var(--nulance-purple)]/20 group-hover:bg-[var(--nulance-purple)]/15 group-hover:border-[var(--nulance-purple)]/30"
              >
                <HugeiconsIcon
                  icon={Shield02Icon}
                  size={20}
                  color="currentColor"
                  strokeWidth={1.8}
                />
              </DropdownMenuItemIcon>
              <DropdownMenuItemContent
                title="Área Administrativa"
                description="Acesso exclusivo para admins"
              />
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}

        <DropdownMenuItem onClick={() => router.push("/profile")}>
          <DropdownMenuItemIcon className="relative">
            <HugeiconsIcon icon={UserIcon} size={20} color="currentColor" strokeWidth={1.8} />
            {user.pendingDocs && (
              <Tooltip content="Termine seu cadastro" position="right">
                <span className="absolute -right-3 top-1 animate-pulse rounded-full bg-nulance-purple text-white flex items-center justify-center h-4 w-4 ring-2 ring-white">
                  <HugeiconsIcon icon={Alert02Icon} size={12} />
                </span>
              </Tooltip>
            )}
          </DropdownMenuItemIcon>
          <DropdownMenuItemContent title="Meu Perfil" description="Gerencie seus dados e preferências" />
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={() => router.push("/profile/lances")}>
          <DropdownMenuItemIcon>
            <HugeiconsIcon icon={AuctionIcon} size={20} color="currentColor" strokeWidth={1.8} />
          </DropdownMenuItemIcon>
          <DropdownMenuItemContent title="Meus Lances" description="Acompanhe seus leilões ativos" />
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => router.push("/profile/ganhos")}> 
          <DropdownMenuItemIcon>
            <HugeiconsIcon icon={Award02Icon} size={20} color="currentColor" strokeWidth={1.8} />
          </DropdownMenuItemIcon>
          <DropdownMenuItemContent title="Leilões Ganhos" description="Veja os leilões que você arrematou" />
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem 
          onClick={handleLogout} 
          className="group hover:bg-red-50/50"
        >
          <DropdownMenuItemIcon className="text-red-500 group-hover:bg-red-100 group-hover:border-red-200">
            <HugeiconsIcon icon={Logout01Icon} size={20} color="currentColor" strokeWidth={1.8} />
          </DropdownMenuItemIcon>
          <DropdownMenuItemContent title="Sair da conta" description="Encerrar sua sessão de forma segura" />
        </DropdownMenuItem>
      </div>
    </DropdownMenuContent>
  );

  return (
    <>
    <header className="hidden w-full border-b border-zinc-200 bg-white md:block">
      <div className="relative flex h-20.5 items-center justify-between px-8">
        <div className="flex flex-1 items-center justify-start">
          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Button
                  type="button"
                  variant="header-icon"
                  size="header-icon"
                  aria-label="Abrir menu"
                  className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-zinc-200 bg-[#f1f1f3] text-[#6d6d75] transition-all duration-200 hover:bg-[#e8e8eb] active:scale-[0.98]"
                >
                  <HugeiconsIcon
                    icon={Menu02FreeIcons}
                    size={24}
                    color="currentColor"
                    strokeWidth={1.8}
                  />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent className="w-[320px] p-0">
                <div className="rounded-[18px] bg-[linear-gradient(180deg,#fafafa_0%,#ffffff_100%)] p-1">
                  <DropdownMenuLabel>navegação</DropdownMenuLabel>

                  <DropdownMenuItem onClick={handleToggleMarketplace}>
                    <DropdownMenuItemIcon>
                      <HugeiconsIcon
                        icon={ArrowReloadHorizontalIcon}
                        size={20}
                        color="currentColor"
                        strokeWidth={1.8}
                      />
                    </DropdownMenuItemIcon>

                    <DropdownMenuItemContent
                      title={isMarketplace ? "Alternar para Leilões" : "Alternar para Marketplace"}
                      description={
                        isMarketplace
                          ? "Volte para a experiência de leilões"
                          : "Mude para a experiência de compra e descoberta"
                      }
                    />
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem onClick={handleGoToComoComprar}>
                    <DropdownMenuItemIcon>
                      <HugeiconsIcon
                        icon={ShoppingBag01Icon}
                        size={20}
                        color="currentColor"
                        strokeWidth={1.8}
                      />
                    </DropdownMenuItemIcon>

                    <DropdownMenuItemContent
                      title="Como Comprar"
                      description="Descubra como comprar na NuLances"
                    />
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem onClick={handleGoToComoVender}>
                    <DropdownMenuItemIcon>
                      <HugeiconsIcon
                        icon={SaleTag02Icon}
                        size={20}
                        color="currentColor"
                        strokeWidth={1.8}
                      />
                    </DropdownMenuItemIcon>

                    <DropdownMenuItemContent
                      title="Como Vender"
                      description="Descubra como vender na NuLances"
                    />
                  </DropdownMenuItem>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            <Label htmlFor="quick-search" className="mb-0">
              <div className="relative flex items-center">
                <Input
                  id="quick-search"
                  placeholder="Pesquisa rápida"
                  readOnly
                  onClick={() => setQuickSearchOpen(true)}
                  onFocus={() => setQuickSearchOpen(true)}
                  className="h-14 w-95 rounded-full border border-zinc-200 bg-[#f1f1f3] pl-14 pr-24.5 text-[18px] font-medium text-slate-600 placeholder:text-slate-500 focus-visible:ring-0"
                />

                <div className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-[#6d6d75]">
                  <HugeiconsIcon
                    icon={Search01Icon}
                    size={24}
                    color="currentColor"
                    strokeWidth={1.8}
                  />
                </div>

                <span className="pointer-events-none absolute right-1.5 top-1/2 inline-flex h-10.5 -translate-y-1/2 items-center rounded-full border border-zinc-200 bg-white px-5 text-[14px] font-semibold tracking-[0.04em] text-[#66666f]">
                  CTRL+K
                </span>
              </div>
            </Label>
          </div>
        </div>

        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <Link href="/" className="inline-block transition-transform hover:scale-105 active:scale-95">
            <Logo
              variant={isMarketplace ? "marketplace" : "leilao"}
              size={128}
              className="h-auto w-auto object-contain"
              priority
            />
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-end">
          {authBootstrapping ? (
            <Skeleton className="h-14 w-[200px] rounded-full" aria-hidden />
          ) : isLoggedIn ? (
            <div className="flex items-center gap-3">
              {isMarketplace ? (
                <Button
                  type="button"
                  variant={isVendedor ? "secondary" : "default"}
                  onClick={handleSellerAction}
                  className={cn(
                    "h-11 rounded-full px-5 text-[14px] font-semibold",
                    isVendedor
                      ? "border border-zinc-200 bg-white text-zinc-800 hover:bg-zinc-50"
                      : "bg-[var(--nulance-purple)] text-white hover:bg-[var(--nulance-purple)]/90"
                  )}
                >
                  {sellerCtaLabel}
                </Button>
              ) : null}

              <DropdownMenu>
                <DropdownMenuTrigger>
                  <button
                    type="button"
                    className="group flex h-14 cursor-pointer items-center gap-3 rounded-full border border-zinc-200 bg-white pl-2 pr-4 transition-all duration-200 hover:bg-zinc-50 active:scale-[0.98]"
                  >
                    <div className="relative">
                      <Avatar src={user.avatar} alt={user.name} className="h-10 w-10 border border-zinc-200" />
                      {user.pendingDocs && (
                        <div className="absolute -right-1 -top-1">
                          <Tooltip content="Envie os documentos" position="bottom">
                            <div className="flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-white ring-2 ring-white ">
                              <HugeiconsIcon icon={Alert02Icon} size={10} color="currentColor" strokeWidth={2.5} />
                            </div>
                          </Tooltip>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col items-start justify-center text-left">
                      <span className="text-[14px] font-bold tracking-tight text-zinc-900 leading-none group-hover:text-nulance-purple transition-colors">
                        {user.name}
                      </span>
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 mt-1">
                        Conta ativa
                      </span>
                    </div>
                    <HugeiconsIcon icon={ArrowDown01Icon} size={16} className="ml-1 text-zinc-400 transition-colors group-hover:text-zinc-600" />
                  </button>
                </DropdownMenuTrigger>

                {accountMenuContent}
              </DropdownMenu>
            </div>
          ) : (
            <Button
              type="button"
              variant="header-user"
              size="header-user"
              onClick={handleGoToAuth}
              className="flex h-14 items-center gap-3 rounded-full px-4 text-[#6f6f78]"
            >
              <HugeiconsIcon
                icon={UserIcon}
                size={20}
                color="currentColor"
                strokeWidth={1.8}
              />
              <span className="text-[17px] font-medium">Entrar</span>
            </Button>
          )}
        </div>
      </div>
    </header>

    <Dialog
      open={quickSearchOpen}
      onOpenChange={(open) => {
        setQuickSearchOpen(open);
        if (!open) setQuickSearchQuery("");
      }}
    >
      <DialogContent className="max-w-2xl overflow-hidden p-0">
        <DialogHeader className="sr-only">
          <DialogTitle>Pesquisa rápida</DialogTitle>
        </DialogHeader>

        <div className="border-b border-zinc-200 p-3">
          <Input
            ref={quickSearchInputRef}
            value={quickSearchQuery}
            onChange={(e) => setQuickSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && quickSearchResults[0]) {
                e.preventDefault();
                goToQuickResult(quickSearchResults[0].href);
              }
            }}
            placeholder="Buscar páginas, áreas e atalhos..."
            className="h-12 rounded-full"
            autoComplete="off"
          />
          <p className="mt-2 px-2 text-xs text-zinc-500">Dica: pressione Enter para abrir o primeiro resultado.</p>
        </div>

        <div className="max-h-[55vh] overflow-y-auto p-2">
          {quickSearchResults.length > 0 ? (
            <ul className="space-y-1">
              {quickSearchResults.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => goToQuickResult(item.href)}
                    className="w-full rounded-2xl px-3 py-2.5 text-left transition-colors hover:bg-zinc-100"
                  >
                    <p className="text-sm font-semibold text-zinc-900">{item.title}</p>
                    <p className="mt-0.5 text-xs text-zinc-500">{item.description}</p>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-3 py-8 text-center text-sm text-zinc-500">Nenhum resultado encontrado.</div>
          )}
        </div>
      </DialogContent>
    </Dialog>

    <header className="sticky top-0 z-40 w-full border-b border-zinc-200 bg-white/95 backdrop-blur-md pt-[env(safe-area-inset-top)] md:hidden">
      <div className="relative mx-auto flex h-14 items-center justify-between px-4">
        <div className="w-10 shrink-0" aria-hidden />
        <Link
          href={isMarketplace ? "/marketplace" : "/"}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transition-transform active:scale-95"
        >
          <Logo
            variant={isMarketplace ? "marketplace" : "leilao"}
            size={88}
            className="h-9 w-auto object-contain"
            priority
          />
        </Link>
        {authBootstrapping ? (
          <Skeleton className="h-10 w-24 rounded-full" aria-hidden />
        ) : isLoggedIn ? (
          <DropdownMenu>
            <DropdownMenuTrigger>
              <button
                type="button"
                className="group flex h-10 shrink-0 items-center gap-2 rounded-full border border-zinc-200 bg-white px-1.5 pr-2.5 transition-all duration-200 hover:bg-zinc-50 active:scale-[0.98]"
                aria-label="Abrir menu da conta"
              >
                <span className="relative flex h-7 w-7 items-center justify-center overflow-visible rounded-full border border-zinc-200 bg-white">
                  <Avatar src={user.avatar} alt={user.name} className="h-full w-full border-0" />
                  {user.pendingDocs && (
                    <span className="absolute -right-0.5 -top-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-amber-500 text-white ring-2 ring-white">
                      <HugeiconsIcon icon={Alert02Icon} size={9} color="currentColor" strokeWidth={2.5} />
                    </span>
                  )}
                </span>
                <span className="max-w-[84px] truncate text-[12px] font-semibold text-zinc-800">{user.name}</span>
                <HugeiconsIcon
                  icon={ArrowDown01Icon}
                  size={14}
                  className="text-zinc-400 transition-colors group-hover:text-zinc-600"
                />
              </button>
            </DropdownMenuTrigger>
            {accountMenuContent}
          </DropdownMenu>
        ) : (
          <Button
            type="button"
            variant="header-icon"
            size="header-icon"
            onClick={handleGoToAuth}
            className="h-10 w-10 shrink-0"
            aria-label="Entrar"
          >
            <HugeiconsIcon icon={UserIcon} size={20} color="currentColor" strokeWidth={1.8} />
          </Button>
        )}
      </div>
    </header>
    </>
  );
}
