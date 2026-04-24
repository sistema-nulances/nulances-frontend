# Integracao - Ajuste de Video em Anuncios

## Contexto

Foi corrigido no backend um problema em que videos anexados ao anuncio nao apareciam na listagem publica.

O comportamento incorreto impactava principalmente:

- `GET /marketplace/anuncios`
- `GET /marketplace/anuncios?busca=...`

No detalhe do anuncio (`GET /marketplace/anuncios/{id}`), as midias ja eram retornadas corretamente, incluindo video.

## Causa raiz

No mapper de resposta publica de anuncios, havia um filtro que mantinha somente midias com tipo `FOTO`.

Com isso, mesmo que o vendedor cadastrasse video normalmente, a listagem publica descartava os itens com tipo `VIDEO`.

## Ajuste aplicado no backend

Arquivo alterado:

- `src/main/java/com/Nulances/mapper/AnuncioMapper.java`

Mudanca:

- Remocao do filtro por `TipoMidiaAnuncio.FOTO` em `toPublicoListResponse`.
- A lista de midias publicas agora inclui foto e video, mantendo ordenacao por `ordem`.
- O campo `tipo` continua no payload para o frontend diferenciar renderizacao (`FOTO` x `VIDEO`).

## Impacto para o frontend

### 1) Listagem publica e busca

Agora as respostas de listagem e busca podem conter itens de midia com:

- `tipo: "FOTO"`
- `tipo: "VIDEO"`

Portanto, no card/lista, o frontend deve tratar ambos os tipos ao montar a galeria/preview.

### 2) Detalhe do anuncio

Sem mudanca de contrato, mas reforco:

- `GET /marketplace/anuncios/{id}` ja retorna foto e video.
- O frontend pode reutilizar o mesmo renderer baseado no campo `tipo`.

## Exemplo de payload de midia

```json
{
  "tipo": "VIDEO",
  "arquivo": "marketplace/anuncios/<user-id>/1713900000000-video-<uuid>.mp4",
  "url": "https://...assinada...",
  "ordem": 2
}
```

## Recomendacoes de renderizacao no frontend

- Se `tipo === "FOTO"`, renderizar com `<img>`.
- Se `tipo === "VIDEO"`, renderizar com `<video controls preload="metadata">`.
- Preservar ordenacao por `ordem` para manter consistencia da galeria.

## Status

- Ajuste implementado no backend.
- Compilacao validada com sucesso.
