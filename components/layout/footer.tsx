"use client";

import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  InstagramIcon,
  Facebook01Icon,
  Mail01Icon,
  MapPinIcon,
  ArrowUp01Icon,
} from "@hugeicons/core-free-icons";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";

export function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="w-full bg-[#f8f9fa] pt-16 pb-8">
      <div className="mx-auto w-full max-w-7xl px-4 md:px-8 xl:max-w-430">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {/* Col 1 */}
          <div className="flex flex-col gap-6">
            <Logo variant="default" size={140} className="h-auto w-40 object-contain" />
            <div className="flex items-center gap-4 text-zinc-600">
              <a href="#" className="transition-colors hover:text-nulance-purple">
                <HugeiconsIcon icon={InstagramIcon} size={24} color="currentColor" />
              </a>
              <a href="#" className="transition-colors hover:text-nulance-purple">
                <HugeiconsIcon icon={Facebook01Icon} size={24} color="currentColor" />
              </a>
              <a href="#" className="transition-colors hover:text-nulance-purple">
                <HugeiconsIcon icon={Mail01Icon} size={24} color="currentColor" />
              </a>
            </div>
          </div>

          {/* Col 2 */}
          <div className="flex flex-col gap-5">
            <h3 className="text-[16px] font-bold text-[#0f172a]">Sobre nós</h3>
            <ul className="flex flex-col gap-3 text-[15px] text-[#64748b]">
              <li>
                <Link href="/" className="transition-colors hover:text-nulance-purple">
                  Conheça a NuLances
                </Link>
              </li>
              <li>
                <Link href="/codigo-de-defesa-do-consumidor" className="transition-colors hover:text-nulance-purple">
                  Cód. defesa do consumidor
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3 */}
          <div className="flex flex-col gap-5">
            <h3 className="text-[16px] font-bold text-[#0f172a]">Privacidade & Termos</h3>
            <ul className="flex flex-col gap-3 text-[15px] text-[#64748b]">
              <li>
                <Link href="/politica-de-privacidade" className="transition-colors hover:text-nulance-purple">
                  Política de privacidade
                </Link>
              </li>
              <li>
                <Link href="/termos-e-condicoes-de-uso" className="transition-colors hover:text-nulance-purple">
                  Termos e condições de uso
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4 */}
          <div className="flex flex-col gap-5">
            <h3 className="text-[16px] font-bold text-[#0f172a]">Precisa de ajuda?</h3>
            <ul className="flex flex-col gap-3 text-[15px] text-[#64748b]">
              <li>
                <Link href="/central-de-ajuda" className="transition-colors hover:text-nulance-purple">
                  Central de ajuda
                </Link>
              </li>
              <li>
                <Link href="/fale-conosco" className="transition-colors hover:text-nulance-purple">
                  Fale conosco
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="relative mt-16">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-zinc-200" />
          </div>
          <div className="relative flex justify-center">
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-[15px] text-[#0f172a]">
            © 2026 NuLances
          </p>

          <Button
            type="button"
            variant="ghost"
            onClick={scrollToTop}
            className="text-[15px] text-[#0f172a] hover:text-nulance-purple hover:bg-transparent px-0 h-auto"
          >
            <HugeiconsIcon icon={ArrowUp01Icon} size={20} color="currentColor" />
            <span>Ir para o topo</span>
          </Button>
        </div>
      </div>
    </footer>
  );
}
