# Integracao - Patch de Edicao de Anuncio + Acoes do Vendedor

Este guia cobre 3 fluxos no painel do vendedor:

1. editar anuncio e anexar **novas imagens/videos** no PATCH;
2. suspender o proprio anuncio;
3. excluir o proprio anuncio.

---

## 1) Regras gerais

- Todos os endpoints abaixo exigem `Authorization: Bearer <token>`.
- Todos atuam somente sobre anuncios do vendedor autenticado (`/meus/{id}`).
- Em caso de erro, backend retorna o formato padrao:

```json
{
  "timestamp": "2026-04-23T16:00:00Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Anúncio não encontrado.",
  "code": "INVALID_ARGUMENT",
  "path": "/marketplace/anuncios/meus/{id}"
}
```

---

## 2) PATCH editar anuncio com novas midias

Endpoint:

- `PATCH /marketplace/anuncios/meus/{id}`

## 2.1 Como funciona o campo novo

No request de edicao existe agora:

- `midiasAdicionar: AnuncioMidiaRequest[]` (opcional)

Cada item possui:

- `tipo` (`TipoMidiaAnuncio`)
- `arquivo` (obrigatorio, deve ser o `objectKey` do upload)
- `ordem` (obrigatorio no contrato, pode enviar `0`)

Importante:

- as midias enviadas em `midiasAdicionar` sao **acrescentadas** nas ja existentes;
- backend recalcula ordem sequencial apos a ultima existente;
- portanto, no frontend pode enviar `ordem: 0` para todos os novos itens.

---

## 2.2 Fluxo correto para adicionar novas imagens/videos

1. Gerar URL de upload:
   - `POST /marketplace/anuncios/midias/upload-url`
2. Fazer upload direto no storage (R2) com a `uploadUrl`.
3. Pegar o `objectKey` retornado (campo `objectKey` da resposta de upload).
4. Chamar PATCH do anuncio com `midiasAdicionar` usando esse `objectKey` em `arquivo`.

---

## 2.3 Exemplo de request PATCH

```json
{
  "preco": 89900.00,
  "descricao": "Veiculo revisado e pronto para transferencia.",
  "midiasAdicionar": [
    {
      "tipo": "FOTO",
      "arquivo": "marketplace/anuncios/usuario-id/1716482730000-foto-uuid.jpg",
      "ordem": 0
    },
    {
      "tipo": "VIDEO",
      "arquivo": "marketplace/anuncios/usuario-id/1716482740000-video-uuid.mp4",
      "ordem": 0
    }
  ]
}
```

---

## 2.4 Resposta esperada

Retorna `AnuncioResponse` atualizado (com as midias antigas + novas).

---

## 2.5 Boas praticas no frontend

- Nao envie `midiasAdicionar` se nao houver novas midias.
- Faça `trim` no `arquivo` antes de enviar.
- Se upload falhar, nao envie item parcial no PATCH.
- Atualize a lista local de midias com a resposta do PATCH (source of truth).

---

## 3) Suspender o proprio anuncio

Endpoint:

- `PATCH /marketplace/anuncios/meus/{id}/suspender`

Body:

- opcional
- pode enviar motivo

Exemplo:

```json
{
  "motivo": "Vou pausar temporariamente para ajustar o valor."
}
```

Resposta:

- `AnuncioStatusResponse`

Exemplo:

```json
{
  "id": "a4b6f8e4-ef9b-4a7b-88b6-bd0e49e7ecb8",
  "status": "SUSPENSO",
  "mensagem": "Anúncio suspenso com sucesso.",
  "motivo": "Vou pausar temporariamente para ajustar o valor.",
  "atualizadoEm": "2026-04-23T16:15:21.321-03:00"
}
```

Observacoes:

- so anuncios `PENDENTE` ou `PUBLICADO` podem ser suspensos;
- se ja estiver `SUSPENSO`, backend retorna erro 400.

---

## 4) Excluir o proprio anuncio

Endpoint:

- `DELETE /marketplace/anuncios/meus/{id}`

Body:

- nao possui body.

Resposta:

- sucesso sem payload (HTTP 200 com corpo vazio).

Observacoes:

- somente o vendedor dono pode excluir;
- se o anuncio nao pertencer ao vendedor (ou nao existir), retorna erro.

---

## 5) Contratos de tipos sugeridos (frontend)

```ts
type AnuncioMidiaRequest = {
  tipo: "FOTO" | "VIDEO";
  arquivo: string; // objectKey
  ordem: number;   // pode enviar 0 em novos anexos
};

type EditarAnuncioRequest = {
  marca?: string;
  modelo?: string;
  preco?: number;
  cidade?: string;
  tipo?: string;
  condicao?: string;
  ano?: number;
  quilometragem?: number;
  combustivel?: string;
  cambio?: string;
  finalChassi?: string;
  cor?: string;
  blindado?: boolean;
  placaVeiculo?: string;
  descricao?: string;
  detalheTecnico?: Record<string, unknown>;
  midiasAdicionar?: AnuncioMidiaRequest[];
};

type AnuncioStatusResponse = {
  id: string;
  status: "PENDENTE" | "PUBLICADO" | "SUSPENSO";
  mensagem: string;
  motivo?: string | null;
  atualizadoEm: string;
};
```

---

## 6) Checklist de implementacao

- [ ] Ajustar tipo `EditarAnuncioRequest` para suportar `midiasAdicionar`.
- [ ] Implementar fluxo de upload antes do PATCH (gerar URL -> upload -> usar `objectKey`).
- [ ] Enviar novas midias em `midiasAdicionar`.
- [ ] Implementar acao de suspender: `PATCH /meus/{id}/suspender`.
- [ ] Implementar acao de excluir: `DELETE /meus/{id}`.
- [ ] Tratar erros 400 de negocio com feedback amigavel.
- [ ] Atualizar tela apos acao (refetch de anuncio/listagem).

