import { redirect } from "next/navigation";

export default function SellerPanelIndexPage() {
  redirect("/painel-vendedor/meus-anuncios");
}
