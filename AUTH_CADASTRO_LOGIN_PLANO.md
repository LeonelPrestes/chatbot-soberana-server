# Cadastro e login por e-mail e senha

Este arquivo registra o contrato acordado e o estado da autenticação no backend.

## Contrato frontend/backend

O frontend usa `VITE_API_URL=http://localhost:8081/api`. Os métodos Axios devem continuar com caminhos relativos, como `/auth/login`; não repetir `/api` nesses caminhos. A URL final é `http://localhost:8081/api/auth/login`.

### `POST /api/auth/register`

O frontend envia os dados do formulário, confirmação de senha, configurações opcionais e os aceites:

```json
{
  "name": "Ana Silva",
  "email": "ana@example.com",
  "password": "senha-com-pelo-menos-6-caracteres",
  "passwordConfirmation": "senha-com-pelo-menos-6-caracteres",
  "phone": "+5511999999999",
  "cpf": "12345678901",
  "userType": "student",
  "termsAccepted": true,
  "privacyPolicyAccepted": true,
  "settings": {
    "currency": "BRL",
    "profitMargin": 30,
    "taxRate": 15,
    "cardFee": 2
  }
}
```

`passwordConfirmation` só valida igualdade e nunca é persistida. `termsAccepted` e `privacyPolicyAccepted` precisam ser `true`. O backend registra as datas de aceite e as versões que vêm de `TERMS_VERSION` e `PRIVACY_POLICY_VERSION`; o navegador não escolhe essas versões. O cadastro responde `201` com `{ success: true, data: { user: { id, name, email }, token } }`. E-mail duplicado responde `409`.

### `POST /api/auth/login`

Request: `{ "email": "ana@example.com", "password": "..." }`.

Resposta `200`: o mesmo envelope do cadastro. Credenciais inválidas respondem `401` com mensagem genérica.

### `GET /api/auth/me`

Exige `Authorization: Bearer <jwt>` e retorna `{ id, name, email }`. O JWT é assinado pelo backend com `JWT_SECRET`, inclui `sub` igual ao `User.id` e expira após 7 dias. O frontend não cria o token; recebe-o do cadastro/login e usa-o nas próximas chamadas.

## Estado implementado no backend

- `POST /api/auth/register`: valida campos e aceites, normaliza e-mail, hasheia senha com `bcryptjs`, cria usuário e emite JWT.
- `POST /api/auth/login`: compara senha com `bcryptjs.compare` e emite JWT.
- `GET /api/auth/me`: verifica o token e retorna somente dados públicos.
- As rotas existentes de clínicas, procedimentos e custos foram colocadas sob `/api` também.
- A documentação OpenAPI fica em `/docs/json`; `/api/docs/json` serve o mesmo documento.
- `npm run db:seed` cria/atualiza o usuário de desenvolvimento usando `DEV_USER_EMAIL`, `DEV_USER_PASSWORD` e `DEV_USER_NAME` do `.env`. O seed não salva token. Para obter um JWT de teste, fazer login com essa conta em `POST /api/auth/login`.
- `TERMS_VERSION` e `PRIVACY_POLICY_VERSION` têm fallback `v1-dev`. Configurar os identificadores reais antes de produção.

## Integração do frontend

1. O formulário exige os checkboxes dos Termos de Uso e da Política de Privacidade e envia `termsAccepted` e `privacyPolicyAccepted`. As versões vêm do backend.
2. Após o cadastro, o contexto guarda o token retornado e a tela navega para `/dashboard`, sem pedir outro login.
3. A preservação e o envio da precificação pendente após o cadastro ainda dependem do fluxo e endpoint de precificação, que não existem no backend.
4. O `.env` do frontend aponta para `http://localhost:8081/api` e mantém a documentação em `http://localhost:8081/docs/json`.

## Próximas etapas

- Conectar o fluxo de precificação pendente quando o endpoint de precificação estiver implementado.
- Definir os textos e versões finais dos termos e da política e configurar as variáveis de ambiente.
- Implementar recuperação de senha após configurar um serviço de envio de e-mail.
- Implementar o endpoint e contrato de precificação para concluir o fluxo de visitante: preencher dados, criar conta/login, enviar a precificação autenticada e exibir o resultado.
