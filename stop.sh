#!/bin/bash

# Claude Outputs Viewer 停止スクリプト

echo "🛑 Claude Outputs Viewer を停止中..."

# PIDファイルから停止
if [ -f "server.pid" ]; then
    PID=$(cat server.pid)
    if kill -0 "$PID" 2>/dev/null; then
        echo "📴 プロセス $PID を停止中..."
        kill "$PID"
        sleep 2
        
        # 強制終了が必要な場合
        if kill -0 "$PID" 2>/dev/null; then
            echo "⚡ 強制終了中..."
            kill -9 "$PID"
        fi
        
        rm -f server.pid
        echo "✅ サーバーが停止されました"
    else
        echo "⚠️  プロセス $PID は既に停止しています"
        rm -f server.pid
    fi
else
    echo "📄 PIDファイルが見つかりません。プロセス名で検索中..."
fi

# プロセス名で検索して停止
pkill -f "node src/server.js" 2>/dev/null && echo "✅ 残りのプロセスも停止されました" || echo "ℹ️  他に実行中のプロセスはありません"

# ポート確認
if lsof -ti:3333 >/dev/null 2>&1; then
    echo "⚠️  ポート 3333 がまだ使用されています"
    lsof -ti:3333 | xargs kill -9 2>/dev/null || true
    echo "✅ ポート 3333 を解放しました"
fi

echo "🏁 Claude Outputs Viewer が完全に停止されました"