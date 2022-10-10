![EXDeck](https://user-images.githubusercontent.com/66313777/128413639-b654dffb-e0e7-497a-b376-2c6eb4da5998.gif)

# Backend for EXDeck

[EXDeck](https://exdeck.jp/)は、軽量なマルチカラムのTwitterクライアントです。

## 関連リポジトリ

- フロントエンド [exdeck-frontend](https://github.com/EXDeck/exdeck-frontend)
- バックエンド [exdeck-backend](https://github.com/EXDeck/exdeck-backend) (このリポジトリ)

## 必要要件

- Node.js Version Manager ([fnm](https://fnm.vercel.app/)を推奨)
- [Node.js](https://nodejs.org/) LTS
- [pnpm](https://pnpm.io/)

## インストール

以下のコマンドを実行します。

```sh
git clone https://github.com/EXDeck/exdeck-backend.git
cd exdeck-backend
pnpm install
```

## 使い方

`.env`ファイルを作成します。
`.env`では以下の内容が設定可能です。
これらのうち`CK`および`CS`は設定が必須です。他の項目は必要に応じて設定してください。

```
CK=[your twitter API consumer key]
CS=[your twitter API consumer secret]
ORIGIN=[frontend origin / defalut: https://localhost:3000]
PORT=[listening port / defalut: 3000]
SSL=[using SSL (true/false)]
C_HTTPONLY=[cookie http only option (true/false)]
C_SECURE=[cookie secure option (true/false)]
C_SAMESITE=[cookie samesite option (strict/lax/none) / default: strict]
C_DOMAIN=[cookie domain option]
C_MAXAGE=[cookie max age option]
```

ローカルのSSL証明書を使用する場合は以下の手順で証明書を発行してください。

1. [mkcert](https://github.com/FiloSottile/mkcert)のインストール
2. `mkcert --install && mkcert localhost`

### 開発用サーバーの起動

以下のコマンドを実行します。

```sh
pnpm dev
```

### サーバーの起動

以下のコマンドを実行します。

```sh
pnpm bs
```

### ビルド

以下のコマンドを実行します。

```sh
pnpm build
```

## ライセンス

Copyright (c) 2022 EXDeck <https://github.com/EXDeck>

このソフトウェアは、[MIT License](./LICENSE)に基づき配布しています。
