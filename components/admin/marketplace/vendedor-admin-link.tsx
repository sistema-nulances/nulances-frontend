import Link from "next/link";

import { marketplaceVendedorAdminHref } from "@/lib/marketplace-vendedor-admin-href";
import { cn } from "@/lib/cn";

const vendedorLinkClass =
  "font-medium text-[var(--nulance-purple)] underline underline-offset-[3px] decoration-[var(--nulance-purple)] hover:opacity-90";

type VendedorAdminLinkProps = {
  name: string;
  className?: string;
};

/** Nome do vendedor como link para a área admin de vendedores (mock). */
export function VendedorAdminLink({ name, className }: VendedorAdminLinkProps) {
  return (
    <Link href={marketplaceVendedorAdminHref(name)} className={cn(vendedorLinkClass, className)}>
      {name}
    </Link>
  );
}
