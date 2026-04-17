/** Cookie onde o access token é guardado após o login (legível pelo JS para montar o header Authorization). */
export const AUTH_TOKEN_COOKIE = "nulance_access_token";

/** Epoch em ms (string) — fim de validade do access token conforme `expiresIn` do login/refresh. */
export const AUTH_ACCESS_EXP_MS_COOKIE = "nulance_access_exp_ms";

/** Refresh token (quando o backend enviar no login ou no refresh). */
export const AUTH_REFRESH_TOKEN_COOKIE = "nulance_refresh_token";

/** Prefixo Bearer nas requisições autenticadas. */
export const AUTH_HEADER_SCHEME = "Bearer";

/** Código de erro no JSON do backend quando o login é recusado por e-mail não confirmado. */
export const API_ERROR_EMAIL_NAO_VERIFICADO = "EMAIL_NAO_VERIFICADO";

/** Login recusado por credenciais inválidas (`GlobalExceptionHandler` / Spring Security). */
export const API_ERROR_BAD_CREDENTIALS = "BAD_CREDENTIALS";
