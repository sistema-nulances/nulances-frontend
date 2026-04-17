# NuLances Frontend - Design Context

Este documento consolida os padrões atuais do design usados no app (principalmente via Tailwind classes + algumas variáveis CSS). Ele existe para manter contexto ao implementar/ajustar UI sem “inventar” novos valores.

## Fonte

- Família: `Vend Sans` carregada via `next/font/google`.
- Variável CSS: `--font-vend-sans`.
- Aplicação global: `body` usa `font-family: var(--font-vend-sans), Helvetica, sans-serif`.
- Pesos suportados: `300, 400, 500, 600, 700`.

## Paleta (tokens CSS)

Tokens definidos em `app/globals.css`:

- `--background`: `#fafafa` (light/dark via `prefers-color-scheme: dark`)
- `--foreground`: `#171717` (light) / `#ededed` (dark)
- `--border`: `#e5e7eb`
- `--muted`: `#f5f5f5`
- `--muted-foreground`: `#6b7280`
- `--nulance-purple`: `#63146c` (cor principal/brand)
- `--nulance-yellow`: `#f1af00` (cor de destaque)
- `--ring`: `rgba(99, 20, 108, 0.18)` (usada em foco/outline)

Além disso, o projeto usa intensamente as escalas padrão do Tailwind (ex.: `zinc-*`, `slate-*`, `amber-*`, `emerald-*`) para detalhes e estados.

## Efeitos e foco (acessibilidade visual)

- Botões (`Button`):
  - Foco: `focus-visible:ring-4 focus-visible:ring-[var(--ring)]`.
  - Disabled: `disabled:pointer-events-none disabled:opacity-50`.
  - Hover em variações: usa `hover:opacity-95` no brand e backgrounds `zinc-*`/`gray-*` conforme a variante.
- Inputs (`Input`):
  - Wrapper: `focus-within:border-[var(--nulance-purple)] focus-within:ring-4 focus-within:ring-[var(--ring)]`.
  - Erro: `border-red-500 focus-within:ring-4 focus-within:ring-red-100`.

## Sistema de Arredondamento (Radius)

O projeto segue uma “hierarquia” simples de raio:

- Controles circulares / pílulas:
  - `rounded-full` (botões, input, avatar, badges, ícones dentro de botões)
- Cards e “blocos” com cantos mais suaves:
  - `rounded-2xl` (ex.: `AccordionItem`)
  - `rounded-3xl` (ex.: blocos maiores e seções no `AuctionDetail`, `Profile`, `Documents`)
  - `rounded-[22px]` (ex.: áreas internas em componentes como cards)
  - `rounded-[28px]` (ex.: `AuctionCard`)
  - `rounded-xl` (ex.: caixinhas menores, botões de seleção tipo “tab” e content interno)
  - `rounded-md` (ex.: container do banner)
- Painel lateral (Sheet):
  - Cantos do lado externo: `rounded-l-[28px]` ou `rounded-r-[28px]` (dependendo do `side`)
  - Largura padrão do painel: `max-w-[360px]`
- Popovers/menus:
  - `DropdownMenuContent`: `rounded-[22px]`
  - `DropdownMenuItem`: `rounded-[16px]`
  - Wrapper decorativo (em usos do menu): `rounded-[18px]`
- Tooltip:
  - `rounded-md`
- Componentes especiais:
  - `LicensePlate`: `rounded-[6px]` com `border-[3px]`

## Tipografia (tamanhos e estilo)

Como o projeto usa Tailwind com tamanhos explícitos (`text-[...]`) em várias telas, estes são os tamanhos mais recorrentes observados:

- Texto pequeno de rótulos/indicadores: `text-[11px]`, `text-[12px]`, `text-[13px]`
- Texto de conteúdo padrão: `text-[14px]`, `text-[15px]`, `text-[16px]`, `text-[17px]`
- Títulos de cards: `text-[24px]` (ex.: `AuctionCard`), com `leading-[1.08]` e `tracking-[-0.04em]`

Padrões de peso e espaçamento usados com frequência:

- `font-medium`, `font-semibold`, `font-bold`
- tracking típico:
  - `tracking-[-0.02em]` / `tracking-[-0.04em]` em títulos
  - `tracking-[0.04em]`, `tracking-widest` em badges/labels

## Spacing / Padding (padrões práticos por componente)

### Containers de página

- Header:
  - Wrapper: `h-20.5` e `px-8`
  - Barra: `border-b border-zinc-200 bg-white`
- Home e seções:
  - Ex.: `HomeCategoriesTabs` usa `max-w-[1720px] px-4 md:px-6`
- Padrão Auth (Login/Register/Forgot):
  - `main`: `flex flex-1 flex-col items-center justify-center px-4 py-16 sm:px-6 lg:px-8`
  - Card central: `w-full max-w-[440px] / max-w-[480px] / max-w-110 rounded-2xl bg-white p-8 ring-1 ring-zinc-200/50 sm:p-10`
- Padrão Pages com conteúdo em “background”:
  - Geral: `bg-[var(--background)]` (cinza muito claro que tende ao “quase branco”) com containers `max-w-375 px-4 sm:px-6 lg:px-8`
- Footer:
  - Fundo: `bg-[var(--background)]`
  - Padding: `pt-16 pb-8`
  - Container: `max-w-7xl px-4 md:px-8 xl:max-w-430`

### Page Header (Title + Subtitle)

Componente padrão para cabeçalho de páginas internas:

- Arquivo: `components/ui/page-header.tsx`
- Uso recomendado: no topo do conteúdo principal (`main`) das páginas
- Estrutura:
  - `title` obrigatório (renderiza em `h1`)
  - `subtitle` opcional
  - `className` opcional para ajustes pontuais
- Estilo padrão:
  - Wrapper: `mb-6`
  - Título: `text-[26px] font-bold leading-tight text-zinc-900`
  - Subtítulo: `mt-1 text-sm text-zinc-500`
- Regra de consistência:
  - Em páginas padronizadas, sempre usar `PageHeader` para manter hierarquia visual e espaçamentos consistentes.

### Button (`components/ui/button.tsx`)

Alturas e paddings (todos com `rounded-full`):

- `size="sm"`: `h-8` (32px), `px-3`, `text-sm`
- `size="md"`: `h-10` (40px), `px-4`, `text-sm`
- `size="lg"`: `h-11` (44px), `px-5`, `text-base`
- `size="icon"`: `h-10 w-10`, sem `px`
- Variantes especiais do Header:
  - `header-icon`: `h-[44px] w-[44px] rounded-full`
  - `header-search`: `h-[44px] rounded-full pl-3.5 pr-3`
  - `header-user`: `h-[40px] rounded-full px-3`

### Input (`components/ui/input.tsx`)

- Wrapper: `h-10 w-full rounded-full border px-3`
- Ícones: `gap-2`
- Texto: `text-sm`
- Placeholders: `placeholder:text-zinc-400`

### Tabs (`components/ui/tabs.tsx`)

- `TabsList`: `border-zinc-200 bg-white`
- Trigger:
  - Com ícone: `px-6 py-4`
  - Sem ícone: `px-8 py-5`
  - Badge/ícone circular: `h-12 w-12 rounded-full`

### Accordion (`components/ui/accordion.tsx`)

- Item externo: `mb-4 overflow-hidden rounded-2xl border border-zinc-200 bg-white`
- Cabeçalho (button): `px-6 py-4` e `text-lg font-semibold`
- Conteúdo expandido: `bg-white px-6 py-4`

### Sheet (`components/ui/sheet.tsx`)

- Overlay: `bg-black/30`
- Content:
  - Painel: `max-w-[360px]` e borda no lado colado (`border-r`/`border-l`)
  - Cantos externos: `rounded-r-[28px]` / `rounded-l-[28px]`
  - Header interno (por padrão): `px-4 pt-4`
  - Corpo: `px-4 pb-5` (pode ser sobreposto via `className` no uso)
- Botão de fechar: `h-10 w-10 rounded-full`

### DropdownMenu (`components/ui/dropdown-menu.tsx`)

- Popover:
  - `absolute top-[calc(100%+12px)]`
  - `min-w-70 overflow-hidden rounded-[22px] border ... bg-white/95 p-2`
  - Backdrop blur: `backdrop-blur-xl`
- Itens:
  - Item: `rounded-[16px] px-3.5 py-3`
  - Ícone do item: `h-10 w-10 rounded-full border ...`
  - Label do menu: `px-3.5 pb-2 pt-2 text-[11px] uppercase tracking-[0.14em]`

### Tooltip (`components/ui/tooltip.tsx`)

- Tooltip: `rounded-md bg-zinc-900 px-2.5 py-1.5 text-xs font-semibold text-white`
- Flecha: `border-[5px]` com cores `zinc-900`

### Toast (`components/ui/toast.tsx`)

- Toast item: `rounded-full border px-4 py-2.5`
  - Título: `text-[13px] font-semibold leading-none`
  - Descrição: `text-[12px]`
- Container (provider): `fixed top-6 left-1/2 -translate-x-1/2 z-50 p-4 ... max-w-md`

## Referências rápidas (rules de consistência)

- Para botões, use `Button` com `variant` e `size` ao invés de criar “botões do zero”.
- Para inputs de formulário, use o `Input` (o raio/padding já estão padronizados).
- Quando for criar cards:
  - tente `rounded-[28px]` (estilo home) ou `rounded-2xl` (estilo accordion)
  - para seções maiores, use `rounded-3xl bg-white p-6 sm:p-8 ring-1 ring-zinc-200` (padrão visto no `AuctionDetail` e `Profile/Documents`)
- Quando for criar seções laterais/modais:
  - respeite os cantos do `Sheet` (`28px` no lado externo).

## Direção visual (menos "shadcn", mais NuLances)

Para novas telas e refactors, priorizar uma estética menos “encaixotada”:

- Evitar padrão de “card dentro de card” com bordas cinzas repetidas.
- Evitar blocos com múltiplos `ring-1 ring-zinc-200` aninhados.
- Evitar aparência “template genérico” (`bg-zinc-50` + border em todos os níveis).

### Princípio de superfícies soltas

- Estrutura preferida:
  - 1 superfície principal para o bloco (`rounded-3xl bg-white p-6 sm:p-8`).
  - Conteúdo interno com `space-y-*`, separadores (`border-t border-zinc-100`) e contraste tipográfico.
  - Estados e agrupamentos por espaço/alinhos, não por caixas extras.
- Quando precisar destacar preço, resumo ou CTA:
  - usar tipografia + espaçamento + fundo leve opcional (`bg-zinc-50/60`) sem nova borda obrigatória;
  - manter no máximo uma “moldura” dominante por área.

### Sidebar / bloco de ação

- Padrão preferido:
  - sem “caixa externa + caixa interna”;
  - título/label pequeno, valor em destaque, metadados abaixo;
  - CTA principal (brand) e ação secundária com `variant="ghost"` ou `variant="outline"` leve;
  - separar seções com linhas finas (`border-t border-zinc-100`) em vez de novos cards.

### Checklist rápido de revisão visual

- Existe mais de uma borda forte na mesma área? Simplifique.
- Dá para remover uma caixa e manter leitura por spacing? Remova.
- O bloco parece componente genérico de biblioteca? Adicione assinatura NuLances:
  - peso tipográfico de títulos,
  - uso intencional de `--nulance-purple`,
  - transições/hovers discretos,
  - menos “moldura”, mais composição.

## Componentes “de interface” (cards, pills e upload)

### Padrão de Card / Superfície

- Card “compacto”:
  - `rounded-2xl border border-zinc-200 bg-white p-4` (muito usado em blocos de informação e cards de lista)
- Card “seção” (conteúdo maior):
  - `rounded-3xl bg-white p-6 sm:p-8 ring-1 ring-zinc-200` (visto em `AuctionDetail` e `Profile/Documents`)
- Card “com borda leve”:
  - `rounded-2xl bg-white p-6 ring-1 ring-zinc-200/50` (padrão em páginas de formulário centralizadas)

### Pills / Badges (status e etiquetas)

- Em geral: `inline-flex items-center rounded-full ... px-3 py-1`
- Tamanho típico:
  - `text-[11px] font-semibold uppercase tracking-wider` (lotes/status em home e detalhe)
  - `text-xs font-semibold` (status em `AuctionDetail` e listas)
- Cores:
  - Purple: `bg-nulance-purple/10` / `text-nulance-purple`
  - Zinc: `bg-zinc-100` / `text-zinc-600`
  - Emerald/Ambar/Red: `bg-*-100` + `ring-*-200` (quando houver estado forte)

### Upload / Dropzone (Documents)

- Área vazia (dropzone):
  - `rounded-2xl border-2 border-dashed border-zinc-200 bg-zinc-50 py-10`
  - hover: `hover:border-nulance-purple/50 hover:bg-nulance-purple/5`
- Área com arquivo (arquivo selecionado):
  - `rounded-2xl border border-emerald-200 bg-emerald-50 p-4`

