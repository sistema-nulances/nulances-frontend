# Integracao de Link de Live no Leilao

Este documento descreve como o frontend deve consumir o novo campo opcional `linkLive` no modulo de leiloes.

Objetivo:

- permitir que o admin informe um link de transmissao ao criar leilao;
- exibir o link/live na tela interna do leilao quando existir;
- manter compatibilidade com leiloes sem live.

---

## 1) Regra de negocio

- O campo de live e **opcional**.
- Quando informado, deve ser uma URL valida com protocolo `http` ou `https`.
- Caso nao seja informado, o backend salva como `null`.
- O link e retornado nas respostas de leilao e no painel do leilao.

---

## 2) Onde o campo foi adicionado

- Entidade backend: `Leilao.linkLive`
- Request de criacao: `LeilaoCreateRequest.linkLive`
- Response de leilao: `LeilaoResponse.linkLive`
- Response do painel: `LeilaoPainelResponse.linkLive`

---

## 3) Endpoints impactados

## 3.1 Criar leilao (ADMIN)

`POST /admin/leiloes`

### Request (resumo)

```json
{
  "titulo": "Leilao de Veiculos Premium",
  "linkLive": "https://www.youtube.com/watch?v=abc123XYZ",
  "formato": "ONLINE",
  "cidade": "Sao Paulo",
  "endereco": null,
  "leiloeiroId": "f9d29a44-4df0-46f2-9f52-f801d277f1aa",
  "comitenteId": "45beabdc-7fbc-4e4b-a7b7-4a7166a3258d",
  "lotes": [
    {
      "loteId": "6fc3d6d1-31c8-4f46-a6a7-b547a6ad4c0b",
      "bens": [
        {
          "bemId": "f1b724f8-c2aa-49a9-8bf3-c68de1c233b7",
          "valorInicial": 10000.00,
          "incrementoMinimo": 500.00,
          "aberturaDisputa": "2026-05-01T14:00:00Z",
          "encerramentoDisputa": "2026-05-01T14:10:00Z"
        }
      ]
    }
  ]
}
```

### Observacoes

- `linkLive` pode ser omitido:
  - backend salva `null`;
  - frontend nao deve quebrar UI.
- Se for enviado vazio (`""`) ou espacos, backend trata como `null`.

### Validacao do backend

Se `linkLive` for invalido, retorna erro `400` com mensagem:

- `Link da live inválido. Informe uma URL válida.`
- ou `Link da live inválido. Use URL http ou https.`

---

## 3.2 Listagem/detalhe de leiloes (publico e admin)

Endpoints que retornam `LeilaoResponse`:

- `GET /leiloes`
- `GET /leiloes/{id}`
- `GET /admin/leiloes`
- `GET /admin/leiloes/{id}`

Agora o payload inclui:

```json
{
  "id": "1e8f8ca0-9a32-4ec1-a1ce-56b9a0f7f04d",
  "titulo": "Leilao de Veiculos Premium",
  "linkLive": "https://www.youtube.com/watch?v=abc123XYZ",
  "formato": "ONLINE",
  "...": "..."
}
```

---

## 3.3 Painel do leilao (onde mostrar a live)

Endpoints:

- `GET /leiloes/{id}/painel`
- `GET /admin/leiloes/{id}/painel`

Agora o payload inclui:

```json
{
  "leilaoId": "1e8f8ca0-9a32-4ec1-a1ce-56b9a0f7f04d",
  "titulo": "Leilao de Veiculos Premium",
  "linkLive": "https://www.youtube.com/watch?v=abc123XYZ",
  "status": "AO_VIVO",
  "...": "..."
}
```

Esse e o endpoint recomendado para renderizar a live na tela interna do leilao.

---

## 4) Estrategia recomendada de UI

## 4.1 Formulario admin (criacao de leilao)

- Adicionar campo opcional: **Link da live (YouTube)**.
- Placeholder sugerido:
  - `https://www.youtube.com/watch?v=...`
  - `https://youtu.be/...`
- Antes de enviar:
  - aplicar `trim`;
  - se vazio, enviar `null` ou omitir campo.

## 4.2 Tela do leilao (publica/admin)

- Se `linkLive` vier `null`, ocultar bloco de video.
- Se `linkLive` existir:
  - exibir player embutido (quando YouTube) ou botao “Assistir live”.
  - manter fallback para abrir em nova aba.

---

## 5) Integracao com YouTube (frontend)

O backend armazena URL generica. O frontend deve converter para embed quando for YouTube.

## 5.1 URLs comuns aceitas para YouTube

- `https://www.youtube.com/watch?v=VIDEO_ID`
- `https://youtu.be/VIDEO_ID`
- `https://www.youtube.com/live/VIDEO_ID`

## 5.2 Exemplo de utilitario (React/TS)

```ts
export function extractYouTubeVideoId(url: string): string | null {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace("www.", "");

    if (host === "youtube.com" || host === "m.youtube.com") {
      const watchId = parsed.searchParams.get("v");
      if (watchId) return watchId;

      const parts = parsed.pathname.split("/").filter(Boolean);
      // /live/{id}
      if (parts[0] === "live" && parts[1]) return parts[1];
    }

    if (host === "youtu.be") {
      const parts = parsed.pathname.split("/").filter(Boolean);
      if (parts[0]) return parts[0];
    }

    return null;
  } catch {
    return null;
  }
}

export function buildYouTubeEmbedUrl(videoId: string): string {
  return `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`;
}
```

## 5.3 Exemplo de renderizacao segura de iframe

```tsx
const videoId = linkLive ? extractYouTubeVideoId(linkLive) : null;

{videoId ? (
  <iframe
    title="Live do leilao"
    src={buildYouTubeEmbedUrl(videoId)}
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
    referrerPolicy="strict-origin-when-cross-origin"
    allowFullScreen
  />
) : linkLive ? (
  <a href={linkLive} target="_blank" rel="noopener noreferrer">
    Assistir live
  </a>
) : null}
```

---

## 6) Tratamento de erros (frontend)

Formato padrao de erro da API:

```json
{
  "timestamp": "2026-04-22T18:00:00Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Link da live inválido. Use URL http ou https.",
  "code": "INVALID_ARGUMENT",
  "path": "/admin/leiloes"
}
```

Recomendacao:

- Exibir `message` diretamente no formulario de criacao/edicao.
- Nao fazer retry automatico para erro de validacao (400).

---

## 7) Checklist de implementacao frontend

- [ ] Adicionar campo opcional `linkLive` no formulario de criacao de leilao (admin).
- [ ] Enviar `linkLive` no payload de `POST /admin/leiloes`.
- [ ] Incluir `linkLive` no tipo/interface de `LeilaoResponse`.
- [ ] Incluir `linkLive` no tipo/interface de `LeilaoPainelResponse`.
- [ ] Renderizar bloco de live somente quando houver `linkLive`.
- [ ] Implementar parser para links YouTube e embed quando possivel.
- [ ] Implementar fallback para abrir o link em nova aba.
- [ ] Exibir erro de validacao retornado pelo backend.

---

## 8) Compatibilidade com dados antigos

- Leiloes antigos nao terao `linkLive` preenchido.
- Frontend deve sempre tratar esse campo como opcional/nullable.
- Nao assuma que todo leilao tem live.

