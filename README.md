# 📝 Claude Outputs Viewer

目に優しいクリーム色のモダンなデザインで Claude Code の出力を管理・閲覧するローカル Web アプリケーション

![Claude Outputs Viewer](https://img.shields.io/badge/Node.js-18%2B-green) ![License](https://img.shields.io/badge/license-MIT-blue)

## 概要

Claude Codeが生成するナレッジ以外のドキュメント（調査レポート、設計書、説明資料など）を効率的に管理・閲覧するためのローカルWebアプリケーションです。

### 主要機能

- 📁 **自動ファイル監視**: `/Users/tehrani/Documents/claude-outputs/` の新規ファイルを自動検知
- 🔄 **リアルタイム更新**: WebSocketによるライブ更新
- 📝 **Markdownプレビュー**: シンタックスハイライト付きリッチレンダリング
- 🔍 **全文検索**: ファイル名・内容での高速検索
- 🔔 **macOS通知**: 新規ファイル作成時の通知
- 📅 **日付別整理**: 自動的な日付フォルダ管理
- ⚙️ **設定管理**: 通知やブラウザ自動起動の設定

## スクリーンショット

```
┌─────────────────────────────────────────────────────────────┐
│ 📝 Claude Outputs Viewer        🔍 Search...    ⚙️        │
├─────────────────┬───────────────────────────────────────────┤
│ Files by Date   │ Welcome to Claude Outputs Viewer         │
│ ────────────    │                                           │
│ ▼ 2025-07-28 (3)│ Select a file from the sidebar           │
│   📝 design.md  │ to view its contents.                     │
│   📄 report.md  │                                           │
│   📝 notes.md   │     📊 Total Files: 15                   │
│                 │     📅 Date Folders: 5                   │
│ ▼ 2025-07-27 (2)│                                           │
│   📝 spec.md    │                                           │
│   📄 log.txt    │                                           │
└─────────────────┴───────────────────────────────────────────┘
```

## インストール

### 必要条件

- Node.js v18.0.0 以上
- npm (Node.jsに同梱)
- macOS (通知機能用)

### セットアップ

1. **リポジトリのクローン**:
   ```bash
   cd ~/workspace
   git clone [repository] claude-outputs-viewer
   cd claude-outputs-viewer
   ```

2. **自動インストール**:
   ```bash
   ./install.sh
   ```

   または手動インストール:
   ```bash
   npm install
   chmod +x start.sh install.sh
   ```

## 使用方法

## 🚀 クイックスタート

```bash
# ビルド
./build.sh

# サーバー起動
./restart.sh

# サーバー停止
./stop.sh
```

### 従来の方法

```bash
# 推奨方法
./start.sh

# またはnpmで
npm start

# 開発モード（nodemon使用）
npm run dev
```

### アクセス

ブラウザで http://localhost:3333 にアクセス

### ディレクトリ構造

アプリケーションは以下のディレクトリを監視します：

```
/Users/tehrani/Documents/claude-outputs/
├── 2025-07-28/
│   ├── 調査レポート_XXX.md
│   ├── 設計書_YYY.md
│   └── 説明_ZZZ.md
├── 2025-07-29/
│   └── ...
└── latest -> 2025-07-29/  # 最新日付へのシンボリックリンク
```

## 機能詳細

### ファイル監視

- **監視対象**: `/Users/tehrani/Documents/claude-outputs/`
- **対応ファイル**: すべてのテキストファイル（.md推奨）
- **自動検知**: 新規作成、更新、削除を即座に検知

### Webインターフェース

- **日付別ビュー**: カレンダー形式でファイルを整理
- **プレビュー機能**: Markdownのリアルタイムレンダリング
- **Raw表示**: プレーンテキストでの表示切り替え
- **検索機能**: ファイル名と内容での全文検索

### 通知システム

- **macOS通知**: 新規ファイル作成・更新時
- **ブラウザ自動起動**: 新規ファイル検知時（設定可能）
- **トースト通知**: Web UI内でのリアルタイム通知

## API リファレンス

### REST API

```javascript
GET  /api/files          // ファイル一覧取得
GET  /api/files/:date    // 特定日付のファイル一覧
GET  /api/file/:id       // ファイル内容取得（Base64エンコードされたID）
GET  /api/search?q=...   // ファイル検索
POST /api/settings/notifications    // 通知設定
POST /api/settings/auto-open        // 自動起動設定
```

### WebSocket

```javascript
// リアルタイム更新用WebSocket接続
WS /ws

// メッセージタイプ
{
  "type": "file:added|file:changed|file:removed|error",
  "data": { /* ファイル情報 */ }
}
```

## 設定

### 通知設定

Web UIの設定画面（⚙️ボタン）から以下を設定可能：

- **通知の有効/無効**: システム通知のオン/オフ
- **ブラウザ自動起動**: 新規ファイル検知時の自動起動

### 自動起動設定

macOSでのログイン時自動起動：

```bash
# LaunchAgentとして登録
launchctl load ~/Library/LaunchAgents/com.claude-outputs-viewer.plist

# 無効化
launchctl unload ~/Library/LaunchAgents/com.claude-outputs-viewer.plist
```

## 開発

### プロジェクト構成

```
claude-outputs-viewer/
├── src/
│   ├── server.js      # Express.jsサーバー
│   ├── watcher.js     # ファイル監視モジュール
│   └── notifier.js    # 通知モジュール
├── public/
│   ├── index.html     # メインHTML
│   ├── css/style.css  # スタイルシート
│   └── js/app.js      # フロントエンドロジック
├── package.json       # 依存関係
├── start.sh          # 起動スクリプト
├── install.sh        # インストールスクリプト
└── README.md         # このファイル
```

### 依存関係

#### バックエンド
- **Express.js**: Webサーバーフレームワーク
- **chokidar**: ファイル監視ライブラリ
- **node-notifier**: macOS通知機能
- **marked**: Markdownパーサー
- **ws**: WebSocketサーバー

#### フロントエンド
- **Vanilla JavaScript**: フレームワーク不使用
- **marked.js**: クライアント側Markdownレンダリング
- **Prism.js**: シンタックスハイライト

### カスタマイズ

#### 監視ディレクトリの変更

`src/watcher.js` の `watchPath` を変更：

```javascript
this.watchPath = options.watchPath || '/your/custom/path';
```

#### ポート番号の変更

`src/server.js` の `port` を変更：

```javascript
this.port = options.port || 3333;
```

## トラブルシューティング

### よくある問題

1. **ポート3333が使用中**
   ```bash
   # プロセスを確認
   lsof -i :3333
   # 強制終了
   kill -9 <PID>
   ```

2. **Node.jsバージョンエラー**
   ```bash
   # バージョン確認
   node -v
   # v18以上が必要
   ```

3. **通知が表示されない**
   - macOSの通知設定を確認
   - 「システム環境設定」→「通知」で許可

4. **ファイルが検知されない**
   - 監視ディレクトリのパスを確認
   - ファイルの権限を確認

### ログの確認

```bash
# サーバーログ
tail -f /tmp/claude-outputs-viewer.log

# エラーログ
tail -f /tmp/claude-outputs-viewer.error.log
```

## ライセンス

MIT License - 詳細は [LICENSE](LICENSE) ファイルを参照

## コントリビューション

1. このリポジトリをフォーク
2. フィーチャーブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add amazing feature'`)
4. ブランチをプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

## 更新履歴

### v1.0.0 (2025-07-28)
- 初回リリース
- ファイル監視機能
- Webインターフェース
- macOS通知機能
- 検索機能
- 設定管理

## サポート

問題や提案がある場合は、GitHubのIssueを作成してください。

---

**Made with ❤️ by Claude Code Knowledge Management System Extension**