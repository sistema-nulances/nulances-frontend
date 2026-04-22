import type { SimpleIcon } from "simple-icons";
import {
  siAcura,
  siAstonmartin,
  siAudi,
  siBentley,
  siBmw,
  siBugatti,
  siCadillac,
  siChevrolet,
  siChrysler,
  siCitroen,
  siDacia,
  siDaf,
  siDucati,
  siDsautomobiles,
  siFerrari,
  siFiat,
  siFord,
  siHonda,
  siHyundai,
  siInfiniti,
  siIveco,
  siJeep,
  siKia,
  siLamborghini,
  siLada,
  siMaserati,
  siMazda,
  siMclaren,
  siMini,
  siMan,
  siMg,
  siMitsubishi,
  siNissan,
  siOpel,
  siPeugeot,
  siPiaggiogroup,
  siPolestar,
  siPorsche,
  siRam,
  siRenault,
  siRimacautomobili,
  siRollsroyce,
  siScania,
  siSeat,
  siSkoda,
  siSubaru,
  siSuzuki,
  siTesla,
  siToyota,
  siVolkswagen,
  siVolvo,
} from "simple-icons";

/**
 * Mercedes-Benz não está mais no `simple-icons` (removido por política do projeto).
 * Path viewBox 0 0 24 24 herdado da versão CC0 anterior do simple-icons (v12).
 */
const MERCEDES_BENZ_ICON: SimpleIcon = {
  title: "Mercedes-Benz",
  slug: "mercedes",
  svg: "",
  path: "M12 0c6.623 0 12 5.377 12 12s-5.377 12-12 12S0 18.623 0 12 5.377 0 12 0zM3.245 17.539A10.357 10.357 0 0012 22.36c3.681 0 6.917-1.924 8.755-4.821L12 14.203zm10.663-6.641l7.267 5.915A10.306 10.306 0 0022.36 12c0-5.577-4.417-10.131-9.94-10.352zm-2.328-9.25C6.057 1.869 1.64 6.423 1.64 12c0 1.737.428 3.374 1.185 4.813l7.267-5.915z",
  source: "https://www.mercedes-benz.com",
  hex: "242424",
};

/** Frases no início do nome (normalizado), da mais específica para a mais curta. */
const PREFIX_ICONS: Array<{ prefix: string; icon: SimpleIcon }> = [
  { prefix: "aston martin", icon: siAstonmartin },
  { prefix: "rolls royce", icon: siRollsroyce },
  { prefix: "rolls-royce", icon: siRollsroyce },
  { prefix: "mercedes benz", icon: MERCEDES_BENZ_ICON },
];

const WORD_TO_ICON: Record<string, SimpleIcon> = {
  acura: siAcura,
  audi: siAudi,
  bentley: siBentley,
  bmw: siBmw,
  bugatti: siBugatti,
  cadillac: siCadillac,
  chevrolet: siChevrolet,
  chevy: siChevrolet,
  chrysler: siChrysler,
  citroen: siCitroen,
  citroën: siCitroen,
  dacia: siDacia,
  daf: siDaf,
  ducati: siDucati,
  ds: siDsautomobiles,
  ferrari: siFerrari,
  fiat: siFiat,
  ford: siFord,
  honda: siHonda,
  hyundai: siHyundai,
  infiniti: siInfiniti,
  iveco: siIveco,
  jeep: siJeep,
  kia: siKia,
  lamborghini: siLamborghini,
  lada: siLada,
  maserati: siMaserati,
  mazda: siMazda,
  mercedes: MERCEDES_BENZ_ICON,
  "mercedes-benz": MERCEDES_BENZ_ICON,
  mercedesbenz: MERCEDES_BENZ_ICON,
  mclaren: siMclaren,
  mini: siMini,
  mitsubishi: siMitsubishi,
  nissan: siNissan,
  opel: siOpel,
  peugeot: siPeugeot,
  piaggio: siPiaggiogroup,
  polestar: siPolestar,
  porsche: siPorsche,
  ram: siRam,
  renault: siRenault,
  rimac: siRimacautomobili,
  scania: siScania,
  seat: siSeat,
  skoda: siSkoda,
  subaru: siSubaru,
  suzuki: siSuzuki,
  tesla: siTesla,
  toyota: siToyota,
  volkswagen: siVolkswagen,
  vw: siVolkswagen,
  volvo: siVolvo,
  /** Caminhões / utilitários */
  man: siMan,
  mg: siMg,
};

function normalizeNome(nome: string): string {
  return nome
    .trim()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase();
}

/**
 * Resolve o ícone Simple Icons a partir do nome do bem (ex.: primeira palavra da montadora).
 */
export function resolveBemMarcaIcon(nome: string): SimpleIcon | null {
  const n = normalizeNome(nome);
  if (!n) return null;

  for (const { prefix, icon } of PREFIX_ICONS) {
    if (n === prefix || n.startsWith(`${prefix} `)) {
      return icon;
    }
  }

  const rawFirst = n.split(/\s+/)[0]?.replace(/[^a-z0-9-]/g, "") ?? "";
  if (!rawFirst) return null;

  return WORD_TO_ICON[rawFirst] ?? null;
}

/**
 * Usa o campo `marca` quando existir; caso contrário deduz pelo nome completo.
 */
export function resolveBemMarcaIconFromMarca(marca: string | null | undefined, nomeFallback: string): SimpleIcon | null {
  const raw = (marca ?? "").trim();
  const n = normalizeNome(raw.replace(/-/g, " ").replace(/_/g, " "));
  if (n) {
    for (const { prefix, icon } of PREFIX_ICONS) {
      if (n === prefix || n.startsWith(`${prefix} `)) {
        return icon;
      }
    }
    const first = n.split(/\s+/)[0]?.replace(/[^a-z0-9-]/g, "") ?? "";
    if (first && WORD_TO_ICON[first]) return WORD_TO_ICON[first];
  }
  return resolveBemMarcaIcon(nomeFallback);
}

/** Título oficial Simple Icons (ex.: "Bentley") — mesma heurística de `resolveBemMarcaIcon`. */
export function inferMarcaDisplayTitleFromNome(nome: string): string {
  const icon = resolveBemMarcaIcon(nome.trim());
  return icon?.title?.trim() ?? "";
}
