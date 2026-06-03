# Bolao Copa 2026

App web completo para o bolao da Copa do Mundo 2026.

## Paginas

- `/` — Participantes dao seus palpites
- `/ranking.html` — Ranking ao vivo (atualiza a cada 30s)
- `/admin.html` — Admin lanca resultados oficiais (senha: admin2026)

## Como publicar no Glitch

1. Acesse glitch.com e crie uma conta gratuita
2. Clique em "New Project" > "Import from GitHub"
3. Ou clique em "glitch.new" e selecione "hello-express"
4. Apague os arquivos existentes e suba os arquivos desta pasta

## Estrutura

```
server.js        — servidor Node.js com API
public/
  index.html     — tela de palpites
  ranking.html   — ranking ao vivo
  admin.html     — painel do administrador
package.json     — dependencias
```

## Senha do admin

`admin2026` — troque no arquivo server.js antes de publicar
