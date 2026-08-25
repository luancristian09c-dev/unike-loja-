# UNIKE Admin

Projeto React/Vite preparado a partir do arquivo `unike-admin.jsx`.

## Rodar no computador

1. Instale Node.js.
2. Abra o terminal nesta pasta.
3. Execute:

```bash
npm install
npm run dev
```

## Gerar o build

```bash
npm run build
```

A versão pronta para publicação ficará na pasta `dist`.

## GitHub Pages

Para publicar, o ideal é usar o workflow do GitHub Actions para executar `npm install` e `npm run build` e publicar a pasta `dist`.

### Observação importante

O código original utilizava `window.storage`, que não é uma API padrão do navegador. Nesta versão foi criada uma compatibilidade usando `localStorage`, mantendo a interface `get/set` usada pelo componente. Isso faz os dados funcionarem no navegador, mas o armazenamento fica local ao navegador/dispositivo, não compartilhado entre usuários ou entre dois sites.
