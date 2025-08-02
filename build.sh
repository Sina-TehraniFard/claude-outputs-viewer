#!/bin/bash

# Claude Outputs Viewer ビルドスクリプト

echo "🔨 Claude Outputs Viewer をビルド中..."

# 依存関係の確認
echo "📦 依存関係を確認中..."
if [ ! -d "node_modules" ]; then
    echo "📥 npm install を実行中..."
    npm install
fi

# CSS ビルド
echo "🎨 Tailwind CSS をビルド中..."
if [ -f "./node_modules/.bin/tailwindcss" ]; then
    ./node_modules/.bin/tailwindcss -i ./src/input.css -o ./public/css/style.css
    echo "✅ CSS ビルド完了"
else
    echo "❌ Tailwind CSS が見つかりません"
    echo "📥 Tailwind CSS をインストール中..."
    npm install tailwindcss
    ./node_modules/.bin/tailwindcss -i ./src/input.css -o ./public/css/style.css
fi

# ファイル権限設定
echo "🔐 実行権限を設定中..."
chmod +x restart.sh stop.sh build.sh

echo "✅ ビルド完了!"
echo "🚀 ./restart.sh でサーバーを起動できます"
echo "🛑 ./stop.sh でサーバーを停止できます"