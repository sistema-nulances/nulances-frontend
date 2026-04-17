import type { SelectOption } from "@/components/ui/select";
import municipiosBrasilOptions from "./municipios-brasil-options.json";

/** Municípios do Brasil (IBGE), formato exibido: `Nome - UF`. Atualize `municipios-brasil-options.json` se precisar regenerar. */
export const CIDADES_BRASIL_OPTIONS: SelectOption[] = municipiosBrasilOptions;
