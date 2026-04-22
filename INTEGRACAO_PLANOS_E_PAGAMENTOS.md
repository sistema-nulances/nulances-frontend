# Integracao de Planos e Pagamentos (Marketplace)

Este documento descreve como o frontend deve consumir o backend para:

- painel de planos do vendedor;
- assinatura de plano com checkout do Mercado Pago;
- gestao de planos no painel administrativo;
- faturamento no painel administrativo (somente ADMIN).

> Escopo atual: faturamento **nao** aparece no painel do vendedor.

---

## 1) Resumo rapido da regra de negocio

1. Usuario com role `COMUM` e aprovado como `VENDEDOR` pode acessar painel de planos.
2. Para anunciar, o vendedor precisa de assinatura de plano com pagamento confirmado.
3. O checkout e gerado no Mercado Pago e retornado como URL.
4. O webhook do Mercado Pago atualiza pagamento e ativa assinatura.
5. A cada ciclo (30 dias), backend gera renovacao.
6. Se nao pagar, assinatura fica inadimplente e anuncios do vendedor podem ser suspensos.

---

## 2) Autenticacao e autorizacao

- Todos os endpoints abaixo exigem `Authorization: Bearer <token>`, exceto webhook.
- Painel vendedor:
  - `GET /vendedor/planos`
  - `POST /vendedor/planos/assinar`
- Painel admin:
  - `GET /admin/marketplace/planos`
  - `PATCH /admin/marketplace/planos/{planoId}`
  - `GET /admin/marketplace/faturamento`
- Webhook Mercado Pago (sem auth JWT):
  - `POST /payment/webhook/mercadopago`

---

## 3) Endpoints do vendedor

## 3.1 Buscar painel de planos

`GET /vendedor/planos`

### Response (200)

```json
{
  "planosDisponiveis": [
    {
      "id": "3f6f6f8d-7a13-49d8-9f1e-46bd8f0d86be",
      "nome": "BASICO",
      "descricao": "Plano basico para comecar",
      "valorMensal": 59.90,
      "totalAnuncios": 3,
      "ativo": true
    }
  ],
  "assinaturaAtual": {
    "assinaturaId": "7f4a57f0-cf87-4c48-8e67-11af0d33f66b",
    "status": "ATIVA",
    "inicioVigencia": "2026-04-22T01:30:00Z",
    "proximaCobranca": "2026-05-22T01:30:00Z",
    "anunciosDisponiveis": 2,
    "plano": {
      "id": "3f6f6f8d-7a13-49d8-9f1e-46bd8f0d86be",
      "nome": "BASICO",
      "descricao": "Plano basico para comecar",
      "valorMensal": 59.90,
      "totalAnuncios": 3,
      "ativo": true
    }
  }
}
```

### Regras de UI

- `assinaturaAtual` pode vir `null` (vendedor sem assinatura ainda).
- `anunciosDisponiveis` deve ser exibido de forma clara no card/plano atual.
- `status` da assinatura:
  - `PENDENTE_PAGAMENTO`: mostrar CTA para pagar.
  - `ATIVA`: mostrar status ativo e data de renovacao.
  - `INADIMPLENTE`: exibir alerta de bloqueio.
  - `CANCELADA`: tratar como sem assinatura ativa.

---

## 3.2 Assinar plano

`POST /vendedor/planos/assinar`

### Request

```json
{
  "planoId": "3f6f6f8d-7a13-49d8-9f1e-46bd8f0d86be"
}
```

### Response (200)

```json
{
  "pagamentoId": "204ed596-5ea8-4865-bf6e-6aa4b4d2f925",
  "referencia": "PLANO-7A6DCA0A312B4A19",
  "checkoutUrl": "https://www.mercadopago.com.br/checkout/v1/redirect?...",
  "status": "GERADO"
}
```

### Comportamento esperado no frontend

1. Chamar endpoint com `planoId`.
2. Se sucesso, redirecionar usuario para `checkoutUrl`.
3. Ao voltar do Mercado Pago (`success/pending/failure`), recarregar `GET /vendedor/planos`.
4. Considerar que confirmacao final depende de webhook (pode haver atraso de segundos).

---

## 4) Endpoints do admin (marketplace)

## 4.1 Listar planos

`GET /admin/marketplace/planos`

### Response (200)

Lista de `PlanoAnuncioResponse[]`:

```json
[
  {
    "id": "3f6f6f8d-7a13-49d8-9f1e-46bd8f0d86be",
    "nome": "BASICO",
    "descricao": "Plano basico para comecar",
    "valorMensal": 59.90,
    "totalAnuncios": 3,
    "ativo": true
  }
]
```

---

## 4.2 Atualizar plano

`PATCH /admin/marketplace/planos/{planoId}`

### Request (campos opcionais)

```json
{
  "valorMensal": 89.90,
  "totalAnuncios": 5,
  "ativo": true
}
```

### Validacoes de backend

- `valorMensal >= 0.01`
- `totalAnuncios >= 1`

### Response (200)

Retorna o plano atualizado (`PlanoAnuncioResponse`).

---

## 4.3 Faturamento (somente ADMIN)

`GET /admin/marketplace/faturamento`

### Query params opcionais

- `vendedorId=<uuid>`: filtra faturas de um vendedor especifico.

### Response (200)

Lista de `FaturaPlanoResponse[]`:

```json
[
  {
    "pagamentoId": "204ed596-5ea8-4865-bf6e-6aa4b4d2f925",
    "referencia": "PLANO-7A6DCA0A312B4A19",
    "plano": "BASICO",
    "valor": 59.90,
    "status": "PAGO",
    "tipo": "ADESAO",
    "dataVencimento": "2026-05-22T01:30:00Z",
    "pagoEm": "2026-04-22T01:31:12Z",
    "checkoutUrl": "https://www.mercadopago.com.br/checkout/v1/redirect?..."
  }
]
```

### Mapeamento de status para UI

- `GERADO`: aguardando pagamento.
- `PAGO`: pagamento confirmado.
- `FALHOU`: pagamento rejeitado/falhou.
- `EXPIRADO`: vencido sem pagamento.
- `CANCELADO`: cancelado.

---

## 5) Webhook Mercado Pago (informativo para frontend)

Endpoint backend:

`POST /payment/webhook/mercadopago`

Headers recebidos do MP:

- `x-signature`
- `x-request-id`

Query params:

- `type`
- `data.id` (id do pagamento no Mercado Pago)

O backend:

1. valida assinatura do webhook;
2. consulta pagamento real no MP (`/v1/payments/{id}`);
3. atualiza fatura interna;
4. ativa assinatura quando status pago.

### Impacto no frontend

- frontend nao precisa chamar webhook.
- frontend precisa apenas:
  - redirecionar para checkout;
  - consultar endpoints de painel/faturamento para refletir estado atualizado.

---

## 6) Erros padrao do backend

Formato padrao:

```json
{
  "timestamp": "2026-04-22T02:30:00Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Limite de anuncios do plano atingido. Faca upgrade no painel de planos.",
  "code": "INVALID_ARGUMENT",
  "path": "/marketplace/anuncios"
}
```

Codigos comuns:

- `400 INVALID_ARGUMENT`
- `401 BAD_CREDENTIALS`
- `403 EMAIL_NAO_VERIFICADO`
- `500 INTERNAL_SERVER_ERROR`

---

## 7) Fluxos recomendados no frontend

## 7.1 Fluxo de assinatura do vendedor

1. Abrir tela -> `GET /vendedor/planos`.
2. Usuario escolhe plano.
3. `POST /vendedor/planos/assinar`.
4. Redireciona para `checkoutUrl`.
5. Retorno do MP (`success/pending/failure`) para rota do frontend.
6. Recarrega `GET /vendedor/planos` ate refletir novo status.

Sugestao: polling curto (ex.: a cada 3-5s por ate 60s) apos retorno `success/pending`.

## 7.2 Fluxo administrativo

1. Tela de planos:
  - `GET /admin/marketplace/planos`
  - `PATCH /admin/marketplace/planos/{planoId}` para editar.
2. Tela de faturamento:
  - `GET /admin/marketplace/faturamento`
  - ou `GET /admin/marketplace/faturamento?vendedorId=...`

---

## 8) Regras importantes para nao quebrar UX

- Nao mostrar faturamento no painel de vendedor.
- Sempre tratar data/hora como UTC na API e converter no frontend para local.
- `checkoutUrl` pode mudar por cobranca, nunca cachear permanentemente.
- `assinaturaAtual.status` e a fonte de verdade para estado da conta.
- Se backend retornar erro ao criar anuncio por falta de plano, direcionar usuario para tela de planos.

---

## 9) Checklist de implementacao no frontend

- [ ] Criar pagina de planos do vendedor consumindo `GET /vendedor/planos`.
- [ ] Criar acao de assinatura consumindo `POST /vendedor/planos/assinar`.
- [ ] Implementar redirecionamento para `checkoutUrl`.
- [ ] Criar tela admin de planos (`GET` + `PATCH`).
- [ ] Criar tela admin de faturamento (`GET /admin/marketplace/faturamento`).
- [ ] Tratar estados `GERADO`, `PAGO`, `FALHOU`, `EXPIRADO`, `CANCELADO`.
- [ ] Tratar erros padrao da API com mensagens amigaveis.

