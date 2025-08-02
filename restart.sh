#!/bin/bash

# Claude Outputs Viewer 再起動スクリプト

echo "🔄 Claude Outputs Viewer を再起動中..."

# 既存のプロセスを停止
echo "📴 既存のサーバーを停止中..."
pkill -f "node src/server.js" 2>/dev/null || true
sleep 2

# CSS をビルド
echo "🎨 CSS をビルド中..."
if [ -f "./node_modules/.bin/tailwindcss" ]; then
    ./node_modules/.bin/tailwindcss -i ./src/input.css -o ./public/css/style.css
else
    echo "⚠️  Tailwind CSS が見つかりません。既存の CSS を使用します。"
fi

# サーバーを起動
echo "🚀 サーバーを起動中..."
nohup node src/server.js > server.log 2>&1 &

# プロセスIDを保存
echo $! > server.pid

sleep 3

# 起動確認
if curl -s -o /dev/null -w "%{http_code}" http://localhost:3333 | grep -q "200"; then
    echo "✅ Claude Outputs Viewer が正常に起動しました!"
    echo "🌐 http://localhost:3333 でアクセスできます"
    echo "📋 プロセスID: $(cat server.pid)"
else
    echo "❌ サーバーの起動に失敗しました"
    echo "📄 ログを確認してください: tail -f server.log"
    exit 1
fi