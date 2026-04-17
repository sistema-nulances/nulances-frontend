import type { SelectOption } from "@/components/ui/select";

/** Montadoras disponíveis no cadastro (alinhadas ao ícone quando existir em simple-icons). */
const RAW: string[] = [
  "Acura",
  "Aston Martin",
  "Audi",
  "Bentley",
  "BMW",
  "Bugatti",
  "Cadillac",
  "Chevrolet",
  "Chrysler",
  "Citroën",
  "DAF",
  "Dacia",
  "DS Automobiles",
  "Ducati",
  "Ferrari",
  "Fiat",
  "Ford",
  "Honda",
  "Hyundai",
  "Infiniti",
  "Iveco",
  "Jeep",
  "Kia",
  "Lada",
  "Lamborghini",
  "MAN",
  "MG",
  "Maserati",
  "Mazda",
  "McLaren",
  "Mini",
  "Mitsubishi",
  "Nissan",
  "Opel",
  "Peugeot",
  "Piaggio",
  "Polestar",
  "Porsche",
  "Ram",
  "Renault",
  "Rimac",
  "Rolls-Royce",
  "Scania",
  "SEAT",
  "Škoda",
  "Subaru",
  "Suzuki",
  "Tesla",
  "Toyota",
  "Volkswagen",
  "Volvo",
];

export const BEM_MARCA_OPTIONS: SelectOption[] = [...RAW]
  .sort((a, b) => a.localeCompare(b, "pt-BR"))
  .map((label) => ({ value: label, label }));

/** Para inferir marca a partir do nome completo (edição / dados antigos). */
export function bemMarcaLabelsByLength(): string[] {
  return [...RAW].sort((a, b) => b.length - a.length);
}

export function inferMarcaModelo(nome: string): { marca: string; modelo: string } {
  const n = nome.trim();
  if (!n) return { marca: "", modelo: "" };
  const lower = n.toLowerCase();
  for (const m of bemMarcaLabelsByLength()) {
    const ml = m.toLowerCase();
    if (lower === ml || lower.startsWith(`${ml} `)) {
      return { marca: m, modelo: n.slice(m.length).trim() };
    }
  }
  return { marca: "", modelo: n };
}
