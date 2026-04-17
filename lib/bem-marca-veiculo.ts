import type { SelectOption } from "@/components/ui/select";

/** Valores do enum `MarcaVeiculo` no backend (ordem alfabética por rótulo). */
const ENTRIES: Array<{ code: string; label: string }> = [
  { code: "ACURA", label: "Acura" },
  { code: "ASTON_MARTIN", label: "Aston Martin" },
  { code: "AUDI", label: "Audi" },
  { code: "BENTLEY", label: "Bentley" },
  { code: "BMW", label: "BMW" },
  { code: "BUGATTI", label: "Bugatti" },
  { code: "CADILLAC", label: "Cadillac" },
  { code: "CHEVROLET", label: "Chevrolet" },
  { code: "CHRYSLER", label: "Chrysler" },
  { code: "CITROEN", label: "Citroën" },
  { code: "DAF", label: "DAF" },
  { code: "DACIA", label: "Dacia" },
  { code: "DS_AUTOMOBILES", label: "DS Automobiles" },
  { code: "DUCATI", label: "Ducati" },
  { code: "FERRARI", label: "Ferrari" },
  { code: "FIAT", label: "Fiat" },
  { code: "FORD", label: "Ford" },
  { code: "HONDA", label: "Honda" },
  { code: "HYUNDAI", label: "Hyundai" },
  { code: "INFINITI", label: "Infiniti" },
  { code: "IVECO", label: "Iveco" },
  { code: "JEEP", label: "Jeep" },
  { code: "KIA", label: "Kia" },
  { code: "LADA", label: "Lada" },
  { code: "LAMBORGHINI", label: "Lamborghini" },
  { code: "MAN", label: "MAN" },
  { code: "MASERATI", label: "Maserati" },
  { code: "MAZDA", label: "Mazda" },
  { code: "MCLAREN", label: "McLaren" },
  { code: "MG", label: "MG" },
  { code: "MINI", label: "Mini" },
  { code: "MITSUBISHI", label: "Mitsubishi" },
  { code: "NISSAN", label: "Nissan" },
  { code: "OPEL", label: "Opel" },
  { code: "PEUGEOT", label: "Peugeot" },
  { code: "PIAGGIO", label: "Piaggio" },
  { code: "POLESTAR", label: "Polestar" },
  { code: "PORSCHE", label: "Porsche" },
  { code: "RAM", label: "Ram" },
  { code: "RENAULT", label: "Renault" },
  { code: "RIMAC", label: "Rimac" },
  { code: "ROLLS_ROYCE", label: "Rolls-Royce" },
  { code: "SCANIA", label: "Scania" },
  { code: "SEAT", label: "SEAT" },
  { code: "SKODA", label: "Škoda" },
  { code: "SUBARU", label: "Subaru" },
  { code: "SUZUKI", label: "Suzuki" },
  { code: "TESLA", label: "Tesla" },
  { code: "TOYOTA", label: "Toyota" },
  { code: "VOLKSWAGEN", label: "Volkswagen" },
  { code: "VOLVO", label: "Volvo" },
];

const BY_CODE = new Map(ENTRIES.map((e) => [e.code, e.label]));

export const BEM_MARCA_VEICULO_OPTIONS: SelectOption[] = [
  { value: "", label: "Selecione a marca" },
  ...[...ENTRIES].sort((a, b) => a.label.localeCompare(b.label, "pt-BR")).map((e) => ({
    value: e.code,
    label: e.label,
  })),
];

export function marcaVeiculoLabel(code: string | null | undefined): string {
  const c = (code ?? "").trim().toUpperCase();
  return BY_CODE.get(c) ?? code ?? "";
}

export function normalizeMarcaVeiculoCode(input: string | null | undefined): string {
  const raw = (input ?? "").trim();
  if (!raw) return "";
  const upper = raw.toUpperCase().replace(/\s+/g, "_");
  if (BY_CODE.has(upper)) return upper;
  const fromLabel = ENTRIES.find((e) => e.label.toLowerCase() === raw.toLowerCase());
  return fromLabel?.code ?? raw;
}
