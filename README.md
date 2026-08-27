# UNIKE — projetos separados

Este pacote transforma os dois arquivos JSX recebidos em dois projetos React + Vite + Capacitor separados:

- `unike-loja`: loja para clientes.
- `unike-admin`: painel administrativo.

## Firebase

Os dois projetos usam o mesmo Firestore. Antes de executar:

1. No Firebase Console, crie/abra seu projeto.
2. Adicione um app Web ao projeto.
3. Copie as configurações do Firebase para o arquivo `.env` de cada projeto.
4. No Firestore, crie o banco.
5. Para o primeiro teste, configure as regras com cuidado. Não deixe o painel Admin público sem autenticação.

## Rodar no navegador

Em cada pasta:

```bash
npm install
npm run dev
```

## Android

Depois de instalar as dependências:

```bash
npm run build
npx cap add android
npx cap sync
npx cap open android
```

O Android Studio abrirá a pasta `android`.

## iPhone

O código é compatível com Capacitor/iOS, mas a compilação nativa do iPhone precisa de macOS + Xcode. Em Windows, você pode desenvolver normalmente e depois gerar a versão iOS em um Mac/serviço de build compatível.

## Importante

Os arquivos originais usavam `window.storage`, recurso de artefato do ambiente onde foram criados. Nesta versão ele foi substituído por Firestore, permitindo que Loja e Admin compartilhem os mesmos produtos, preços, categorias e estoque.

O desconto de estoque continua sendo feito pela Loja, mas para produção recomendamos trocar a escrita direta por uma Cloud Function/transaction segura para evitar duas compras simultâneas reduzirem o estoque de forma incorreta.
