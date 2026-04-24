# Integracao - Ajuste de Video no Painel do Vendedor e Admin

## Objetivo

Garantir que anuncios com video sejam exibidos corretamente:

- no painel do vendedor (`/painel-vendedor/meus-anuncios`)
- no painel admin marketplace (`/admin/marketplace/anuncios`)

## Problema observado

Mesmo com videos chegando da API, a UI dos painéis priorizava fluxo de fotos e podia esconder o video em cenarios como:

- anuncio com apenas video (sem foto)
- fallback automatico forcando imagem placeholder

Resultado: o anuncio parecia sem midia util no card/detalhe, apesar de haver video.

## Ajuste aplicado

Arquivo alterado:

- `app/(private-routes)/admin/marketplace/anuncios/admin-marketplace-anuncios-content.tsx`

Esse componente e reutilizado tanto no painel do vendedor quanto no admin.

### 1) Carrossel com midia mista

O `PhotoCarousel` foi evoluido para suportar:

- `photos: string[]`
- `videos?: string[]`

Passou a montar uma lista unica de midias (foto + video) e renderizar conforme tipo:

- foto -> `next/image`
- video -> `<video controls preload="metadata">`

### 2) Lightbox

No modo ampliado, o componente tambem renderiza:

- imagem com `Image` quando for foto
- player de video quando for video

### 3) Labels e navegacao

Textos de acessibilidade e navegacao foram generalizados de "Foto" para "Midia".

## Ajuste no mapeamento de dados

Nos mapeamentos de API para linha da tela:

- `mapSellerApiToRow`
- `mapAdminApiToRow`

foi removido o fallback que forçava `fotos` com placeholder quando nao havia foto real.

Agora:

- `fotos` pode vir vazio
- `videoUrls` pode conter itens validos
- o carrossel exibe video mesmo sem foto

## Impacto esperado

- Anuncio com foto e video: ambos aparecem no carrossel.
- Anuncio apenas com video: video aparece normalmente no card e no detalhe.
- Fluxo de moderacao/edicao nao muda; apenas exibicao de midia.

## Compatibilidade com backend

A API ja retorna `tipo` da midia (`FOTO`/`VIDEO`) e `url`.
O frontend agora respeita essa informacao de ponta a ponta nos dois painéis.

## Validacao

- Ajuste validado no arquivo alterado sem novos erros locais de lint.
- Projeto possui avisos/erros preexistentes em outros arquivos nao relacionados.
