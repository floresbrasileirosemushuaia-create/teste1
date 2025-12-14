# Fix do 404 em /api/gas no Vercel

## Sintoma no Console
- `Failed to load resource: the server responded with a status of 404 (/api/gas)`

Isso significa: **o endpoint serverless não existe no deploy**.

## Causas mais comuns
1) Você não criou o arquivo **no caminho exato**:
- `api/gas.js` (minúsculo, dentro da pasta `api` na raiz do repo)

2) O arquivo existe mas está em formato incompatível com o runtime (ex.: `export default` sem `type: module`)
- Solução: use o `gas.js` CommonJS (module.exports) que enviei.

## Como corrigir (passo a passo)
1) No seu repo (raiz), crie:
```
/api
  gas.js
index.html
```

2) Cole o conteúdo do arquivo **gas.js** (CommonJS) que enviei.

3) Faça commit/push.

4) No Vercel:
- Redeploy (ou espere o deploy automático).

5) Teste direto:
- Abra no navegador: `https://SEU_DOMINIO.vercel.app/api/gas`
  - Deve responder JSON `{"ok":false,"error":"METHOD_NOT_ALLOWED"}` (isso prova que a rota existe).

6) Só depois teste o site normal (catálogo).

## Env var (opcional)
No Vercel → Settings → Environment Variables:
- `GAS_WEBAPP_URL` = sua URL `/exec` do Apps Script
